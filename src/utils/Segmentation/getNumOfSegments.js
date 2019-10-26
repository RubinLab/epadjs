/**
 * Returns the number of segmentations in a given Annotation set
 *
 * @param  {Array} imageAnnotations The array of annotations *
 *
 * @returns {number}
 */

export default function getNumOfSegs(imageAnnotations) {
  console.log("Get Num segs imageAnnotations", imageAnnotations);
  let segCount = 0;
  Object.values(imageAnnotations).map(imageAnnotation => {
    imageAnnotation.forEach(markup => {
      if (markup.markupType === "DicomSegmentationEntity") {
        segCount++;
        console.log("Markup", markup, segCount);
      }
    });
  });
  console.log("I'm returning segCount", segCount);
  return segCount;
}
