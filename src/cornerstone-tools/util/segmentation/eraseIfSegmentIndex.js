/**
 * If the pixelData for the given pixelIndex is equal to the segmentIndex
 * erase it (set it to 0).
 * @param  {number} pixelIndex The index of the pixel.
 * @param  {UInt16Array} pixelData The pixelData array.
 * @param  {number} segmentIndex The segment Index to erase.
 */
export default function eraseIfSegmentIndex(
  pixelIndex,
  pixelData,
  segmentIndex
) {
  console.log(pixelData[pixelIndex]);
  if (pixelData[pixelIndex] === segmentIndex) {
    console.log("erasing", pixelIndex, segmentIndex);
    pixelData[pixelIndex] = 0;
  }
}
