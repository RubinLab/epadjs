let metaData = {};

document.getElementById("switchBrush")[0].selected = true;

function changeBrush() {
  var value = document.getElementById("switchBrush").value;

  cornerstoneTools.store.modules.brush.state.drawColorId = value;
}

function createSeg() {
  const element = document.getElementsByClassName("viewport-element")[0];
  const globalToolStateManager =
    cornerstoneTools.globalImageIdSpecificToolStateManager;
  const toolState = globalToolStateManager.saveToolState();

  const stackToolState = cornerstoneTools.getToolState(element, "stack");
  const imageIds = stackToolState.data[0].imageIds;

  let imagePromises = [];
  for (let i = 0; i < imageIds.length; i++) {
    imagePromises.push(cornerstone.loadImage(imageIds[i]));
  }

  const RecommendedDisplayCIELabValue = dcmjs.data.Colors.rgb2DICOMLAB([
    1,
    0,
    0
  ]);

  const segments = [];

  // Check which segments have been drawn.
  for (let i = 0; i < imageIds.length; i++) {
    if (
      !toolState[imageIds[i]] ||
      !toolState[imageIds[i]].brush ||
      !toolState[imageIds[i]].brush.data
    ) {
      continue;
    }

    const brushData = toolState[imageIds[i]].brush.data;

    for (let segIdx = 0; segIdx < 4; segIdx++) {
      // If there is pixelData for this segment, set the segment metadata
      // if it hasn't been set yet.
      if (
        brushData[segIdx] &&
        brushData[segIdx].pixelData &&
        !segments[segIdx]
      ) {
        segments[segIdx] = {
          SegmentedPropertyCategoryCodeSequence: {
            CodeValue: "T-D0050",
            CodingSchemeDesignator: "SRT",
            CodeMeaning: "Tissue"
          },
          SegmentNumber: (segIdx + 1).toString(),
          SegmentLabel: "Tissue " + (segIdx + 1).toString(),
          SegmentAlgorithmType: "SEMIAUTOMATIC",
          SegmentAlgorithmName: "Slicer Prototype",
          RecommendedDisplayCIELabValue,
          SegmentedPropertyTypeCodeSequence: {
            CodeValue: "T-D0050",
            CodingSchemeDesignator: "SRT",
            CodeMeaning: "Tissue"
          }
        };
      }
    }
  }

  const brushData = {
    toolState,
    segments
  };

  Promise.all(imagePromises)
    .then(images => {
      const segBlob = dcmjs.adapters.Cornerstone.Segmentation.generateSegmentation(
        images,
        brushData
      );

      console.log(segBlob);

      // Create a URL for the binary.
      var objectUrl = URL.createObjectURL(segBlob);
      window.open(objectUrl);
    })
    .catch(err => console.log(err));
}

function addMetaData(type, imageId, data) {
  metaData[imageId] = metaData[imageId] || {};
  metaData[imageId][type] = data;
}

//
// creates an array of per-frame imageIds in the form needed for cornerstone processing.
//
function getImageIds(multiframe, baseImageId) {
  const imageIds = [];
  const numFrames = Number(multiframe.NumberOfFrames);
  for (let i = 0; i < numFrames; i++) {
    let segNum;
    if (
      multiframe.PerFrameFunctionalGroupsSequence[i]
        .SegmentIdentificationSequence
    ) {
      segNum =
        multiframe.PerFrameFunctionalGroupsSequence[i]
          .SegmentIdentificationSequence.ReferencedSegmentNumber;
    }
    const imageId = baseImageId + "?frame=" + i;
    imageIds.push(imageId);
  }
  return imageIds;
}

//
// uses cornerstone caching to access a bytearray of the
// part10 dicom, then uses dcmjs to parse this
// into javascript object and populates the
// metadata for the per-frame imageIDs.
//
function loadMultiFrameAndPopulateMetadata(baseImageId) {
  return new Promise(function(resolve, reject) {
    var multiframe;
    cornerstone.loadAndCacheImage(baseImageId).then(function(image) {
      var arrayBuffer = image.data.byteArray.buffer;

      dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
      let dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
        dicomData.dict
      );
      dataset._meta = dcmjs.data.DicomMetaDictionary.namifyDataset(
        dicomData.meta
      );

      multiframe = dcmjs.normalizers.Normalizer.normalizeToDataset([dataset]);

      const numFrames = Number(multiframe.NumberOfFrames);
      for (let i = 0; i < numFrames; i++) {
        const imageId = baseImageId + "?frame=" + i;

        var functionalGroup = multiframe.PerFrameFunctionalGroupsSequence[i];
        var imagePositionArray =
          functionalGroup.PlanePositionSequence.ImagePositionPatient;

        addMetaData("imagePlane", imageId, {
          imagePositionPatient: {
            x: imagePositionArray[0],
            y: imagePositionArray[1],
            z: imagePositionArray[2]
          }
        });
      }

      resolve(multiframe);
    });
  });
}
