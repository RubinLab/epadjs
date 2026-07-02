import {
  addToGrid,
  getSingleSerie,
  changeActivePort,
  clearSelection,
  jumpToAim,
  alertViewPortFull,
  clearGrid,
  clearPageOrderSeries,
  clearMammogramSeries,
} from '../annotationsList/action';

/**
 * Returns true when the app is in lite mode AND every series in the filtered
 * array is a mammogram (MG). Pass only the isSupportedModality-filtered list.
 */
export const isMammogramStudy = (seriesArray) => {
  console.log(" ------ Checking mammogram ------", seriesArray);
  if (sessionStorage.getItem('mode') !== 'teaching') return false;
  console.log('after mode check')
  if (!Array.isArray(seriesArray) || seriesArray.length === 0) return false;
  console.log('after Array check')
  const mGVerified = seriesArray.every(s => s.examType?.toUpperCase() === 'MG');
  console.log(' ---> mGVerified', mGVerified)
  return mGVerified;
};

/**
 * Finds a series by UID in the open series list.
 * @returns {{ isOpen: boolean, index: number }}
 */
export const findInOpenSeries = (seriesUID, openSeries) => {
  const index = openSeries.findIndex(s => s && s.seriesUID === seriesUID);
  return { isOpen: index !== -1, index };
};

/** The studyUID of the currently open study (first non-null port), or null. */
export const getOpenStudyUID = (openSeries = []) => {
  const open = (openSeries || []).find(s => s && s.studyUID);
  return open ? open.studyUID : null;
};

/**
 * True when a study is already open AND the incoming series belong to a
 * different study. Only one study may be open at a time (see the one-study
 * model); opening a different one requires closing the current one first.
 * Incoming series are always from a single study, so the first entry decides.
 */
export const isDifferentStudyOpen = (seriesArr, openSeries = []) => {
  const openStudyUID = getOpenStudyUID(openSeries);
  if (!openStudyUID) return false;
  const arr = Array.isArray(seriesArr) ? seriesArr : [seriesArr];
  const incoming = arr.find(s => s && s.studyUID);
  if (!incoming) return false;
  return incoming.studyUID !== openStudyUID;
};

/**
 * Fully tears down the current study before a new one is opened: clears the
 * grid, pagination state (pageOrder + mammogram), and the per-viewport session
 * storage (invert map, image status, window/level). Consolidates the reset that
 * was previously duplicated in selectSerieModal.closeAllSeries and
 * sideBarWorklist.handleOpenClick.
 */
export const resetForNewStudy = (dispatch) => {
  dispatch(clearGrid());
  dispatch(clearPageOrderSeries());
  dispatch(clearMammogramSeries());
  sessionStorage.setItem('invertMap', JSON.stringify({}));
  sessionStorage.setItem('imgStatus', JSON.stringify([]));
  sessionStorage.removeItem('wwwc');
};

/**
 * Fires the app-level confirmation that closes the current study and opens the
 * pending one. App.js listens for `confirmSwitchStudy` and, on approval, calls
 * resetForNewStudy then re-invokes openSeriesInDisplay with force: true.
 */
export const requestStudySwitch = (pendingOpen) => {
  window.dispatchEvent(
    new CustomEvent('confirmSwitchStudy', { detail: { pendingOpen } })
  );
};

/**
 * Opens one or more DICOM series in the display view.
 *
 * Handles the dispatch+navigate sequence shared across all entry points:
 * already-open detection, viewport capacity check, addToGrid/getSingleSerie
 * dispatches, and navigation. Component-specific concerns — fetching series
 * from the API, filtering by modality, managing modal state — remain in the
 * calling component.
 *
 * @param {Object}           options
 * @param {Function}         options.dispatch       Redux dispatch
 * @param {Function}         options.navigate       Navigate to /display; pass () => {} when already there
 * @param {Array}            options.openSeries     Currently open series from Redux state
 * @param {Array|Object}     options.series         Series object(s) to open; each may carry aimID/aimUID
 * @param {string}           [options.aimID]        Aim ID — overrides per-series aimID/aimUID when provided
 * @param {string}           [options.worklistID]   Passed through to addToGrid
 * @param {Array|Function}   [options.existingData] Cached image data for the study; pass a
 *                                                  function (serie) => data for per-serie caching
 * @param {Function}         [options.onGridFull]   Called with the pending series array when there
 *                                                  is no room; defaults to alertViewPortFull
 * @returns {Promise|undefined}
 */
export const openSeriesInDisplay = ({
  dispatch,
  navigate,
  openSeries,
  series,
  aimID = null,
  worklistID = null,
  existingData = null,
  onGridFull = null,
  onDefer = null,
  force = false,
}) => {
  const maxPort = parseInt(sessionStorage.getItem('maxPort'));
  const seriesArr = Array.isArray(series) ? series : [series];

  // One study at a time: if the incoming series belong to a different study
  // than the one currently open, defer to the app-level confirmation. On
  // approval App.js resets the display and re-invokes this with force: true.
  // onDefer lets the caller clean up (e.g. hide a loading spinner) since the
  // open won't proceed synchronously and there's no navigation to unmount it.
  if (!force && isDifferentStudyOpen(seriesArr, openSeries)) {
    if (onDefer) onDefer();
    requestStudySwitch({
      dispatch,
      navigate,
      series: seriesArr,
      aimID,
      worklistID,
      existingData,
    });
    return;
  }

  const toOpen = [];

  // Activate already-open series and, when an aim is provided, jump to it.
  for (const serie of seriesArr) {
    const { isOpen, index } = findInOpenSeries(serie.seriesUID, openSeries);
    if (isOpen) {
      dispatch(changeActivePort(index));
      const resolvedAimID = aimID || serie.aimID || serie.aimUID || null;
      if (resolvedAimID) dispatch(jumpToAim(serie.seriesUID, resolvedAimID, index));
    } else {
      toOpen.push(serie);
    }
  }

  // All series already open — just navigate.
  if (toOpen.length === 0) {
    dispatch(clearSelection());
    navigate();
    return Promise.resolve();
  }

  // Not enough free viewports.
  if (toOpen.length + openSeries.length > maxPort) {
    if (onGridFull) onGridFull(toOpen);
    else dispatch(alertViewPortFull());
    return;
  }

  const resolveExistingData =
    typeof existingData === 'function' ? existingData : () => existingData;

  const promiseArr = toOpen.map(serie => {
    const resolvedAimID = aimID || serie.aimID || serie.aimUID || null;
    dispatch(addToGrid(serie, resolvedAimID, null, worklistID));
    return dispatch(getSingleSerie(serie, resolvedAimID, null, resolveExistingData(serie)));
  });

  return Promise.all(promiseArr)
    .then(() => {
      dispatch(clearSelection());
      navigate();
    })
    .catch(err => console.error(err));
};
