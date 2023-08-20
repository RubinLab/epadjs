/**
 * Changes the scale of the viewport.
 *
 * @private
 * @function changeViewportScale
 *
 * @param {Object} viewport The viewport to scale.
 * @param {number} ticks The change in magnifcation factor.
 * @param {Object} scaleLimits The limits in scale.
 * @returns {Object} The scaled viewport.
 */
export default function(viewport, ticks, scaleLimits) {
  const { maxScale, minScale } = scaleLimits;
  const pow = 1.7;
  const oldFactor = Math.log(viewport.scale) / Math.log(pow);
  const factor = oldFactor + ticks;
  const scale = Math.pow(pow, factor);

  let finalScale = scale;
  if (maxScale && scale > maxScale) {
    viewport.scale = maxScale;
    finalScale = maxScale;
  } else if (minScale && scale < minScale) {
    viewport.scale = minScale;
    finalScale = minScale;
  } else {
    viewport.scale = scale;
  }

   window.dispatchEvent( new CustomEvent("updateImageStatus", { detail: { type: 'zoom', value: finalScale } }));

  return viewport;
}
