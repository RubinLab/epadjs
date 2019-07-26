import external from './../../externalModules.js';

const state = {
  drawColorId: 0,
  radius: 10,
  minRadius: 1,
  maxRadius: 50,
  alpha: 0.4,
  renderBrushIfHiddenButActive: true,
  hiddenButActiveAlpha: 0.2,
  colorMapId: 'BrushColorMap',
  visibleSegmentations: {},
  imageBitmapCache: {},
  segmentationMetadata: {},
};

const setters = {
  /**
   * Sets the brush radius, account for global min/max radius
   *
   * @param {number} radius
   * @returns {void}
   */
  radius: radius => {
    state.radius = Math.min(Math.max(radius, state.minRadius), state.maxRadius);
  },

  /**
   * TODO: Should this be a init config property?
   * Sets the brush color map to something other than the default
   *
   * @param  {Array} colors An array of 4D [red, green, blue, alpha] arrays.
   * @returns {void}
   */
  brushColorMap: colors => {
    const colormap = external.cornerstone.colors.getColormap(state.colorMapId);

    colormap.setNumberOfColors(colors.length);

    for (let i = 0; i < colors.length; i++) {
      colormap.setColor(i, colors[i]);
    }
  },
  elementVisible: enabledElement => {
    if (!external.cornerstone) {
      return;
    }

    const cornerstoneEnabledElement = external.cornerstone.getEnabledElement(
      enabledElement
    );

    const enabledElementUID = cornerstoneEnabledElement.uuid;
    const colormap = external.cornerstone.colors.getColormap(state.colorMapId);
    const numberOfColors = colormap.getNumberOfColors();

    state.visibleSegmentations[enabledElementUID] = [];

    for (let i = 0; i < numberOfColors; i++) {
      state.visibleSegmentations[enabledElementUID].push(true);
    }
  },
  brushVisibilityForElement: (enabledElementUID, segIndex, visible = true) => {
    if (!state.visibleSegmentations[enabledElementUID]) {
      state.imageBitmapCache[enabledElementUID] = [];
    }

    state.visibleSegmentations[enabledElementUID][segIndex] = visible;
  },
  imageBitmapCacheForElement: (enabledElementUID, segIndex, imageBitmap) => {
    if (!state.imageBitmapCache[enabledElementUID]) {
      state.imageBitmapCache[enabledElementUID] = [];
    }

    state.imageBitmapCache[enabledElementUID][segIndex] = imageBitmap;
  },
  clearImageBitmapCacheForElement: enabledElementUID => {
    state.imageBitmapCache[enabledElementUID] = [];
  },
  metadata: (seriesInstanceUid, segIndex, metadata) => {
    if (!state.segmentationMetadata[seriesInstanceUid]) {
      state.segmentationMetadata[seriesInstanceUid] = [];
    }

    state.segmentationMetadata[seriesInstanceUid][segIndex] = metadata;
  },
};

const getters = {
  imageBitmapCacheForElement: enabledElementUID => {
    if (!state.imageBitmapCache[enabledElementUID]) {
      return null;
    }

    return state.imageBitmapCache[enabledElementUID];
  },
  visibleSegmentationsForElement: enabledElementUID => {
    if (!state.visibleSegmentations[enabledElementUID]) {
      return null;
    }

    return state.visibleSegmentations[enabledElementUID];
  },

  /**
   * Retrieves series-specific brush segmentation metadata.
   * @public
   * @function metadata
   * @param {string} seriesInstanceUid - The seriesInstanceUid of the scan.
   * @param {number} [segIndex] - The segmentation index.
   *
   * @returns {Object[]|Object} An array of segmentation metadata, or specifc
   *                            segmentation data if segIndex is defined.
   */
  metadata: (seriesInstanceUid, segIndex) => {
    if (!state.segmentationMetadata[seriesInstanceUid]) {
      return;
    }

    if (segIndex !== undefined) {
      return state.segmentationMetadata[seriesInstanceUid][segIndex];
    }

    return state.segmentationMetadata[seriesInstanceUid];
  },
};

/**
 * EnabledElementCallback - Element specific initilisation.
 * @public
 * @param  {Object} enabledElement - The element on which the module is
 *                                  being initialised.
 * @returns {void}
 */
function enabledElementCallback(enabledElement) {
  setters.elementVisible(enabledElement);
}

/**
 * RemoveEnabledElementCallback - Element specific memory cleanup.
 * @public
 * @param  {Object} enabledElement  The element being removed.
 * @returns {void}
 */
// TODO -> Test this before adding it to the module.
function removeEnabledElementCallback(enabledElement) {
  if (!external.cornerstone) {
    return;
  }

  const cornerstoneEnabledElement = external.cornerstone.getEnabledElement(
    enabledElement
  );

  const enabledElementUID = cornerstoneEnabledElement.uuid;
  const colormap = external.cornerstone.colors.getColormap(state.colorMapId);
  const numberOfColors = colormap.getNumberOfColors();

  // Remove enabledElement specific data.
  delete state.visibleSegmentations[enabledElementUID];
  delete state.imageBitmapCache[enabledElementUID];
}

/**
 * OnRegisterCallback - Initialise the module when a new element is added.
 * @public
 * @returns {void}
 */
function onRegisterCallback() {
  _initDefaultColorMap();
}

export default {
  state,
  onRegisterCallback,
  enabledElementCallback,
  getters,
  setters,
};

const distinctColors = [
  [230, 25, 75, 255],
  [60, 180, 175, 255],
  [255, 225, 25, 255],
  [0, 130, 200, 255],
  [245, 130, 48, 255],
  [145, 30, 180, 255],
  [70, 240, 240, 255],
  [240, 50, 230, 255],
  [210, 245, 60, 255],
  [250, 190, 190, 255],
  [0, 128, 128, 255],
  [230, 190, 255, 255],
  [170, 110, 40, 255],
  [255, 250, 200, 255],
  [128, 0, 0, 255],
  [170, 255, 195, 255],
  [128, 128, 0, 255],
  [255, 215, 180, 255],
  [0, 0, 128, 255],
];

let colorPairIndex = 0;

function _initDefaultColorMap() {
  const defaultSegmentationCount = 19;
  const colormap = external.cornerstone.colors.getColormap(state.colorMapId);

  colormap.setNumberOfColors(defaultSegmentationCount);

  /*
    19 Colors selected to be as distinct from each other as possible,
    and ordered such that between each index you make large jumps around the
    color wheel. If defaultSegmentationCount is greater than 19, generate a
    random linearly interperlated color between 2 colors.
  */
  for (let i = 0; i < defaultSegmentationCount; i++) {
    if (i < distinctColors.length) {
      colormap.setColor(i, distinctColors[i]);
    } else {
      colormap.setColor(i, _generateInterpolatedColor());
    }
  }
}

/**
 * _generateInterpolatedColor -  generates a color interpolated between two
 *                              colors. Humans can only distinguish between
 *                              ~15-20 colors, so this is the best we can do.
 * @private
 *
 * @returns {type}  description
 */
function _generateInterpolatedColor() {
  const randIndicies = _getNextColorPair();
  const fraction = Math.random();
  const interpolatedColor = [];

  for (let i = 0; i < 4; i++) {
    interpolatedColor.push(
      Math.floor(
        fraction * distinctColors[randIndicies[0]][i] +
          (1.0 - fraction) * distinctColors[randIndicies[1]][i]
      )
    );
  }

  return interpolatedColor;
}

/**
 * _getNextColorPair - returns the next pair of indicies to interpolate between.
 *
 * @private
 *
 * @returns {Array} An array containing the two indicies.
 */
function _getNextColorPair() {
  const indexPair = [colorPairIndex];

  if (colorPairIndex < distinctColors.length - 1) {
    colorPairIndex++;
    indexPair.push(colorPairIndex);
  } else {
    colorPairIndex = 0;
    indexPair.push(colorPairIndex);
  }

  return indexPair;
}
