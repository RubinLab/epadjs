export function prepAimForParseClass(aimJson) {
  try {
    const { ImageAnnotationCollection } = aimJson;
    const imageAnnotation =
      ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0];
    const obj = {};
    obj["comment"] = Object.assign({}, imageAnnotation.comment);
    obj["imagingObservationEntityCollection"] = Object.assign(
      {},
      imageAnnotation.imagingObservationEntityCollection
    );
    obj["imagingPhysicalEntityCollection"] = Object.assign(
      {},
      imageAnnotation.imagingPhysicalEntityCollection
    );
    obj["inferenceEntityCollection"] = Object.assign(
      {},
      imageAnnotation.imagingPhysicalEntityCollection
    );
    // shall we pass markupType too?
    obj["name"] = Object.assign({}, imageAnnotation.name);
    // shall we pass segmentation entity collection?
    obj["typeCode"] = [...imageAnnotation.typeCode];
    return obj;
  } catch (error) {
    console.error(error);
  }
}
