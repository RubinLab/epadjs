import external from "./../../externalModules.js";
import BaseAnnotationTool from "../base/BaseAnnotationTool.js";
// State
import { getToolState } from "./../../stateManagement/toolState.js";
import toolStyle from "./../../stateManagement/toolStyle.js";
import toolColors from "./../../stateManagement/toolColors.js";
// Drawing
import {
  getNewContext,
  draw,
  setShadow,
  drawLine,
} from "./../../drawing/index.js";
import drawLinkedTextBox from "./../../drawing/drawLinkedTextBox.js";
import drawHandles from "./../../drawing/drawHandles.js";
import lineSegDistance from "./../../util/lineSegDistance.js";
import { lengthCursor } from "../cursors/index.js";
import { getLogger } from "../../util/logger.js";
import getPixelSpacing from "../../util/getPixelSpacing";
import throttle from "../../util/throttle";
import { state } from "../../store/index.js";
import calculateLineStatistics from "cornerstone-tools/util/line/calculateLineStatistics.js";
import numbersWithCommas from "../../util/numbersWithCommas.js";

const logger = getLogger("tools:annotation:LengthTool");

/**
 * @public
 * @class LengthTool
 * @memberof Tools.Annotation
 * @classdesc Tool for measuring distances.
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class LengthTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: "Length",
      supportedInteractionTypes: ["Mouse", "Touch"],
      svgCursor: lengthCursor,
    };

    super(props, defaultProps);

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);
  }

  createNewMeasurement(eventData) {
    const goodEventData =
      eventData && eventData.currentPoints && eventData.currentPoints.image;

    if (!goodEventData) {
      logger.error(
        `required eventData not supplied to tool ${this.name}'s createNewMeasurement`
      );

      return;
    }

    const { x, y } = eventData.currentPoints.image;

    return {
      visible: true,
      active: true,
      color: undefined,
      invalidated: true,
      handles: {
        start: {
          x,
          y,
          highlight: true,
          active: false,
        },
        end: {
          x,
          y,
          highlight: true,
          active: true,
        },
        textBox: {
          active: false,
          hasMoved: false,
          movesIndependently: false,
          drawnIndependently: true,
          allowedOutsideImage: true,
          hasBoundingBox: true,
        },
      },
    };
  }

  /**
   *
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {Boolean}
   */
  pointNearTool(element, data, coords, interactionType = "mouse") {
    const hasStartAndEndHandles =
      data && data.handles && data.handles.start && data.handles.end;
    const validParameters = hasStartAndEndHandles;

    if (!validParameters) {
      logger.warn(
        `invalid parameters supplied to tool ${this.name}'s pointNearTool`
      );

      return false;
    }

    if (data.visible === false) {
      return false;
    }

    const distanceThreshold =
      interactionType === "mouse" ? state.clickProximity : state.touchProximity;

    return (
      lineSegDistance(element, data.handles.start, data.handles.end, coords) <
      distanceThreshold
    );
  }

  updateCachedStats(image, element, data) {
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);
    const { start, end } = data.handles;

    const { min, max, mean, stdDev } = calculateLineStatistics(
      image,
      {
        start,
        end,
      },
      element
    );

    data.min = min;
    data.max = max;
    data.mean = mean;
    data.stdDev = stdDev;

    // Set rowPixelSpacing and columnPixelSpacing to 1 if they are undefined (or zero)
    const dx =
      (data.handles.end.x - data.handles.start.x) * (colPixelSpacing || 1);
    const dy =
      (data.handles.end.y - data.handles.start.y) * (rowPixelSpacing || 1);

    // Calculate the length, and create the text variable with the millimeters or pixels suffix
    const length = Math.sqrt(dx * dx + dy * dy);

    // Store the length inside the tool for outside access
    data.length = length;
    data.invalidated = false;
  }

  renderToolData(evt) {
    const eventData = evt.detail;
    const { handleRadius, drawHandlesOnHover } = this.configuration;
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);
    const { image, element } = eventData;
    const seriesModule = external.cornerstone.metaData.get(
      "generalSeriesModule",
      image.imageId
    );
    const modality = seriesModule ? seriesModule.modality : null;
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

    const lineWidth = toolStyle.getToolWidth();

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, (context) => {
        // Configurable shadow
        setShadow(context, this.configuration);

        let color;
        const activeColor = toolColors.getActiveColor(data);
        if (data.active) color = activeColor;
        else color = data.color ? data.color : toolColors.getToolColor();

        // Draw the measurement line
        drawLine(context, element, data.handles.start, data.handles.end, {
          color,
        });

        // Draw the handles
        const handleOptions = {
          color,
          handleRadius,
          drawHandlesIfActive: drawHandlesOnHover,
        };

        drawHandles(context, eventData, data.handles, handleOptions);

        if (!data.handles.textBox.hasMoved) {
          const coords = {
            x: Math.max(data.handles.start.x, data.handles.end.x),
          };

          // Depending on which handle has the largest x-value,
          // Set the y-value for the text box
          if (coords.x === data.handles.start.x) {
            coords.y = data.handles.start.y;
          } else {
            coords.y = data.handles.end.y;
          }

          data.handles.textBox.x = coords.x;
          data.handles.textBox.y = coords.y;
        }

        // Move the textbox slightly to the right and upwards
        // So that it sits beside the length tool handle
        const xOffset = 10;

        // Update textbox stats
        if (data.invalidated === true) {
          if (data.length) {
            this.throttledUpdateCachedStats(image, element, data);
          } else {
            this.updateCachedStats(image, element, data);
          }
        }

        const text = textBoxText(data, rowPixelSpacing, colPixelSpacing);

        if (state.showCalculations)
          drawLinkedTextBox(
            context,
            element,
            data.handles.textBox,
            text,
            data.handles,
            textBoxAnchorPoints,
            color,
            lineWidth,
            xOffset,
            true
          );
      });
    }

    function textBoxText(data, rowPixelSpacing, colPixelSpacing) {
      const { mean, stdDev, min, max, length } = data;
      // Define an array to store the rows of text for the textbox
      const textLines = [];

      // Set the length text suffix depending on whether or not pixelSpacing is available
      let suffix = "mm";

      // If the modality is CT, add HU to denote Hounsfield Units
      let moSuffix = "";

      if (modality === "CT") {
        moSuffix = "HU";
        data.calcUnit = "HU";
      }
      data.unit = moSuffix;

      if (!rowPixelSpacing || !colPixelSpacing) {
        suffix = "pixels";
      }

      data.unit = suffix;

      let lengthText = `Length: ${numbersWithCommas(
        length.toFixed(2)
      )} ${suffix}`;

      let minText = `Min: ${numbersWithCommas(min.toFixed(2))}${moSuffix}`;
      let maxText = `Max: ${numbersWithCommas(max.toFixed(2))}${moSuffix}`;

      // Add these text lines to the array to be displayed in the textbox
      textLines.push(lengthText);
      textLines.push(minText);
      textLines.push(maxText);

      // If the mean and standard deviation values are present, display them
      if (mean && stdDev !== undefined) {
        // Create a line of text to display the mean and any units that were specified (i.e. HU)
        let meanText = `Mean: ${numbersWithCommas(
          mean.toFixed(2)
        )} ${moSuffix}`;
        // Create a line of text to display the standard deviation and any units that were specified (i.e. HU)
        let stdDevText = `StdDev: ${numbersWithCommas(
          stdDev.toFixed(2)
        )} ${moSuffix}`;

        // If this image has SUV values to display, concatenate them to the text line
        // if (meanStdDevSUV && meanStdDevSUV.mean !== undefined) {
        //   const SUVtext = " SUV: ";

        //   meanText +=
        //     SUVtext + numbersWithCommas(meanStdDevSUV.mean.toFixed(2));
        //   stdDevText +=
        //     SUVtext + numbersWithCommas(meanStdDevSUV.stdDev.toFixed(2));
        // }
        textLines.push(meanText);
        textLines.push(stdDevText);
      }

      return textLines;
    }

    // function textBoxText(data, rowPixelSpacing, colPixelSpacing) {
    //   // Set the length text suffix depending on whether or not pixelSpacing is available
    //   let suffix = "mm";

    //   if (!rowPixelSpacing || !colPixelSpacing) {
    //     suffix = "pixels";
    //   }

    //   data.unit = suffix;

    //   return `${data.length.toFixed(2)} ${suffix}`;
    // }

    function textBoxAnchorPoints(handles) {
      const midpoint = {
        x: (handles.start.x + handles.end.x) / 2,
        y: (handles.start.y + handles.end.y) / 2,
      };

      return [handles.start, midpoint, handles.end];
    }
  }
}
