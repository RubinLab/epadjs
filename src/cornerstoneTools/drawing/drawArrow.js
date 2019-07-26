import drawLine from './drawLine.js';
import drawJoinedLines from './drawJoinedLines.js';

/**
 * Draw an arrow using the drawing API.
 * @public
 * @method drawArrow
 * @memberof Drawing
 *
 * @param  {Object} context   The canvas context.
 * @param  {Object} start     The start position.
 * @param  {Object} end       The end position.
 * @param  {string} color     The color of the arrow.
 * @param  {number} lineWidth The width of the arrow line.
 * @returns {undefined}
 */
export default function(context, start, end, color, lineWidth) {
  // Variables to be used when creating the arrow
  const headLength = 10;

  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  // Starting path of the arrow from the start square to the end square and drawing the stroke
  let options = {
    color,
    lineWidth,
  };

  drawLine(context, undefined, start, end, options, 'canvas');
  options = {
    color,
    lineWidth,
    fillStyle: color,
  };

  const points = [
    {
      x: end.x - headLength * Math.cos(angle - Math.PI / 7),
      y: end.y - headLength * Math.sin(angle - Math.PI / 7),
    },
    {
      x: end.x - headLength * Math.cos(angle + Math.PI / 7),
      y: end.y - headLength * Math.sin(angle + Math.PI / 7),
    },
    end,
  ];

  drawJoinedLines(context, undefined, end, points, options, 'canvas');
}
