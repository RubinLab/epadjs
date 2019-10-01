import { store } from 'cornerstone-tools';

import generateBrushMetadata from './generateBrushMetadata.js';

const brushModule = store.modules.brush;

export function newSegmentInput(segIndex, metadata) {
  brushMetdataInput(segIndex, metadata, segmentInputCallback);
}

export function editSegmentInput(segIndex, metadata) {
  brushMetdataInput(segIndex, metadata, segmentInputCallback);
}

export function newSegment(enabledElement) {
  if (!enabledElement) {
    return [];
  }

  const activeElement = enabledElement.element;

  let segmentMetadata = brushModule.getters.metadata(activeElement);

  if (!Array.isArray(segmentMetadata)) {
    const { labelmap3D } = brushModule.getters.getAndCacheLabelmap2D(activeElement);

    segmentMetadata = labelmap3D.metadata;
  }

  const colormap = brushModule.getters.activeCornerstoneColorMap(activeElement);

  const numberOfColors = colormap.getNumberOfColors();

  for (let i = 1; i < numberOfColors; i++) {
    if (!segmentMetadata[i]) {
      newSegmentInput(i);
      break;
    }
  }
}

function segmentInputCallback(data) {
  if (!data) {
    return;
  }

  const { label, categoryUID, typeUID, modifierUID, segIndex, element } = data;

  const metadata = generateBrushMetadata(label, categoryUID, typeUID, modifierUID);

  // TODO -> support for multiple labelmaps.
  brushModule.setters.metadata(element, 0, segIndex, metadata);
  brushModule.setters.activeSegmentIndex(element, segIndex);
}

/**
 * Opens the brushMetadata dialog.
 *
 */

// TODO -> Need to make this into a react-modal?
function brushMetdataInput(segIndex, metadata, callback) {
  console.log('TODO: Remake brushMetadata input menu!');
  /*
  const brushMetadataDialog = document.getElementById('brushMetadataDialog');
  const dialogData = Blaze.getData(brushMetadataDialog);

  dialogData.brushMetadataDialogSegIndex.set(segIndex);
  dialogData.brushMetadataDialogMetadata.set(metadata);
  dialogData.brushMetadataDialogCallback.set(callback);

  brushMetadataDialog.showModal();
  */
}
