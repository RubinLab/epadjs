import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
import { wwwcCursor } from './cursors/index.js';
import { default as calculateSUV, reverseSUV } from '../util/calculateSUV.js';
import { toWindowLevel, toLowHighRange } from '../util/windowLevel.js';

const DEFAULT_MULTIPLIER = 4;
const DEFAULT_IMAGE_DYNAMIC_RANGE = 1024;
const PT = 'PT';
/**
 * @public
 * @class WwwcTool
 * @memberof Tools
 *
 * @classdesc Tool for setting wwwc by dragging with mouse/touch.
 * @extends Tools.Base.BaseTool
 */
export default class WwwcTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Wwwc',
      strategies: { basicLevelingStrategy },
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        orientation: 0,
      },
      svgCursor: wwwcCursor,
    };

    super(props, defaultProps);
  }

  mouseDragCallback(evt) {
    this.applyActiveStrategy(evt);
    evt.detail.viewport.voiLUT = undefined;
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }

  touchDragCallback(evt) {
    // Prevent CornerstoneToolsTouchStartActive from killing any press events
    evt.stopImmediatePropagation();
    this.applyActiveStrategy(evt);
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }
}

function getCorrectedValue(image, val, modality) {
  if (modality === 'PT'){
    return calculateSUV(image, val, true) || val;
  }
  return image.maxPixelValue;
}

/**
 * Here we normalize the ww/wc adjustments so the same number of on screen pixels
 * adjusts the same percentage of the dynamic range of the image.  This is needed to
 * provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
 * image will feel the same as a 16 bit image would)
 *
 * @param {Object} evt
 * @param {Object} { orienttion }
 * @returns {void}
 */
function basicLevelingStrategy(evt) {
  const { orientation } = this.configuration;
  const eventData = evt.detail;
  
  let modality = '';
  const cornerstone = external.cornerstone;;
  const seriesModule = cornerstone.metaData.get(
    'generalSeriesModule',
    eventData.image.imageId
  );
  if (seriesModule) {
    modality = seriesModule.modality;
  }
   
  // console.log('eventdata', eventData);
  if (!eventData.viewport.voiRange) {
    // console.log('ww', eventData.viewport.voi.windowWidth, eventData.viewport.voi.windowCenter);
    const range = toLowHighRange(eventData.viewport.voi.windowWidth, eventData.viewport.voi.windowCenter);
    range.lower = getCorrectedValue(eventData.image, range.lower, modality);
    range.upper = getCorrectedValue(eventData.image, range.upper, modality);
    eventData.viewport.voiRange = range;
  }
  // console.log('eventdata after', eventData);
  const isPreScaled = !!calculateSUV(eventData.image, 1000, true);
  // console.log('isPreScaled', isPreScaled, calculateSUV(eventData.image, 1000, true));
  let newRange;
  if (modality === PT && isPreScaled) {
    newRange = getPTScaledNewRange(
      eventData,
      isPreScaled,
    );
  } else {
    newRange = getNewRange(eventData, orientation);
  }
  // If the range is not valid. Do nothing
  if (newRange.lower >= newRange.upper) {
    return;
  }

  eventData.viewport.voiRange = {lower:newRange.lower, upper: newRange.upper};
  eventData.viewport.voi.windowWidth = newRange.windowWidth;
  eventData.viewport.voi.windowCenter = newRange.windowCenter;

  window.dispatchEvent(
    // new CustomEvent("updateWL", { detail: { wc: eventData.viewport.voi.windowCenter, ww: eventData.viewport.voi.windowWidth } })
    new CustomEvent("updateImageStatus", { detail: { tool: 'wwwc', type: 'wwwc', value: { wc: eventData.viewport.voi.windowCenter, ww: eventData.viewport.voi.windowWidth } } })
  );

}

function getNewRange(eventData, orientation) {
  // old version   
  // const multiplier = getMultiplierDynamicRange(eventData.image);
  // const deltaX = eventData.deltaPoints.page.x * multiplier;
  // const deltaY = eventData.deltaPoints.page.y * multiplier;
  // let windowWidth, windowCenter;
  // if (orientation === 0) {
  //   windowWidth = deltaX + eventData.viewport.voi.windowWidth;
  //   windowCenter = deltaY + eventData.viewport.voi.windowCenter;
  // } else {
  //   windowWidth = deltaY + eventData.viewport.voi.windowWidth;
  //   windowCenter = deltaX + eventData.viewport.voi.windowCenter;
  // }
  // return {windowWidth, windowCenter}

  const multiplier = getMultiplierDynamicRange(eventData.image);
  const deltaX = eventData.deltaPoints.page.x * multiplier;
  const deltaY = eventData.deltaPoints.page.y * multiplier;
  let { windowWidth, windowCenter } = toWindowLevel(
    eventData.viewport.voiRange.lower,
    eventData.viewport.voiRange.upper
  );
  if (orientation === 0) {
    windowWidth = deltaX + eventData.viewport.voi.windowWidth;
    windowCenter = deltaY + eventData.viewport.voi.windowCenter;
  } else {
    windowWidth = deltaY + eventData.viewport.voi.windowWidth;
    windowCenter = deltaX + eventData.viewport.voi.windowCenter;
  }
  windowWidth = Math.max(windowWidth, 1);
  // Convert back to range
  return {...toLowHighRange(windowWidth, windowCenter), windowWidth, windowCenter};
}

function getMultiplierDynamicRange(image) {
  const maxVOI =
    image.maxPixelValue * image.slope +
    image.intercept;
  const minVOI =
    image.minPixelValue * image.slope +
    image.intercept;
  const imageDynamicRange = maxVOI - minVOI;
  return imageDynamicRange / DEFAULT_IMAGE_DYNAMIC_RANGE;
}


function getPTScaledNewRange(eventData, isPreScaled) {
  let multiplier;
  if (isPreScaled) {
    multiplier = 5 / eventData.element.clientHeight;
  } else {
    multiplier =
      getMultiplierDynamicRange(eventData.image) ||
      DEFAULT_MULTIPLIER;
  }

  const deltaY = eventData.deltaPoints.page.y;
  const wcDelta = deltaY * multiplier;
  // console.log('before', eventData.viewport.voiRange.lower, eventData.viewport.voiRange.upper, wcDelta, deltaY, multiplier);
  let upper = eventData.viewport.voiRange.upper - wcDelta;
  upper = Math.min(upper, 20);
  // upper = isPreScaled ? Math.max(upper, 0.1) : upper;
  // console.log('after', eventData.viewport.voiRange.lower, upper);
  const range = { lower: eventData.viewport.voiRange.lower, upper };
  return {...range, ...toWindowLevel(
    reverseSUV(eventData.image, range.lower, true) || range.lower,
    reverseSUV(eventData.image, range.upper, true) || range.upper,
  ) };
}