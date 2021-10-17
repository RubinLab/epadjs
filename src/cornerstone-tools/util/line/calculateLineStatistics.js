import external from "./../../externalModules.js";
import getPixelsUnderLine from "./getPixelsUnderLine.js";

/**
 * Calculates the statistics of a line.
 *
 * @private
 * @function calculateLineStatistics
 *
 * @param {number[]} sp - Array of the image data's pixel values.
 * @param {Object} line - { startCoordinates, endCoordinates }
 * @returns {Object} { count, mean, variance, stdDev, min, max }
 */
export default function (image, line, element) {
  if (!element) return;
  console.log("image", image);
  let sum = 0;
  let sumSquared = 0;
  let count = 0;
  let min = null;
  let max = null;

  const { start, end } = line;
  const { rows, columns } = image;
  console.log("columns", columns);

  const pixels = getPixelsUnderLine(start, end);
  console.log("pixels under the line", pixels);

  const pixelData = external.cornerstone.getPixels(
    element,
    0,
    0,
    columns,
    rows
  );

  // console.log("PIXESL ", pixels);
  // const pixelData = image.getPixelData();
  console.log("pixelData is", pixelData);

  for (let i = 0; i < pixels.length; i++) {
    const { x, y } = pixels[i];
    const index = columns * y + x;

    if (min === null) {
      min = pixelData[index];
      max = pixelData[index];
    }

    sum += pixelData[index];
    sumSquared += pixelData[index] * pixelData[index];
    min = Math.min(min, pixelData[index]);
    max = Math.max(max, pixelData[index]);
    count++;
  }
  console.log("sum", sum);

  if (count === 0) {
    return {
      mean: 0.0,
      stdDev: 0.0,
      min: 0.0,
      max: 0.0,
    };
  }

  const mean = sum / count;
  const variance = sumSquared / count - mean * mean;

  return {
    mean,
    stdDev: Math.sqrt(variance),
    min,
    max,
  };
}
