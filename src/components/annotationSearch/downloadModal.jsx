import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import {
  downloadAnnotations,
  downloadAllAnnotations,
} from "../../services/annotationServices";
import { downloadStudies } from "../../services/studyServices";
import { downloadSeries, getSeries } from "../../services/seriesServices";
import { toast } from "react-toastify";
import { clearSelection, storeAimSelectionAll } from "../annotationsList/action";

class DownloadModal extends React.Component {
  state = {
    studyExpanded: false,
    aimExpanded: false,
    seriesExpanded: false,
    summary: false,
    aim: false,
    seg: false,
    expandedStudies: new Set(),
    loadedSeries: {},
    loadingStudies: new Set(),
    checkedSeries: {},
  };

  componentDidUpdate(prevProps) {
    if (this.props.show && !prevProps.show) {
      const checkedSeries = {};
      (this.props.selectedStudies || []).forEach(s => {
        checkedSeries[s.studyUID] = new Set();
      });
      this.setState({
        studyExpanded: false,
        aimExpanded: false,
        seriesExpanded: false,
        summary: false,
        aim: false,
        seg: false,
        expandedStudies: new Set(),
        loadedSeries: {},
        loadingStudies: new Set(),
        checkedSeries,
      });
    }
  }

  triggerBrowserDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.style = "display: none";
    link.href = url;
    link.download = `${fileName}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  handleStudyDownload = () => {
    const { selectedStudies, pid } = this.props;
    const bodyArr = selectedStudies.map(el => ({
      study: el.studyUID,
      subject: el.patientID,
    }));
    downloadStudies(pid, bodyArr)
      .then(result => {
        const blob = new Blob([result.data], { type: "application/zip" });
        this.triggerBrowserDownload(blob, "Downloaded_studies");
      })
      .catch(err => console.error(err));
    this.props.onCancel();
  };

  onAimOptionChange = e => {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
  };

  handleAimDownload = () => {
    const { summary, aim, seg } = this.state;
    const { pid } = this.props;
    let annsToDownload = [];
    if (Object.keys(this.props.multipageAimSelection).length > 0) {
      for (let page in this.props.multipageAimSelection) {
        annsToDownload = annsToDownload.concat(
          Object.keys(this.props.multipageAimSelection[page])
        );
      }
    } else if (Object.keys(this.props.selectedAnnotations).length > 0) {
      annsToDownload = Object.keys(this.props.selectedAnnotations);
    }
    const aimList = Array.isArray(annsToDownload)
      ? annsToDownload
      : Object.keys(annsToDownload);
    const promise = pid
      ? downloadAnnotations({ summary, aim, seg }, aimList, pid)
      : downloadAllAnnotations({ summary, aim, seg }, aimList);
    promise
      .then(result => {
        const blob = new Blob([result.data], { type: "application/zip" });
        this.triggerBrowserDownload(blob, "Annotations");
        this.props.dispatch(storeAimSelectionAll(null, null, null, true));
        this.props.dispatch(clearSelection());
        this.props.onSubmit();
        this.setState({ summary: false, aim: false, seg: false });
      })
      .catch(err => {
        console.error(err);
        this.props.dispatch(storeAimSelectionAll(null, null, null, true));
        this.props.dispatch(clearSelection());
        if (err.response && err.response.status === 503) {
          toast.error("Select a download format!", { autoClose: false });
        }
        this.setState({ summary: false, aim: false, seg: false });
      });
    this.props.onCancel();
  };

  toggleStudy = async study => {
    const { studyUID, patientID, projectID } = study;
    const { expandedStudies, loadedSeries, loadingStudies } = this.state;

    if (expandedStudies.has(studyUID)) {
      const next = new Set(expandedStudies);
      next.delete(studyUID);
      this.setState({ expandedStudies: next });
      return;
    }

    const nextExpanded = new Set(expandedStudies);
    nextExpanded.add(studyUID);
    this.setState({ expandedStudies: nextExpanded });

    if (!loadedSeries[studyUID] && !loadingStudies.has(studyUID)) {
      const nextLoading = new Set(loadingStudies);
      nextLoading.add(studyUID);
      this.setState({ loadingStudies: nextLoading });

      try {
        const { data: series } = await getSeries(projectID, patientID, studyUID);
        this.setState(state => {
          const doneLoading = new Set(state.loadingStudies);
          doneLoading.delete(studyUID);
          const checkedSeries = { ...state.checkedSeries };
          if (!checkedSeries[studyUID]) checkedSeries[studyUID] = new Set();
          return {
            loadedSeries: { ...state.loadedSeries, [studyUID]: series },
            loadingStudies: doneLoading,
            checkedSeries,
          };
        });
      } catch (err) {
        console.error(err);
        this.setState(state => {
          const doneLoading = new Set(state.loadingStudies);
          doneLoading.delete(studyUID);
          return { loadingStudies: doneLoading };
        });
      }
    }
  };

  toggleSeriesCheck = (studyUID, seriesUID) => {
    this.setState(state => {
      const set = new Set(state.checkedSeries[studyUID] || []);
      if (set.has(seriesUID)) set.delete(seriesUID);
      else set.add(seriesUID);
      return { checkedSeries: { ...state.checkedSeries, [studyUID]: set } };
    });
  };

  toggleSelectAll = (studyUID, series) => {
    this.setState(state => {
      const set = state.checkedSeries[studyUID] || new Set();
      const allChecked =
        series.length > 0 && series.every(sr => set.has(sr.seriesUID));
      const newSet = allChecked
        ? new Set()
        : new Set(series.map(sr => sr.seriesUID));
      return { checkedSeries: { ...state.checkedSeries, [studyUID]: newSet } };
    });
  };

  getTotalCheckedSeries = () =>
    Object.values(this.state.checkedSeries).reduce((n, s) => n + s.size, 0);

  handleSeriesDownload = () => {
    const { selectedStudies, pid } = this.props;
    const { checkedSeries, loadedSeries } = this.state;
    const bodyArr = [];
    selectedStudies.forEach(study => {
      const series = loadedSeries[study.studyUID] || [];
      const checked = checkedSeries[study.studyUID] || new Set();
      series.forEach(sr => {
        if (checked.has(sr.seriesUID)) {
          bodyArr.push({
            series: sr.seriesUID,
            study: study.studyUID,
            subject: study.patientID,
          });
        }
      });
    });
    downloadSeries(pid, bodyArr)
      .then(result => {
        const blob = new Blob([result.data], { type: "application/zip" });
        this.triggerBrowserDownload(blob, "Downloaded_series");
      })
      .catch(err => console.error(err));
    this.props.onCancel();
  };

  handleCancel = () => {
    this.props.onCancel();
  };

  renderStudyBlock = study => {
    const { studyUID, studyDescription, patientID, patientName } = study;
    const { expandedStudies, loadingStudies, loadedSeries, checkedSeries } =
      this.state;
    const expanded = expandedStudies.has(studyUID);
    const loading = loadingStudies.has(studyUID);
    const series = loadedSeries[studyUID];
    const checkedSet = checkedSeries[studyUID] || new Set();

    return (
      <div
        key={studyUID}
        className={`dm-study-block${expanded ? " dm-study-block--expanded" : ""}`}
      >
        <div
          className="dm-study-head"
          onClick={() => this.toggleStudy(study)}
        >
          <div className="dm-study-head__left">
            <span className="dm-study-chev" />
            <div>
              <div className="dm-study-name">
                {patientName || patientID} &middot;{" "}
                {studyDescription || "Unnamed Study"}
              </div>
            </div>
          </div>
          <span className="dm-study-count">
            {checkedSet.size}/{series ? series.length : "…"}
          </span>
        </div>

        {expanded && (
          <div className="dm-study-series">
            {loading ? (
              <div className="dm-row-dim">Loading series…</div>
            ) : !series || series.length === 0 ? (
              <div className="dm-row-dim">No series available.</div>
            ) : (
              <>
                <div className="dm-select-all-row">
                  <input
                    type="checkbox"
                    id={`dm-selall-${studyUID}`}
                    checked={
                      series.length > 0 &&
                      series.every(sr => checkedSet.has(sr.seriesUID))
                    }
                    onChange={() => this.toggleSelectAll(studyUID, series)}
                  />
                  <label htmlFor={`dm-selall-${studyUID}`}>
                    Select all ({series.length})
                  </label>
                </div>
                {series.map(sr => (
                  <div key={sr.seriesUID} className="dm-series-row">
                    <input
                      type="checkbox"
                      id={`dm-sr-${studyUID}-${sr.seriesUID}`}
                      checked={checkedSet.has(sr.seriesUID)}
                      onChange={() =>
                        this.toggleSeriesCheck(studyUID, sr.seriesUID)
                      }
                    />
                    <label htmlFor={`dm-sr-${studyUID}-${sr.seriesUID}`}>
                      <span className="dm-series-desc">
                        {sr.seriesDescription || "Unnamed Series"}
                      </span>
                      <span className="dm-series-id">{sr.seriesUID}</span>
                    </label>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  render() {
    const { show, selectedStudies } = this.props;
    const { studyExpanded, aimExpanded, seriesExpanded, summary, aim, seg } = this.state;

    const studies = selectedStudies || [];
    const aimFormatCount = [summary, aim, seg].filter(Boolean).length;
    const hasAims =
      Object.keys(this.props.multipageAimSelection).length > 0 ||
      Object.keys(this.props.selectedAnnotations).length > 0;
    const totalSeries = this.getTotalCheckedSeries();

    return (
      <Modal
        show={show}
        onHide={this.handleCancel}
        dialogClassName="download-modal"
        centered
      >
        <Modal.Header className="modal-header dm-header">
          <div>
            <Modal.Title className="annDownload__header">Download</Modal.Title>
            <div className="dm-subhead">
              {studies.length} {studies.length === 1 ? "study" : "studies"}{" "}
              selected
            </div>
          </div>
          <button
            className="dm-close"
            onClick={this.handleCancel}
            aria-label="Close"
          >
            &times;
          </button>
        </Modal.Header>

        <Modal.Body className="notification-modal dm-body">
          {/* Study Download */}
          <div
            className={`dm-section${studyExpanded ? " dm-section--expanded" : ""}`}
          >
            <div className="dm-section__row">
              <button
                className="dm-section__toggle"
                onClick={() =>
                  this.setState(s => ({ studyExpanded: !s.studyExpanded }))
                }
              >
                <span className="dm-section__title">Study Download</span>
                <span className="dm-chev" />
              </button>
              <span className="dm-section__hint">
                {studies.length} {studies.length === 1 ? "study" : "studies"} selected
              </span>
            </div>
            {studyExpanded && (
              <div className="dm-section__panel">
                {studies.length === 0 ? (
                  <div className="dm-row-dim">No studies selected.</div>
                ) : (
                  studies.map(s => (
                    <div key={s.studyUID} className="dm-series-row">
                      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.35 }}>
                        <span className="dm-series-desc">
                          {this.props.showingPHI
                            ? (s.patientName || s.patientID)
                            : s.patientID}
                        </span>
                        {this.props.showingPHI &&
                          s.annotationNames &&
                          s.annotationNames.length > 0 && (
                            <span className="dm-series-id">
                              {s.annotationNames.join(", ")}
                            </span>
                          )}
                      </span>
                    </div>
                  ))
                )}
                <div className="dm-panel-footer">
                  <span className="dm-footer-hint">
                    {studies.length} {studies.length === 1 ? "study" : "studies"}
                  </span>
                  <button
                    className="dm-btn-primary"
                    disabled={studies.length === 0}
                    onClick={this.handleStudyDownload}
                  >
                    Download Studies ({studies.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AIM Download */}
          <div
            className={`dm-section${aimExpanded ? " dm-section--expanded" : ""}`}
          >
            <div className="dm-section__row">
              <button
                className="dm-section__toggle"
                onClick={() =>
                  this.setState(s => ({ aimExpanded: !s.aimExpanded }))
                }
              >
                <span className="dm-section__title">Aim Download</span>
                <span className="dm-chev" />
              </button>
              <span className="dm-section__hint">
                Summary, AIM, segmentation
              </span>
            </div>
            {aimExpanded && (
              <div className="dm-section__panel">
                {[
                  { name: "summary", label: "Summary" },
                  { name: "aim", label: "AIM Document" },
                  { name: "seg", label: "DICOM segmentation object" },
                ].map(({ name, label }) => (
                  <div key={name} className="dm-check-row">
                    <input
                      type="checkbox"
                      id={`dm-aim-${name}`}
                      name={name}
                      checked={this.state[name]}
                      onChange={this.onAimOptionChange}
                    />
                    <label htmlFor={`dm-aim-${name}`}>{label}</label>
                  </div>
                ))}
                <div className="dm-panel-footer">
                  <span className="dm-footer-hint">
                    {aimFormatCount === 0
                      ? "Select a format to enable download"
                      : `${aimFormatCount} format${aimFormatCount > 1 ? "s" : ""} selected`}
                  </span>
                  <button
                    className="dm-btn-primary"
                    disabled={aimFormatCount === 0 || !hasAims}
                    onClick={this.handleAimDownload}
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Series Download */}
          <div
            className={`dm-section dm-section--last${seriesExpanded ? " dm-section--expanded" : ""}`}
          >
            <div className="dm-section__row">
              <button
                className="dm-section__toggle"
                onClick={() =>
                  this.setState(s => ({ seriesExpanded: !s.seriesExpanded }))
                }
              >
                <span className="dm-section__title">Series Download</span>
                <span className="dm-chev" />
              </button>
              <span className="dm-section__hint">Pick series per study</span>
            </div>
            {seriesExpanded && (
              <div className="dm-section__panel">
                {studies.map(study => this.renderStudyBlock(study))}
                <div className="dm-panel-footer">
                  <span className="dm-footer-hint">
                    {totalSeries === 0
                      ? "No series selected"
                      : `${totalSeries} series selected`}
                  </span>
                  <button
                    className="dm-btn-primary"
                    disabled={totalSeries === 0}
                    onClick={this.handleSeriesDownload}
                  >
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

DownloadModal.propTypes = {
  show: PropTypes.bool,
  selectedStudies: PropTypes.array,
  pid: PropTypes.string,
  showingPHI: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedAnnotations: PropTypes.object,
  multipageAimSelection: PropTypes.object,
};

const mapStateToProps = state => ({
  selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
  multipageAimSelection: state.annotationsListReducer.multipageAimSelection,
});

export default connect(mapStateToProps)(DownloadModal);
