import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";

const activeColor = "#ddd000";

export const enumAimType = {
  imageAnnotation: 1,
  seriesAnnotation: 2,
  studyAnnotation: 3,
};

export function getMarkups(toolState, aimOfInterest) {
  var markupsToReturn = {};
  Object.keys(toolState).forEach((key) => {
    const markUps = toolState[key];
    Object.keys(markUps).map((tool) => {
      switch (tool) {
        case "FreehandRoi3DTool":
        case "FreehandRoi":
          const polygons3d = markUps[tool].data;
          polygons3d.map((polygon) => {
            if (!polygon.aimId || polygon.aimId === aimOfInterest)
              markupsToReturn["Polygon"] = { validate: "" };
          });
          break;
        case "Bidirectional":
          const bidirectionals = markUps[tool].data;
          bidirectionals.map((bidirectional) => {
            if (!bidirectional.aimId || bidirectional.aimId === aimOfInterest)
              markupsToReturn["Perpendicular"] = { validate: "" };
          });
          break;
        case "CircleRoi":
          const circles = markUps[tool].data;
          circles.map((circle) => {
            if (!circle.aimId || circle.aimId === aimOfInterest)
              markupsToReturn["Circle"] = { validate: "" };
          });
          break;
        case "Length":
          const lines = markUps[tool].data;
          lines.map((line) => {
            if (!line.aimId || line.aimId === aimOfInterest)
              markupsToReturn["Line"] = { validate: "" };
          });
          break;
        case "Probe":
          const points = markUps[tool].data;
          points.map((point) => {
            if (!point.aimId || point.aimId === aimOfInterest)
              markupsToReturn["Point"] = { validate: "" };
          });
          break;
      }
    });
  });
  return markupsToReturn;
}

export function setMarkupsOfAimActive(aimOfInterest) {
  const toolState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
  Object.keys(toolState).forEach((key) => {
    const markUps = toolState[key];
    Object.keys(markUps).map((tool) => {
      switch (tool) {
        case "FreehandRoi3DTool":
        case "FreehandRoi":
          const polygons3d = markUps[tool].data;
          polygons3d.map((polygon) => {
            if (!polygon.aimId || polygon.aimId === aimOfInterest)
              polygon["color"] = activeColor;
          });
          break;
        case "Bidirectional":
          const bidirectionals = markUps[tool].data;
          bidirectionals.map((bidirectional) => {
            if (!bidirectional.aimId || bidirectional.aimId === aimOfInterest)
              bidirectional["color"] = activeColor;
          });
          break;
        case "CircleRoi":
          const circles = markUps[tool].data;
          circles.map((circle) => {
            if (!circle.aimId || circle.aimId === aimOfInterest)
              circle["color"] = activeColor;
          });
          break;
        case "Length":
          const lines = markUps[tool].data;
          lines.map((line) => {
            if (!line.aimId || line.aimId === aimOfInterest)
              line["color"] = activeColor;
          });
          break;
        case "Probe":
          const points = markUps[tool].data;
          points.map((point) => {
            if (!point.aimId || point.aimId === aimOfInterest)
              point["color"] = activeColor;
          });
          break;
      }
    });
  });
}

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



export function getAimSeedDataFromStudy(study) {
  var obj = {};
  obj.aim = {};
  obj.study = {};
  obj.series = {};
  obj.equipment = {};
  obj.person = {};
  obj.image = [];
  const { aim, study: _study, series, equipment, person, image } = obj;
  const { studyUID, studyTime, studyDate, studyAccessionNumber, sex, patientName, patientID, birthdate } = study;

  aim.studyInstanceUid = studyUID || "";

  _study.startTime = studyTime || "";
  _study.instanceUid = studyUID || "";
  _study.startDate = studyDate || "";
  _study.accessionNumber = studyAccessionNumber || "";

  series.instanceUid = "";
  series.modality = "";
  series.number = "";
  series.description = "";
  series.instanceNumber = "";

  image.push({
    sopClassUid: "",
    sopInstanceUid: "",
  });

  equipment.manufacturerName = "";
  equipment.manufacturerModelName = "";
  equipment.softwareVersion = "";

  person.sex = sex || "";
  person.name = patientName || "";
  person.patientId = patientID || "";
  person.birthDate = birthdate || "";

  return obj;
}

export function addSemanticAnswersToSeedData(seedData, answers) {
  const {
    name,
    comment,
    imagingPhysicalEntityCollection,
    imagingObservationEntityCollection,
    inferenceEntity,
    typeCode,
  } = answers;
  seedData.aim.name = name;
  if (comment) seedData.aim.comment = comment;
  if (imagingPhysicalEntityCollection)
    seedData.aim.imagingPhysicalEntityCollection = imagingPhysicalEntityCollection;
  if (imagingObservationEntityCollection)
    seedData.aim.imagingObservationEntityCollection = imagingObservationEntityCollection;
  if (inferenceEntity) seedData.aim.inferenceEntity = inferenceEntity;
  if (typeCode) seedData.aim.typeCode = typeCode;
};

export function addUserToSeedData(seedData) {
  let obj = {};
  obj.loginName = sessionStorage.getItem("username");
  obj.name = sessionStorage.getItem("displayName");
  seedData.user = obj;
};

export function createStudyAim(study, answers, updatedAimId, trackingUId) {
  const seedData = this.getAimSeedDataFromStudy(study);
  this.addSemanticAnswersToSeedData(seedData, answers);
  this.addUserToSeedData(seedData);
  const aim = new Aim(
    seedData,
    enumAimType.studyAnnotation,
    updatedAimId,
    trackingUId
  );
  return aim;
}