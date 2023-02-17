import { store, EVENTS, getCircle, drawBrushPixels } from "../../cornerstone-tools";
import cornerstone from "cornerstone-core";

import Brush3DHUGatedTool from "./Brush3DHUGatedTool.js";
import floodFill from "./n-dimensional-flood-fill.js";

import { getToolState } from "../../cornerstone-tools/stateManagement/toolState.js";
import generateBrushMetadata from "../util/generateBrushMetadata.js";
import {
  getDiffBetweenPixelData,
  triggerLabelmapModifiedEvent,
} from "../../cornerstone-tools/util/segmentation";

const brushModule = store.modules.segmentation;

export default class BrushSphericalHUGatedTool extends Brush3DHUGatedTool {
  constructor(configuration = {}) {
    const defaultConfig = {};
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;
    this.modality = "";
  }

  /**
   * Event handler for MOUSE_DOWN event.
   *
   * @override
   * @event
   * @param {Object} evt - The event.
   */
  preMouseDownCallback(evt) {
    this.modality = this._getModality(evt);
    this.activeGateRange = brushModule.getters.activeGateRange();

    this._startPainting(evt);

    return true;
  }

  _startPainting(evt) {
    const { configuration, getters } = brushModule;
    const eventData = evt.detail;
    const { element, image } = eventData;
    const radius = configuration.radius;
    const { rows, columns } = image;
    const pixelSpacing = Math.max(
      image.rowPixelSpacing,
      image.columnPixelSpacing
    );

    const stackState = getToolState(element, "stack");
    const stackData = stackState.data[0];
    const { imageIds } = stackData;

    const { labelmap2D, labelmap3D, currentImageIdIndex, activeLabelmapIndex } =
      getters.labelmap2D(element);

    const shouldErase =
      this._isCtrlDown(eventData) || this.configuration.alwaysEraseOnClick;

    const imagePlaneOfCurrentImage = cornerstone.metaData.get(
      "imagePlaneModule",
      image.imageId
    );

    let imagesInRange;

    if (imagePlaneOfCurrentImage) {
      const ippOfCurrentImage = imagePlaneOfCurrentImage.imagePositionPatient;

      imagesInRange = this._getImagesInRange(
        currentImageIdIndex,
        ippOfCurrentImage,
        imageIds,
        radius,
        pixelSpacing
      );
    } else {
      logger.warn(
        `No imagePlane metadata found for image, defaulting to circle brush application.`
      );

      imagesInRange = [
        // The current image.
        {
          imageIdIndex: currentImageIdIndex,
          radiusOnImage: radius,
        },
      ];
    }

    this.paintEventData = {
      labelmap2D,
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
      shouldErase,
      imagesInRange,
    };

    if (configuration.storeHistory) {
      const previousPixeldataForImagesInRange = [];

      for (let i = 0; i < imagesInRange.length; i++) {
        const { imageIdIndex } = imagesInRange[i];
        const labelmap2DForImageIdIndex = getters.labelmap2DByImageIdIndex(
          labelmap3D,
          imageIdIndex,
          rows,
          columns
        );

        const previousPixeldata = labelmap2DForImageIdIndex.pixelData.slice();

        previousPixeldataForImagesInRange.push(previousPixeldata);
      }

      this.paintEventData.previousPixeldataForImagesInRange =
        previousPixeldataForImagesInRange;
    }

    const segmentIndex = labelmap3D.activeSegmentIndex;
    let metadata = labelmap3D.metadata[segmentIndex];

    if (!metadata) {
      metadata = generateBrushMetadata("Unnamed Segment");

      brushModule.setters.metadata(
        element,
        activeLabelmapIndex,
        segmentIndex,
        metadata
      );
    }

    // Metadata assigned, start drawing.
    if (eventData.currentPoints) {
      this._paint(evt);
    }

    this._drawing = true;
    this._startListeningForMouseUp(element);

    // Dispatch event to open the Aim Editor
    let evnt = new CustomEvent("markupCreated", {
      detail: "brush",
    });
    window.dispatchEvent(evnt);
  }

  /**
   * Paints the data to the canvas.
   *
   * @protected
   * @param  {Object} evt The data object associated with the event.
   * @returns {void}
   */
  _paint(evt, imageIndex, _element) {
    let element, image, rows, columns, x, y;
    if (imageIndex && _element) {
      image = cornerstone.imageCache.cachedImages[imageIndex].image;
      element = _element;
      x = 1;
      y = 1;
    } else {
      const eventData = evt.detail;
      ({ element, image } = eventData);
      ({ x, y } = eventData.currentPoints.image);
    }
    ({ rows, columns } = image);

    if (x < 0 || x > columns || y < 0 || y > rows) {
      return;
    }

    const {
      labelmap2D,
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
      shouldErase,
      imagesInRange,
    } = this.paintEventData;

    for (let i = 0; i < imagesInRange.length; i++) {
      const { imageIdIndex, radiusOnImage } = imagesInRange[i];
      const pointerArray = this._gateCircle(
        cornerstone.imageCache.cachedImages[imageIdIndex].image,
        getCircle(radiusOnImage, rows, columns, x, y)
      );

      // Cache the view on this image if its not present.
      const labelmap2DForImageIdIndex =
        brushModule.getters.labelmap2DByImageIdIndex(
          labelmap3D,
          imageIdIndex,
          rows,
          columns
        );

      // Draw / Erase the active color.
      drawBrushPixels(
        pointerArray,
        labelmap2DForImageIdIndex.pixelData,
        labelmap3D.activeSegmentIndex,
        columns,
        shouldErase
      );
    }

    cornerstone.triggerEvent(element, EVENTS.LABELMAP_MODIFIED, {
      activeLabelmapIndex,
    });

    cornerstone.updateImage(evt.detail.element);
  }

  /**
   * _gateCircle - Given an image and a brush circle, gate the circle between
   * the set gate values, and then cleanup the resulting mask using the
   * holeFill and strayRemove properties of the brush module.
   *
   * @param  {object} image   The cornerstone image.
   * @param  {Number[][]} circle  An array of image pixels contained within the brush
   *                        circle.
   * @returns {Number[][]}  An array containing the gated/cleaned pixels to fill.
   */
  _gateCircle(image, circle) {
    const rows = image.rows;
    const imagePixelData = image.getPixelData();
    const gateRange = this.activeGateRange;
    const rescaleSlope = image.slope || 1;
    const rescaleIntercept = image.intercept || 0;

    const gatedCircleArray = [];

    for (let i = 0; i < circle.length; i++) {
      let pixelValue = imagePixelData[circle[i][0] + circle[i][1] * rows];

      if (this.modality === "CT")
        //get the original pixel value if the modlity is not CT
        pixelValue = pixelValue * rescaleSlope + rescaleIntercept;

      if (pixelValue >= gateRange[0] && pixelValue <= gateRange[1]) {
        gatedCircleArray.push(circle[i]);
      }
    }

    return this._cleanGatedCircle(circle, gatedCircleArray);
  }

  /**
   * _getEdgePixels - Returns the indicies of the edge pixels for the circular
   * brush data.
   *
   * @param  {Number[][]} data The squared-circle data where all circle members are
   *                     0, and values outside the circle are -1
   * @returns {Number[][]} An array of positions of the circle edge pixels.
   */
  _getEdgePixels(data) {
    const edgePixels = [];
    const xSize = data.length;
    const ySize = data[0].length;

    // first and last row add all of top and bottom which are circle members.
    for (let i = 0; i < data.length; i++) {
      if (data[i][0]) {
        edgePixels.push([i, 0]);
        edgePixels.push([i, ySize - 1]);
      }
    }

    // all other rows - Find first circle member, and use its position to add
    // The first and last circle member of that row.
    for (let j = 1; j < ySize - 1; j++) {
      for (let i = 0; i < data.length; i++) {
        if (data[i][j]) {
          edgePixels.push([i, j]);
          edgePixels.push([xSize - 1 - i, j]);

          break;
        }
      }
    }

    return edgePixels;
  }

  /**
   * _cleanGatedCircle - Clean the HU gated circle using the holeFill and
   * strayRemove properties of the brush module.
   *
   * @param  {Number[][]} circle     An array of the pixel indicies within the
   *                                 brush circle.
   * @param  {Number[][]} gatedCircleArray An array of the pixel indicies within
   *                                       the gate range.
   * @returns {Number[][]}                  The cleaned array of pixel indicies.
   */
  _cleanGatedCircle(circle, gatedCircleArray) {
    const { max, min } = this._getBoundingBoxOfCircle(circle);

    const xSize = max[0] - min[0] + 1;
    const ySize = max[1] - min[1] + 1;

    const data = this._boxGatedCircle(
      circle,
      gatedCircleArray,
      min,
      xSize,
      ySize
    );

    // Define our getter for accessing the data structure.
    function getter(x, y) {
      return data[x][y];
    }

    this._floodFillEmptyRegionsFromEdges(data, getter);

    const { holes, regions } = this._findHolesAndRegions(
      circle,
      data,
      getter,
      min
    );

    const largestRegionArea = this._getAreaOfLargestRegion(regions);

    // Delete any region outside the `strayRemove` threshold.
    for (let r = 0; r < regions.length; r++) {
      const region = regions[r];

      if (
        region.length <=
        (brushModule.state.strayRemove / 100.0) * largestRegionArea
      ) {
        for (let p = 0; p < region.length; p++) {
          data[region[p][0]][region[p][1]] = 3;
        }
      }
    }

    // Fill in any holes smaller than the `holeFill` threshold.
    for (let r = 0; r < holes.length; r++) {
      const hole = holes[r];

      if (
        hole.length <=
        (brushModule.state.holeFill / 100.0) * largestRegionArea
      ) {
        for (let p = 0; p < hole.length; p++) {
          data[hole[p][0]][hole[p][1]] = 5;
        }
      }
    }

    const filledGatedCircleArray = [];

    for (let i = 0; i < xSize; i++) {
      for (let j = 0; j < ySize; j++) {
        if (data[i][j] === 5) {
          filledGatedCircleArray.push([i + min[0], j + min[1]]);
        }
      }
    }

    return filledGatedCircleArray;
  }

  /**
   * _getBoundingBoxOfCircle - Returns two points defining the extent of the circle.
   *
   * @param  {number[][]} circle  An array of the pixel indicies within the brush circle.
   * @returns {object}        The minimum and maximum of the extent.
   */
  _getBoundingBoxOfCircle(circle) {
    const max = [circle[0][0], circle[0][1]];
    const min = [circle[0][0], circle[0][1]];

    for (let p = 0; p < circle.length; p++) {
      const [i, j] = circle[p];

      if (i > max[0]) {
        max[0] = i;
      } else if (i < min[0]) {
        min[0] = i;
      }

      if (j > max[1]) {
        max[1] = j;
      } else if (j < min[1]) {
        min[1] = j;
      }
    }

    return { max, min };
  }

  /**
   * _boxGatedCircle - Generates a rectangular dataset from the brush circle
   *                   for efficient flood fill/cleaning.
   *
   * @param  {type} circle           An array of the pixel indicies within the brush circle.
   * @param  {type} gatedCircleArray The circle array with the gate applied.
   * @param  {type} min              The location of the top left pixel of the
   *                                 generated dataset with respect to the
   *                                 underlying image data.
   * @param  {type} xSize            The x size of the generated box.
   * @param  {type} ySize            The y size of the generated box.
   * @returns {number[][]}           The data with pixel [0,0] centered on min,
   *                                 the circle marked with 1 for unoccupied, 2
   *                                 for occupied and 0 for outside of the circle bounds.
   */
  _boxGatedCircle(circle, gatedCircleArray, min, xSize, ySize) {
    const data = [];

    // Fill in square as 0 (out of bounds/ignore).
    for (let i = 0; i < xSize; i++) {
      data[i] = new Uint8ClampedArray(ySize);
    }

    // fill circle in as 1.
    for (let p = 0; p < circle.length; p++) {
      const i = circle[p][0] - min[0];
      const j = circle[p][1] - min[1];

      data[i][j] = 1;
    }

    // fill gated region as 2.
    for (let p = 0; p < gatedCircleArray.length; p++) {
      const i = gatedCircleArray[p][0] - min[0];
      const j = gatedCircleArray[p][1] - min[1];

      data[i][j] = 2;
    }

    return data;
  }

  /**
   * _floodFillEmptyRegionsFromEdges - Flood fills empty regions which touch the
   *                                   edge of the circle with the value 3.
   *
   * @param  {number[][]} data The data to flood fill.
   * @param {function} getter The getter function floodFill uses to access array
   *                          elements.
   * @modifies data
   * @returns {null}
   */
  _floodFillEmptyRegionsFromEdges(data, getter) {
    const edgePixels = this._getEdgePixels(data);

    for (let p = 0; p < edgePixels.length; p++) {
      const i = edgePixels[p][0];
      const j = edgePixels[p][1];

      if (data[i][j] === 1) {
        const result = floodFill({
          getter: getter,
          seed: [i, j],
        });

        const flooded = result.flooded;

        for (let k = 0; k < flooded.length; k++) {
          data[flooded[k][0]][flooded[k][1]] = 3;
        }
      }
    }
  }

  /**
   * _findHolesAndRegions - Finds all the holes and regions and returns their
   *                        positions within the 2D data set. Sets the value of
   *                        holes and regions to 4 and 5, respectively.
   *
   * @param  {number[][]} circle An array of the pixel indicies within the brush circle.
   * @param  {number[][]} data   The data set.
   * @param  {function}   getter The getter function floodFill uses to access array
   *                       elements.
   * @param  {number[]}   min    The location of the top left pixel of the dataset
   *                       with respect to the underlying image data.
   * @returns {object}    An object containing arrays of the occupation of all
   *                      regions and holes in the dataset.
   */
  _findHolesAndRegions(circle, data, getter, min) {
    const holes = [];
    const regions = [];

    // Find each hole and paint them 3.
    // Find contiguous regions and paint them 4.
    for (let p = 0; p < circle.length; p++) {
      const i = circle[p][0] - min[0];
      const j = circle[p][1] - min[1];

      if (data[i][j] === 1) {
        const result = floodFill({
          getter: getter,
          seed: [i, j],
        });

        const flooded = result.flooded;

        for (let k = 0; k < flooded.length; k++) {
          data[flooded[k][0]][flooded[k][1]] = 4;
        }

        holes.push(flooded);
      } else if (data[i][j] === 2) {
        const result = floodFill({
          getter: getter,
          seed: [i, j],
        });

        const flooded = result.flooded;

        for (let k = 0; k < flooded.length; k++) {
          data[flooded[k][0]][flooded[k][1]] = 5;
        }

        regions.push(flooded);
      }
    }

    return { holes, regions };
  }

  /**
   * _getAreaOfLargestRegion - Returns the number of pixels in the largest
   *                           region of a list of regions.
   *
   * @param  {number[][][]} regions An array of regions of 2D points.
   * @returns {number}        The area of the largest region in pixels.
   */
  _getAreaOfLargestRegion(regions) {
    let largestRegionArea = 0;

    for (let i = 0; i < regions.length; i++) {
      if (regions[i].length > largestRegionArea) {
        largestRegionArea = regions[i].length;
      }
    }

    return largestRegionArea;
  }

  /**
   * _getImagesInRange - Returns an array of image Ids within range of the
   * sphere, and the in-plane brush radii of those images.
   *
   * @param  {string} currentImageIdIndex The imageId of the image displayed on
   *                                   the cornerstone enabled element.
   * @param  {number[]} ippOfCurrentImage   The image position patient of the image.
   * @param  {string[]} imageIds           An array of images in the stack.
   * @param  {number} radius             The radius of the sphere.
   * @param  {number} pixelSpacing       The pixelSpacing.
   * @returns {Object[]}                   An array of imageIds in range and their
   *                                   in plane brush radii.
   */
  _getImagesInRange(
    currentImageIdIndex,
    ippOfCurrentImage,
    imageIds,
    radius,
    pixelSpacing
  ) {
    const radiusInMM = radius * pixelSpacing;
    const imagesInRange = [
      // The current image.
      {
        imageIdIndex: currentImageIdIndex,
        radiusOnImage: radius,
      },
    ];

    // Check images above
    for (let i = currentImageIdIndex + 1; i < imageIds.length; i++) {
      const radiusOnImage = this._getRadiusOnImage(
        imageIds[i],
        ippOfCurrentImage,
        radiusInMM,
        pixelSpacing
      );

      if (!radiusOnImage) {
        break;
      }

      imagesInRange.push({
        imageIdIndex: i,
        radiusOnImage,
      });
    }

    // Check images below
    for (let i = currentImageIdIndex - 1; i >= 0; i--) {
      const radiusOnImage = this._getRadiusOnImage(
        imageIds[i],
        ippOfCurrentImage,
        radiusInMM,
        pixelSpacing
      );

      if (!radiusOnImage) {
        break;
      }

      imagesInRange.push({
        imageIdIndex: i,
        radiusOnImage,
      });
    }

    return imagesInRange;
  }

  /**
   * _getRadiusOnImage - If the image is in range of the spherical brush, returns
   *                     the in-plane brush radius on that image.
   *
   * @param  {string} imageId           The cornerstone imageId of the image.
   * @param  {number[]} ippOfCurrentImage The image position patient of the current image.
   * @param  {number} radiusInMM        The radius of the sphere in millimeters.
   * @param  {string} pixelSpacing      The pixelspacing.
   * @returns {number|undefined}        The brush radius on the image, undefined if
   *                                    the image is out of range of the sphere.
   */
  _getRadiusOnImage(imageId, ippOfCurrentImage, radiusInMM, pixelSpacing) {
    const imagePlane = cornerstone.metaData.get("imagePlaneModule", imageId);

    if (!imagePlane) {
      logger.warn(
        `Can't find imagePlane metadata for image, cancelling spherical brushing on: ${imageId},`
      );

      return;
    }

    const ipp = imagePlane.imagePositionPatient;

    const distance = Math.sqrt(
      Math.pow(ipp[0] - ippOfCurrentImage[0], 2) +
        Math.pow(ipp[1] - ippOfCurrentImage[1], 2) +
        Math.pow(ipp[2] - ippOfCurrentImage[2], 2)
    );

    if (distance > radiusInMM) {
      // Image too far away, break!
      return;
    }

    return Math.floor(
      Math.sqrt(Math.pow(radiusInMM, 2) - Math.pow(distance, 2)) / pixelSpacing
    );
  }

  _endPainting(evt) {
    const { labelmap3D, imagesInRange } = this.paintEventData;
    const operations = [];
    const { configuration, setters } = brushModule;

    for (let i = 0; i < imagesInRange.length; i++) {
      const { imageIdIndex } = imagesInRange[i];
      const labelmap2D = labelmap3D.labelmaps2D[imageIdIndex];

      // Grab the labels on the slice.
      const segmentSet = new Set(labelmap2D.pixelData);
      const iterator = segmentSet.values();

      const segmentsOnLabelmap = [];
      let done = false;

      while (!done) {
        const next = iterator.next();

        done = next.done;

        if (!done) {
          segmentsOnLabelmap.push(next.value);
        }
      }

      labelmap2D.segmentsOnLabelmap = segmentsOnLabelmap;

      if (configuration.storeHistory) {
        const { previousPixeldataForImagesInRange } = this.paintEventData;

        const previousPixeldata = previousPixeldataForImagesInRange[i];
        const labelmap2D = labelmap3D.labelmaps2D[imageIdIndex];
        const newPixelData = labelmap2D.pixelData;

        operations.push({
          imageIdIndex,
          diff: getDiffBetweenPixelData(previousPixeldata, newPixelData),
        });
      }
    }

    if (configuration.storeHistory) {
      setters.pushState(this.element, operations);
    }

    triggerLabelmapModifiedEvent(this.element);
  }
}
