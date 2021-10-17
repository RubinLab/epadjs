/**
 * Finds the pixels that lays under a given line.
 * Bresenham Algorithm
 *
 * @private
 * @function getPixelsUnderLine
 *
 * @param {object} startCoordinates - Start of the line.
 * @param {object} endCoordinates - End of the line.
 * @returns {coordinates[]} - Pixel coordinates that the line goues through.
 */
export default function (startCoordinates, endCoordinates) {
  let coordinatesArray = new Array();
  // Translate coordinates
  let x1 = parseInt(startCoordinates.x);
  let y1 = parseInt(startCoordinates.y);
  let x2 = parseInt(endCoordinates.x);
  let y2 = parseInt(endCoordinates.y);

  // Define differences and error check
  let dx = Math.abs(x2 - x1);
  let dy = Math.abs(y2 - y1);
  let sx = x1 < x2 ? 1 : -1;
  let sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  // Set first coordinates
  coordinatesArray.push({ x: x1, y: y1 });
  // Main loop
  while (!(x1 == x2 && y1 == y2)) {
    let e2 = err << 1;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
    // Set coordinates
    coordinatesArray.push({ x: x1, y: y1 });
  }
  // Return the result
  return coordinatesArray;
}
