export function getImageIdAnnotations(aims) {
  let imageIdSpecificMarkups = {};
  aims.forEach(aim => parseAim(aim, imageIdSpecificMarkups));
  return imageIdSpecificMarkups;
}

function parseAim(aim, imageIdSpecificMarkups) {
  var imageAnnotation =
    aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0];
  //check if the aim has markup
  if (imageAnnotation.markupEntityCollection) {
    var markupEntities = imageAnnotation.markupEntityCollection.MarkupEntity;
    markupEntities.forEach(markupEntity => {
      const { imageId, data } = getMarkup(markupEntity, aim);
      if (!imageIdSpecificMarkups[imageId])
        imageIdSpecificMarkups[imageId] = [data];
      else imageIdSpecificMarkups[imageId].push(data);
    });
  }
}

function getMarkup(markupEntity, aim) {
  const imageId = markupEntity["imageReferenceUid"]["root"];
  const markupUid = markupEntity["uniqueIdentifier"]["root"];
  const calculations = getCalculationEntitiesOfMarkUp(aim, markupUid);
  const aimUid = aim.ImageAnnotationCollection["uniqueIdentifier"]["root"];
  // console.log("CALCULATIONS", calculations);
  return {
    imageId,
    data: {
      markupType: markupEntity["xsi:type"],
      calculations,
      coordinates:
        markupEntity.twoDimensionSpatialCoordinateCollection
          .TwoDimensionSpatialCoordinate,
      markupUid,
      aimUid
    }
  };
}

function getCalculationEntitiesOfMarkUp(aim, markupUid) {
  const imageAnnotationStatements = getImageAnnotationStatements(aim);
  let calculations = [];
  imageAnnotationStatements.forEach(statement => {
    if (
      statement["xsi:type"] ==
        "CalculationEntityReferencesMarkupEntityStatement" &&
      statement.objectUniqueIdentifier.root === markupUid
    ) {
      const calculationUid = statement.subjectUniqueIdentifier.root;
      const calculationEntities = getCalculationEntities(aim);
      calculationEntities.forEach(calculation => {
        if (calculation.uniqueIdentifier.root === calculationUid)
          calculations.push(parseCalculation(calculation));
      });
    }
  });
  return calculations;
}

function getImageAnnotationStatements(aim) {
  return aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
    .imageAnnotationStatementCollection.ImageAnnotationStatement;
}

function getCalculationEntities(aim) {
  return aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
    .calculationEntityCollection.CalculationEntity;
}

function parseCalculation(calculation) {
  var obj = {};
  const calcResult =
    calculation.calculationResultCollection.CalculationResult[0];
  if (
    calculation.calculationResultCollection.CalculationResult[0]
      .calculationDataCollection
  ) {
    const calcValue =
      calculation.calculationResultCollection.CalculationResult[0]
        .calculationDataCollection.CalculationData[0];
    obj["value"] = calcValue["value"]["value"];
  } else obj["value"] = calcResult["value"]["value"];
  obj["type"] = calculation["description"]["value"];
  obj["unit"] = calcResult["unitOfMeasure"]["value"];
  return obj;
}

export function getAimImageData(image) {
  var obj = {};
  obj.aim = {};
  obj.study = {};
  obj.series = {};
  obj.equipment = {};
  obj.person = {};
  obj.image = [];
  const { aim, study, series, equipment, person } = obj;

  console.log("Image Data", image.data);

  aim.studyInstanceUid = image.data.string("x0020000d") || "";

  study.startTime = image.data.string("x00080030") || "";
  study.instanceUid = image.data.string("x0020000d") || "";
  study.startDate = image.data.string("x00080020") || "";
  study.accessionNumber = image.data.string("x00080050") || "";

  series.instanceUid = image.data.string("x0020000e") || "";
  series.modality = image.data.string("x00080060") || "";

  obj.image.push(getSingleImageData(image));

  equipment.manufacturerName = image.data.string("x00080070") || "";
  equipment.manufacturerModelName = image.data.string("x00081090") || "";
  equipment.softwareVersion = image.data.string("x00181020") || "";

  person.sex = image.data.string("x00100040") || "";
  person.name = image.data.string("x00100010") || "";
  person.patientId = image.data.string("x00100020") || "";
  person.birthDate = image.data.string("x00100030") || "";

  return obj;
}

function getSingleImageData(image) {
  return {
    sopClassUid: image.data.string("x00080016") || "",
    sopInstanceUid: image.data.string("x00080018") || ""
  };
}

function addSingleImageDataToAim(aim, image) {
  if (!aim.image) return;
  aim.image.push(getSingleImageData(image));
}
