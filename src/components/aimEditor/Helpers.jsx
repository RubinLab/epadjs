import cornerstoneTools from "cornerstone-tools";
import { Aim, enumAimType } from "aimapi";

const activeColor = "#ddd000";

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

export function getUserForAim() {
  return { userName: sessionStorage.getItem("username"), displayName: sessionStorage.getItem("displayName") };
};

// export function createStudyAim({ study, answers, updatedAimId, trackingUId }) {
//   const seedData = getAimSeedDataFromStudy(study);
//   addSemanticAnswersToSeedData(seedData, answers);
//   addUserToSeedData(seedData);
//   const aim = new Aim(
//     seedData,
//     enumAimType.studyAnnotation,
//     updatedAimId,
//     trackingUId
//   );
//   return aim;
// }
