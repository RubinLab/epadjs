/**
 * Returns the number of segmentations in a given Annotation set
 *
 * @param  {Array} imageAnnotations The array of annotations *
 *
 * @returns {number}
 */

export function getNumOfSegs(series) {
  let segCount = 0;
  series.forEach(serie => {
    const { imageAnnotations } = serie;
    if (imageAnnotations !== undefined) {
      Object.values(imageAnnotations).map(imageAnnotation => {
        imageAnnotation.forEach(markup => {
          if (markup.markupType === "DicomSegmentationEntity") {
            segCount++;
          }
        });
      });
    }
  });
  return segCount;
}

export function getSegIndexOfAim(series, aim) {
  let segCount = 0;
  for (let i = 0; i < series.length; i++) {
    const { imageAnnotations } = series[i];
    if (imageAnnotations !== undefined) {
      Object.values(imageAnnotations).map(imageAnnotation => {
        for (let j = 0; j < imageAnnotation.length; j++) {
          if (
            imageAnnotation[j].markupType === "DicomSegmentationEntity" &&
            imageAnnotation[j].aimUid === aim.aimId
          )
            return segCount;
          else if (imageAnnotation[j].markupType === "DicomSegmentationEntity")
            segCount++;
        }
      });
    }
  }
  return segCount;
}
