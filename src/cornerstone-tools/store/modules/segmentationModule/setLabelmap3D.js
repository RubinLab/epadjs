import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';
import getSegmentsOnPixelData from './getSegmentsOnPixeldata';
import { triggerLabelmapModifiedEvent } from '../../../util/segmentation';

/**
 * Takes a 16-bit encoded `ArrayBuffer` and stores it as a `Labelmap3D` for the
 * `BrushStackState` associated with the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone
 *                                                  enabled element or its UUID.
 * @param  {ArrayBuffer} buffer
 * @param  {number} labelmapIndex The index to store the labelmap under.
 * @param  {Object[]} metadata = [] Any metadata about the segments.
 * @param  {number[][]} [segmentsOnLabelmapArray] An array of array of segments on each imageIdIndex.
 *                       If not present, is calculated.
 * @param  {colorLUTIndex} [colorLUTIndex = 0] The index of the colorLUT to use to render the segmentation.
 * @returns {null}
 */
function setLabelmap3DForElement(
  elementOrEnabledElementUID,
  buffer,
  labelmapIndex,
  metadata = [],
  segmentsOnLabelmapArray,
  colorLUTIndex = 0
) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const numberOfFrames = stackState.data[0].imageIds.length;
  const firstImageId = stackState.data[0].imageIds[0];

  setLabelmap3DByFirstImageId(
    firstImageId,
    buffer,
    labelmapIndex,
    metadata,
    numberOfFrames,
    segmentsOnLabelmapArray,
    colorLUTIndex
  );

  triggerLabelmapModifiedEvent(element, labelmapIndex);
}

/**
 * Takes an 16-bit encoded `ArrayBuffer` and stores it as a `Labelmap3D` for
 * the `BrushStackState` associated with the firstImageId.
 *
 * @param  {HTMLElement|string} firstImageId  The firstImageId of the series to
 *                                            store the segmentation on.
 * @param  {ArrayBuffer} buffer
 * @param  {number} labelmapIndex The index to store the labelmap under.
 * @param  {Object[]} metadata = [] Any metadata about the segments.
 * @param  {number} numberOfFrames The number of frames, required to set up the
 *                                 relevant labelmap2D views.
 * @param  {number[][]} [segmentsOnLabelmapArray] An array of array of segments on each imageIdIndex.
 *                       If not present, is calculated.
 * @param  {colorLUTIndex} [colorLUTIndex = 0] The index of the colorLUT to use to render the segmentation.
 * @returns {null}
 */
function setLabelmap3DByFirstImageId(
  firstImageId,
  buffer,
  labelmapIndex,
  metadata = [],
  numberOfFrames,
  segmentsOnLabelmapArray,
  colorLUTIndex = 0
) {
  let brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    state.series[firstImageId] = {
      activeLabelmapIndex: labelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];
  }

  brushStackState.labelmaps3D[labelmapIndex] = {
    buffer,
    labelmaps2D: [],
    metadata,
    activeSegmentIndex: 1,
    colorLUTIndex: 0,
    segmentsHidden: [],
    undo: [],
    redo: [],
  };

  // this seems to be added to be able to display the segmentation. 
  // we need the buffer to be ArrayBuffer. Not array of ArrayBuffers also in the main object
  // buffer = buffer[0];
  
  const labelmaps2D = brushStackState.labelmaps3D[labelmapIndex].labelmaps2D;
  const slicelengthInBytes = buffer.byteLength / numberOfFrames;
  const sliceLengthInUint16 = slicelengthInBytes / 2; // SliceLength in Uint16.

  for (let i = 0; i < numberOfFrames; i++) {
    const pixelData = new Uint16Array(
      buffer,
      slicelengthInBytes * i,
      sliceLengthInUint16
    );

    const segmentsOnLabelmap = segmentsOnLabelmapArray
      ? segmentsOnLabelmapArray[i]
      : getSegmentsOnPixelData(pixelData);

    if (segmentsOnLabelmap && segmentsOnLabelmap.some(segment => segment)) {
      labelmaps2D[i] = {
        pixelData,
        segmentsOnLabelmap,
      };
    }
  }
}

export { setLabelmap3DByFirstImageId, setLabelmap3DForElement };
