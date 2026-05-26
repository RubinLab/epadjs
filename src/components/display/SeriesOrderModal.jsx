import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { getSeries } from '../../services/seriesServices';
import { setSignificantSeries } from '../../services/seriesServices';
import './SeriesOrderModal.css';

const SLOTS = 4;
const WARN_KEY = 'noSeriesStateWarn';

const hasDisplayState = (serie) =>
  serie.displayState &&
  Object.values(serie.displayState).some(v => v !== null && v !== '' && v !== undefined);

export default function SeriesOrderModal({ show, onClose, projectID, subjectUID, studyUID }) {
  const [pages, setPages] = useState([Array(SLOTS).fill(null)]);
  const [unordered, setUnordered] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragSource, setDragSource] = useState(null);
  const [showStateWarn, setShowStateWarn] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showEmptyWarn, setShowEmptyWarn] = useState(false);
  const [emptyPages, setEmptyPages] = useState([]);
  const [pendingSavePages, setPendingSavePages] = useState(null);
  const stateWarnShown = useRef(false);
  const initialWithState = useRef(new Set());

  useEffect(() => {
    if (show) {
      stateWarnShown.current = false;
      initialWithState.current = new Set();
      setCurrentPage(0);
      setShowStateWarn(false);
      setShowEmptyWarn(false);
      setPendingSavePages(null);
      loadData();
    }
  }, [show]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: seriesArr } = await getSeries(projectID, subjectUID, studyUID);

      const ordered = seriesArr.filter(s => s.significanceOrder != null);
      const unorderedArr = seriesArr.filter(s => s.significanceOrder == null);

      // Track which initially-ordered series have a displayState
      ordered.forEach(s => { if (hasDisplayState(s)) initialWithState.current.add(s.seriesUID); });

      // Build page grid. Series whose significanceOrder overflows a page (e.g. legacy MG
      // data with significanceOrder 1–8 and no pageOrder) wrap to the next page automatically.
      const pageMap = {};
      ordered.forEach(s => {
        const basePage = Math.max((s.pageOrder != null ? s.pageOrder : 1) - 1, 0);
        const slotIdx = (s.significanceOrder || 1) - 1;
        const pageIdx = basePage + Math.floor(slotIdx / SLOTS);
        const effectiveSlot = slotIdx % SLOTS;
        if (!pageMap[pageIdx]) pageMap[pageIdx] = Array(SLOTS).fill(null);
        pageMap[pageIdx][effectiveSlot] = s;
      });

      const maxPage = ordered.length > 0 ? Math.max(...Object.keys(pageMap).map(Number)) : 0;
      const pagesArr = [];
      for (let i = 0; i <= maxPage; i++) {
        pagesArr.push(pageMap[i] || Array(SLOTS).fill(null));
      }

      setPages(pagesArr);
      setUnordered(unorderedArr);
    } catch (err) {
      toast.error('Could not load series data');
    } finally {
      setLoading(false);
    }
  };

  // --- Drag helpers ---

  const handleDragStart = (source) => setDragSource(source);

  const handleDropOnSlot = (targetSlot) => {
    if (!dragSource) return;
    const newPages = pages.map(p => [...p]);
    const newUnordered = [...unordered];
    let draggedSerie;

    if (dragSource.type === 'slot') {
      draggedSerie = newPages[dragSource.page][dragSource.slot];
      newPages[dragSource.page][dragSource.slot] = null;
    } else {
      draggedSerie = newUnordered.splice(dragSource.index, 1)[0];
    }

    const displaced = newPages[currentPage][targetSlot];
    newPages[currentPage][targetSlot] = draggedSerie;

    if (displaced) {
      if (dragSource.type === 'slot') {
        newPages[dragSource.page][dragSource.slot] = displaced;
      } else {
        newUnordered.push(displaced);
        maybeShowStateWarn(displaced);
      }
    }

    setPages(newPages);
    setUnordered(newUnordered);
    setDragSource(null);
  };

  const handleDropOnList = () => {
    if (!dragSource || dragSource.type === 'list') return;
    const newPages = pages.map(p => [...p]);
    const draggedSerie = newPages[dragSource.page][dragSource.slot];
    if (!draggedSerie) return;

    newPages[dragSource.page][dragSource.slot] = null;
    maybeShowStateWarn(draggedSerie);
    setPages(newPages);
    setUnordered(prev => [...prev, draggedSerie]);
    setDragSource(null);
  };

  const maybeShowStateWarn = (serie) => {
    if (stateWarnShown.current) return;
    if (localStorage.getItem(WARN_KEY) === 'true') return;
    if (initialWithState.current.has(serie.seriesUID)) {
      setShowStateWarn(true);
      stateWarnShown.current = true;
    }
  };

  // --- Grid actions ---

  const handleClearGrid = () => {
    const newPages = pages.map(p => [...p]);
    const cleared = newPages[currentPage].filter(Boolean);
    newPages[currentPage] = Array(SLOTS).fill(null);
    cleared.forEach(maybeShowStateWarn);
    setPages(newPages);
    setUnordered(prev => [...prev, ...cleared]);
  };

  const handleAddPage = () => {
    setPages(prev => [...prev, Array(SLOTS).fill(null)]);
    setCurrentPage(pages.length);
  };

  // --- Save ---

  const handleSave = () => {
    // Find empty pages sandwiched between non-empty pages
    const nonEmptyIndices = pages.reduce((acc, p, i) => { if (p.some(Boolean)) acc.push(i); return acc; }, []);
    if (nonEmptyIndices.length > 1) {
      const first = nonEmptyIndices[0];
      const last = nonEmptyIndices[nonEmptyIndices.length - 1];
      const emptyBetween = [];
      for (let i = first + 1; i < last; i++) {
        if (!pages[i].some(Boolean)) emptyBetween.push(i + 1);
      }
      if (emptyBetween.length > 0) {
        setEmptyPages(emptyBetween);
        setPendingSavePages(pages);
        setShowEmptyWarn(true);
        return;
      }
    }
    doSave(pages);
  };

  const doSave = (pagesArr) => {
    const nonEmptyPages = pagesArr.filter(p => p.some(Boolean));
    const payload = [];
    nonEmptyPages.forEach((page, pageIdx) => {
      page.forEach((serie, slotIdx) => {
        if (!serie) return;
        const record = { seriesUID: serie.seriesUID, significanceOrder: slotIdx + 1, pageOrder: pageIdx + 1 };
        if (hasDisplayState(serie)) record.displayState = serie.displayState;
        payload.push(record);
      });
    });
    setSignificantSeries(projectID, subjectUID, studyUID, payload, true)
      .then(() => { toast.success('Series order saved!'); onClose(); })
      .catch(() => toast.error('Could not save series order'));
  };

  // --- Render helpers ---

  const seriesLabel = (serie) =>
    `${serie.seriesNo != null ? serie.seriesNo : '–'} · ${serie.seriesDescription || serie.examType || ''}`;

  const currentSlots = pages[currentPage] || Array(SLOTS).fill(null);

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg" className="series-order-modal">
        <Modal.Header closeButton>
          <Modal.Title>Series Display Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="som-loading">Loading series…</div>
          ) : (
            <>
              {/* Grid + action buttons */}
              <div className="som-grid-row">
                <div className="som-grid">
                  {currentSlots.map((serie, slotIdx) => (
                    <div
                      key={slotIdx}
                      className={`som-slot${serie ? ' som-slot--filled' : ' som-slot--empty'}${dragSource ? ' som-slot--droptarget' : ''}`}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDropOnSlot(slotIdx)}
                    >
                      {serie ? (
                        <span
                          className="som-chip"
                          draggable
                          onDragStart={() => handleDragStart({ type: 'slot', page: currentPage, slot: slotIdx, serie })}
                        >
                          {seriesLabel(serie)}
                        </span>
                      ) : (
                        <span className="som-slot-number">{slotIdx + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="som-grid-actions">
                  <button className="som-btn som-btn--secondary" onClick={handleClearGrid}>Clear Grid</button>
                  <button className="som-btn som-btn--secondary" onClick={handleAddPage}>+ New Page</button>
                </div>
              </div>

              {/* Page navigation */}
              <div className="som-pagination">
                <button
                  className="som-page-nav"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(p => p - 1)}
                >&lt;</button>
                {pages.map((_, i) => (
                  <button
                    key={i}
                    className={`som-page-num${currentPage === i ? ' som-page-num--active' : ''}`}
                    onClick={() => setCurrentPage(i)}
                  >{i + 1}</button>
                ))}
                <button
                  className="som-page-nav"
                  disabled={currentPage === pages.length - 1}
                  onClick={() => setCurrentPage(p => p + 1)}
                >&gt;</button>
              </div>

              <hr className="som-divider" />

              {/* Unordered list */}
              <div
                className="som-unordered"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDropOnList}
              >
                <div className="som-unordered-label">── Unordered Series ──</div>
                {unordered.length === 0 && <div className="som-unordered-empty">All series are assigned to pages.</div>}
                {unordered.map((serie, idx) => (
                  <span
                    key={serie.seriesUID}
                    className="som-chip som-chip--list"
                    draggable
                    onDragStart={() => handleDragStart({ type: 'list', index: idx, serie })}
                  >
                    {seriesLabel(serie)}
                  </span>
                ))}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="som-btn som-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="som-btn som-btn--primary" onClick={handleSave} disabled={loading}>Save Order</button>
        </Modal.Footer>
      </Modal>

      {/* Display state loss warning */}
      {showStateWarn && (
        <Modal show onHide={() => setShowStateWarn(false)} size="sm" className="som-warn-modal">
          <Modal.Header>
            <Modal.Title>⚠ Saved State Will Be Lost</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Moving a series out of the order permanently removes its saved display state (window/level, zoom, invert). This cannot be undone.</p>
            <label className="som-warn-check">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={e => setDontShowAgain(e.target.checked)}
              />
              &nbsp;Don't show this again
            </label>
          </Modal.Body>
          <Modal.Footer>
            <button className="som-btn som-btn--primary" onClick={() => {
              if (dontShowAgain) localStorage.setItem(WARN_KEY, 'true');
              setShowStateWarn(false);
            }}>OK</button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Empty page warning */}
      {showEmptyWarn && (
        <Modal show onHide={() => setShowEmptyWarn(false)} size="sm" className="som-warn-modal">
          <Modal.Header>
            <Modal.Title>⚠ Page {emptyPages[0]} is Empty</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Page {emptyPages[0]} has no series assigned. If you continue, pages will be renumbered:
              Page {emptyPages[0] + 1} will become Page {emptyPages[0]}.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <button className="som-btn som-btn--secondary" onClick={() => setShowEmptyWarn(false)}>Cancel</button>
            <button className="som-btn som-btn--primary" onClick={() => { setShowEmptyWarn(false); doSave(pendingSavePages); }}>Save Anyway</button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}
