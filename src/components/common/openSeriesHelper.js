import {
  addToGrid,
  getSingleSerie,
  changeActivePort,
  clearSelection,
  jumpToAim,
  alertViewPortFull,
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
}) => {
  const maxPort = parseInt(sessionStorage.getItem('maxPort'));
  const seriesArr = Array.isArray(series) ? series : [series];
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
