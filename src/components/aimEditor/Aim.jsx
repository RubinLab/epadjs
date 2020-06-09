import aimConf from "./aimConf";
import { modalities } from "./modality";
import { generateUid } from "../../Utils/aid";

class Aim {
  constructor(imageData, aimType, updatedAimId) {
    this.temp = {};
    ({
      aim: this.temp.aim,
      study: this.temp.study,
      series: this.temp.series,
      image: this.temp.image,
      segmentation: this.temp.segmentation,
      equipment: this.temp.equipment,
      user: this.temp.user,
      person: this.temp.person,
    } = imageData);
    this.xmlns = aimConf.xmlns;
    this["xmlns:rdf"] = aimConf["xmlns:rdf"];
    this["xmlns:xsi"] = aimConf["xmlns:xsi"];
    this.aimVersion = aimConf.aimVersion;
    this["xsi:schemaLocation"] = aimConf["xsi:schemaLocation"];
    this.uniqueIdentifier = "";
    this.studyInstanceUid = { root: this.temp.aim.studyInstanceUid };
    this.seriesInstanceUid = { root: generateUid() };
    this.accessionNumber = { value: this.temp.study.accessionNumber };
    this.dateTime = { value: this.getDate() };
    this.user = this._createUser(this.temp.user);
    this.equipment = this._createEquipment(this.temp.equipment);
    this.person = this._createPerson(this.temp.person);
    this.imageAnnotations = {
      ImageAnnotation: [this._createImageAnnotations(aimType)],
    };
    if (updatedAimId === undefined)
      this.uniqueIdentifier = { root: generateUid() };
    else this.uniqueIdentifier = { root: updatedAimId };
  }

  static parse(data) {
    return new Aim(data);
  }

  // static getMarkups(aim) {
  //   let annotations = [];
  //   let annotation = {};
  //   const markupEntities =
  //     aim.imageAnnotations.ImageAnnotation.markupEntityCollection.MarkupEntity;

  //   if (markupEntities.constructor === Array) {
  //     markupEntities.map(markupEntity => {
  //       var imageId = markupEntity["imageReferenceUid"]["root"];
  //       var markupUid = markupEntity["uniqueIdentifier"]["root"];
  //       var calculations = this.getCalculationEntitiesOfMarkUp(aim, markupUid);
  //       annotations.push({
  //         imageId: imageId,
  //         markupType: markupEntity["xsi:type"],
  //         coordinates:
  //           markupEntity.twoDimensionSpatialCoordinateCollection
  //             .TwoDimensionSpatialCoordinate,
  //         calculations: calculations
  //       });
  //       this.getCalculationEntitiesOfMarkUp(aim);
  //     });
  //     return annotations;
  //   } else if (
  //     Object.entries(markupEntities).length !== 0 &&
  //     markupEntities.constructor === Object
  //   ) {
  //     const imageId = markupEntities["imageReferenceUid"]["root"];
  //     const markupUid = markupEntities["uniqueIdentifier"]["root"];
  //     const calculations = this.getCalculationEntitiesOfMarkUp(aim, markupUid);
  //     return {
  //       imageId: imageId,
  //       markupType: markupEntities["xsi:type"],
  //       coordinates:
  //         markupEntities.twoDimensionSpatialCoordinateCollection
  //           .TwoDimensionSpatialCoordinate,
  //       calculations: calculations
  //     };
  //   }
  // }

  getDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const day = ("0" + now.getDate()).slice(-2);
    const hours = ("0" + now.getHours()).slice(-2);
    const minutes = ("0" + now.getMinutes()).slice(-2);
    const seconds = ("0" + now.getSeconds()).slice(-2);
    return year + month + day + hours + minutes + seconds;
  };

  _createObject = (name, value) => {
    var obj = {};
    obj[name] = { value };
    return obj;
  };

  /*                                          */
  /*  Calculation Entitiy Realted Functions   */
  /*                                          */

  _createDimension = (label, index = 0, size = 1) => {
    return {
      Dimension: [
        Object.assign(
          {},
          this._createObject("index", index),
          this._createObject("size", size),
          this._createObject("label", label)
        ),
      ],
    };
  };

  _createDoubleDataType = () => {
    var obj = {
      dataType: {
        code: "C48870",
        codeSystem: "NCI",
        "iso:displayName": {
          "xmlns:iso": "uri:iso.org:21090",
          value: "Double",
        },
      },
    };
    return obj;
  };

  //preLabel is used for preceding the name like LongAxis || ShortAxis
  _createCalcResult = (unit, label, value, preLabel = "") => {
    var obj = this._createObject("unitOfMeasure", unit);
    Object.assign(obj, this._createDoubleDataType());
    obj["xsi:type"] = "CompactCalculationResult";
    obj["dimensionCollection"] = this._createDimension(preLabel + label);
    obj["type"] = "Scalar";
    Object.assign(obj, this._createObject("value", `${value}`));
    return obj;
  };

  //if called with the default values returns DCM type code
  _createTypeCode = (
    code = "11203",
    codeSystemName = "DCM",
    displayNameValue = "Attenuation Coefficient"
  ) => {
    var obj = {};
    obj["code"] = code;
    obj["codeSystemName"] = codeSystemName;
    obj["iso:displayName"] = {
      "xmlns:iso": "uri:iso.org:21090",
      value: displayNameValue,
    };
    return obj;
  };

  createLengthCalcEntity = (length) => {
    let { unit, value } = length;
    var obj = {};
    obj["calculationResultCollection"] = {
      CalculationResult: [this._createCalcResult(unit, "LineLength", value)],
    };
    obj["description"] = { value: "Length" };
    const uId = generateUid();
    obj["uniqueIdentifier"] = { root: uId };
    obj["typeCode"] = [this._createTypeCode("G-D7FE", "SRT", "Length")];
    obj["description"] = { value: "Length" };
    obj["calculationResultCollection"] = {
      CalculationResult: [this._createCalcResult(unit, "LineLength", value)],
    };
    this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection[
      "CalculationEntity"
    ].push(obj);
    return uId;
  };

  createLongAxisCalcEntity = (longAxis) => {
    let { unit, value } = longAxis;
    var obj = {};
    obj["calculationResultCollection"] = {
      CalculationResult: [this._createCalcResult(unit, "LongAxis", value)],
    };
    obj["description"] = { value: "LongAxis" };
    const uId = generateUid();
    obj["uniqueIdentifier"] = { root: uId };
    obj["typeCode"] = [this._createTypeCode("G-A185", "SRT", "LongAxis")];
    obj["description"] = { value: "LongAxis" };
    obj["calculationResultCollection"] = {
      CalculationResult: [this._createCalcResult(unit, "LongAxis", value)],
    };
    this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection[
      "CalculationEntity"
    ].push(obj);
    return uId;
  };

  createShortAxisCalcEntity = (shortAxis) => {
    let { unit, value } = shortAxis;
    var obj = {};
    obj["calculationResultCollection"] = {
      CalculationResult: [this._createCalcResult(unit, "ShortAxis", value)],
    };
    obj["description"] = { value: "ShortAxis" };
    const uId = generateUid();
    obj["uniqueIdentifier"] = { root: uId };
    obj["typeCode"] = [this._createTypeCode("G-A186", "SRT", "ShortAxis")];
    obj["description"] = { value: "ShortAxis" };
    obj["calculationResultCollection"] = {
      CalculationResult: [this._createCalcResult(unit, "ShortAxis", value)],
    };
    this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection[
      "CalculationEntity"
    ].push(obj);
    return uId;
  };

  createMeanCalcEntity = (value, preLabel) => {
    let typeCodeDcm,
      { unit, mean } = value;
    ({ unit, typeCodeDcm } = this._getAimUnitAndDcmTypeCode(unit));
    var obj = {};
    obj["calculationResultCollection"] = {
      CalculationResult: [this._createCalcResult(unit, "Mean", mean, preLabel)],
    };
    obj["description"] = { value: "Mean" };
    const uId = generateUid();
    obj["uniqueIdentifier"] = { root: uId };
    obj["typeCode"] = [
      typeCodeDcm,
      this._createTypeCode("R-00317", "SRT", "Mean"),
    ];
    obj["description"] = { value: "Mean" };
    obj["calculationResultCollection"] = {
      CalculationResult: [this._createCalcResult(unit, "Mean", mean, preLabel)],
    };
    this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection.CalculationEntity.push(
      obj
    );
    return uId;
  };

  createStdDevCalcEntity = (value, preLabel) => {
    let typeCodeDcm,
      { unit, stdDev } = value;
    ({ unit, typeCodeDcm } = this._getAimUnitAndDcmTypeCode(unit));

    var obj = {};
    obj["calculationResultCollection"] = {
      CalculationResult: [
        this._createCalcResult(unit, "Standard Deviation", stdDev, preLabel),
      ],
    };
    obj["description"] = { value: "Standard Deviation" };
    const uId = generateUid();
    obj["uniqueIdentifier"] = { root: uId };
    obj["typeCode"] = [
      typeCodeDcm,
      this._createTypeCode("R-10047", "SRT", "Standard Deviation"),
    ];
    obj["description"] = { value: "Standard Deviation" };
    obj["calculationResultCollection"] = {
      CalculationResult: [
        this._createCalcResult(unit, "Standard Deviation", stdDev, preLabel),
      ],
    };
    this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection[
      "CalculationEntity"
    ].push(obj);
    return uId;
  };

  createMinCalcEntity = (value, preLabel) => {
    let typeCodeDcm,
      { unit, min } = value;
    ({ unit, typeCodeDcm } = this._getAimUnitAndDcmTypeCode(unit));
    var obj = {};
    obj["calculationResultCollection"] = {
      CalculationResult: [
        this._createCalcResult(unit, "Minimum", min, preLabel),
      ],
    };
    obj["description"] = { value: "Minimum" };
    const uId = generateUid();
    obj["uniqueIdentifier"] = { root: uId };
    obj["typeCode"] = [
      typeCodeDcm,
      this._createTypeCode("R-404FB", "SRT", "Minimum"),
    ];
    obj["description"] = { value: "Minimum" };
    obj["calculationResultCollection"] = {
      CalculationResult: [
        this._createCalcResult(unit, "Minimum", min, preLabel),
      ],
    };
    this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection[
      "CalculationEntity"
    ].push(obj);
    return uId;
  };

  createMaxCalcEntity = (value, preLabel) => {
    let typeCodeDcm,
      { unit, max } = value;
    ({ unit, typeCodeDcm } = this._getAimUnitAndDcmTypeCode(unit));
    var obj = {};
    obj["calculationResultCollection"] = {
      CalculationResult: [
        this._createCalcResult(unit, "Maximum", max, preLabel),
      ],
    };
    obj["description"] = { value: "Maximum" };
    const uId = generateUid();
    obj["uniqueIdentifier"] = { root: uId };
    obj["typeCode"] = [
      typeCodeDcm,
      this._createTypeCode("G-A437", "SRT", "Maximum"),
    ];
    obj["description"] = { value: "Maximum" };
    obj["calculationResultCollection"] = {
      CalculationResult: [
        this._createCalcResult(unit, "Maximum", max, preLabel),
      ],
    };
    this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection[
      "CalculationEntity"
    ].push(obj);
    return uId;
  };

  _getAimUnitAndDcmTypeCode = (unit) => {
    if (unit === "hu")
      return { unit: "[hnsf'U]", typeCodeDcm: this._createTypeCode() };
    else if (unit === "suv")
      return {
        unit: "{SUVbw}g/ml",
        typeCodeDcm: this._createTypeCode(126401, "DCM", "SUVbw"),
      };
    return { unit, typeCodeDcm: this._createTypeCode() };
  };

  createVolumeCalcEntity = (value, preLabel) => {
    var { unit, volume } = value;
    var obj = {};
    obj["calculationResultCollection"] = {
      CalculationResult: [
        this._createCalcResult(unit, "Volume", volume, preLabel),
      ],
    };
    obj["description"] = { value: "Volume" };
    const uId = generateUid();
    obj["uniqueIdentifier"] = { root: uId };
    obj["typeCode"] = [this._createTypeCode("RID28668", "Radlex", "Volume")];
    obj["description"] = { value: "Volume" };
    obj["calculationResultCollection"] = {
      CalculationResult: [
        this._createCalcResult(unit, "Volume", volume, preLabel),
      ],
    };
    this.imageAnnotations.ImageAnnotation[0].calculationEntityCollection[
      "CalculationEntity"
    ].push(obj);
    return uId;
  };

  createCommonCalcEntites = (mean, stdDev, min, max, preLabel) => {
    var entities = [];
    entities.push(this.createMeanCalcEntity(mean, preLabel));
    entities.push(this.createStdDevCalcEntity(stdDev, preLabel));
    entities.push(this.createMinCalcEntity(min, preLabel));
    entities.push(this.createMaxCalcEntity(max, preLabel));
    return entities;
  };

  // createLineCalcEntities = (length, mean, stdDev, min, max) => {
  //   var entities = [];
  //   entities.push(this.createLengthCalcEntity(length));
  //   return entities.concat(
  //     this.createCommonCalcEntites(mean, stdDev, min, max)
  //   );
  // };

  createLongAxisCalcEntities = (longAxis, mean, stdDev, min, max) => {
    var entities = [];
    entities.push(this.createLongAxisCalcEntity(longAxis));
    return entities.concat(
      this.createCommonCalcEntites(mean, stdDev, min, max, "LongAxis_")
    );
  };

  createShortAxisCalcEntities = (shortAxis, mean, stdDev, min, max) => {
    var entities = [];
    entities.push(this.createShortAxisCalcEntity(shortAxis));
    return entities.concat(
      this.createCommonCalcEntites(mean, stdDev, min, max, "ShortAxis_")
    );
  };

  createCalculationEntityCollection = (entities) => {
    var obj = {};
    obj["calculationEntityCollection"] = { CalculationEntity: entities };
    return obj;
  };

  /*                                          */
  /*  Markup Entitiy Realted Functions        */
  /*                                          */

  _createCoordinate = (coordinate, index) => {
    var obj = {};
    obj["coordinateIndex"] = { value: index };
    obj["x"] = { value: coordinate.x };
    obj["y"] = { value: coordinate.y };
    return obj;
  };

  _createCoordinateArray = (points) => {
    var coordinates = [];
    points.forEach((point, index) => {
      coordinates.push(this._createCoordinate(point, index));
    });
    return coordinates;
  };

  addMarkupEntity = (type, shapeIndex, points, imageReferenceUid) => {
    const frameNumber = this._getFrameNumber(imageReferenceUid);
    if (frameNumber > -1)
      imageReferenceUid = imageReferenceUid.split("&frame=")[0]; //if multiframe strip the frame number from imageUID

    var obj = {};
    obj["includeFlag"] = { value: true };
    obj["twoDimensionSpatialCoordinateCollection"] = {
      TwoDimensionSpatialCoordinate: this._createCoordinateArray(points),
    };
    const uId = generateUid();
    obj["xsi:type"] = type;
    this.imageAnnotations.ImageAnnotation[0].markupEntityCollection.MarkupEntity.push(
      obj
    );
    obj["uniqueIdentifier"] = { root: uId };
    obj["shapeIdentifier"] = { value: shapeIndex };
    obj["includeFlag"] = { value: true };
    obj["imageReferenceUid"] = { root: imageReferenceUid };
    obj["referencedFrameNumber"] = { value: frameNumber };
    obj["twoDimensionSpatialCoordinateCollection"] = {
      TwoDimensionSpatialCoordinate: this._createCoordinateArray(points),
    };

    return uId;
  };

  _getFrameNumber = (imageReferenceUid) => {
    const frameNumber = imageReferenceUid.split("frame=");
    if (frameNumber.length > 1) return frameNumber[1];
    return 1;
  };

  /*                                          */
  /*  Image Refrence Entity Collection        */
  /*                                          */
  _createModality = () => {
    const sopClassUid = this.temp.image[0].sopClassUid;
    if (sopClassUid && modalities[sopClassUid])
      var {
        codeValue,
        codingSchemeDesignator,
        codeMeaning,
        codingSchemeVersion,
      } = modalities[sopClassUid];
    else {
      const modality = this.temp.series.modality;
      if (modality && modalities[modality]) {
        var {
          codeValue,
          codingSchemeDesignator,
          codeMeaning,
          codingSchemeVersion,
        } = modalities[modality];
      }
    }
    var obj = {};
    obj["code"] = codeValue || "";
    obj["codeSystemName"] = codingSchemeDesignator || "";
    obj["iso:displayName"] = {
      "xmlns:iso": "uri:iso.org:21090",
      value: codeMeaning || "",
    };
    obj["codeSystemVersion"] = codingSchemeVersion || "";
    return obj;
  };

  _createImageCollection = () => {
    let obj = {};
    obj["Image"] = [];
    this.temp.image.forEach((image) => {
      let { sopClassUid, sopInstanceUid } = image;
      sopClassUid = { root: sopClassUid };
      sopInstanceUid = { root: sopInstanceUid };
      obj["Image"].push({ sopClassUid, sopInstanceUid });
    });
    return obj;
  };

  _createImageSeries = () => {
    var obj = {};
    obj["instanceUid"] = { root: this.temp.series.instanceUid };
    obj["modality"] = this._createModality();
    obj["imageCollection"] = this._createImageCollection();
    return obj;
  };

  _createImageStudy = () => {
    const {
      accessionNumber,
      startTime,
      instanceUid,
      startDate,
    } = this.temp.study;
    var obj = {};
    obj["instanceUid"] = { root: instanceUid };
    obj["startDate"] = { value: startDate };
    obj["startTime"] = { value: startTime };
    obj["accessionNumber"] = { value: accessionNumber };
    obj["imageSeries"] = this._createImageSeries();
    return obj;
  };

  _createImageReferenceEntity = () => {
    var obj = {};
    obj["xsi:type"] = "DicomImageReferenceEntity";
    obj["uniqueIdentifier"] = { root: generateUid() };
    obj["imageStudy"] = this._createImageStudy();
    return obj;
  };

  _createImageReferanceEntityCollection = () => {
    var obj = {};
    obj["ImageReferenceEntity"] = [this._createImageReferenceEntity()];
    return obj;
  };

  //
  //
  //
  _createImageAnnotations = (aimType) => {
    const {
      name,
      comment,
      typeCode,
      imagingPhysicalEntityCollection,
      imagingObservationEntityCollection,
      inferenceEntityCollection,
    } = this.temp.aim;
    var obj = {};
    obj["uniqueIdentifier"] = { root: generateUid() };
    obj["typeCode"] = typeCode;
    obj["dateTime"] = { value: this.getDate() };
    obj["name"] = name;
    obj["comment"] = this._getComment(comment);
    obj["precedentReferencedAnnotationUid"] = { root: "" };
    if (imagingPhysicalEntityCollection)
      obj["imagingPhysicalEntityCollection"] = imagingPhysicalEntityCollection;
    if (aimType === 1) {
      //if this is an image annotation
      obj["calculationEntityCollection"] = { CalculationEntity: [] };
      obj["markupEntityCollection"] = { MarkupEntity: [] };
      obj["imageAnnotationStatementCollection"] = {
        ImageAnnotationStatement: [],
      };
    }
    if (imagingObservationEntityCollection)
      obj[
        "imagingObservationEntityCollection"
      ] = imagingObservationEntityCollection;
    if (inferenceEntityCollection)
      obj["inferenceEntityCollection"] = inferenceEntityCollection;
    obj[
      "imageReferenceEntityCollection"
    ] = this._createImageReferanceEntityCollection();
    return obj;
  };

  _getComment = (comment) => {
    if (comment.value.length)
      comment.value = this._getProgrammedComment().concat("~~", comment.value);
    else comment.value = this._getProgrammedComment();
    return comment;
  };

  _getProgrammedComment = () => {
    const SEPERATOR = " / ";
    const { modality, description, instanceNumber, number } = this.temp.series;
    const comment =
      modality +
      SEPERATOR +
      description +
      SEPERATOR +
      instanceNumber +
      SEPERATOR +
      number;
    return comment;
  };

  createImageAnnotationStatement = (referenceType, objectId, subjectId) => {
    //this is called externally
    var obj = {};
    var references;
    referenceType === 1
      ? (references = "CalculationEntityReferencesMarkupEntityStatement")
      : (references = "CalculationEntityReferencesSegmentationEntityStatement");
    obj["xsi:type"] = references;
    obj["subjectUniqueIdentifier"] = { root: subjectId };
    obj["objectUniqueIdentifier"] = { root: objectId };
    this.imageAnnotations.ImageAnnotation[0].imageAnnotationStatementCollection.ImageAnnotationStatement.push(
      obj
    );
  };

  // createImageAnnotationStatementCollection = () => {
  //   var obj = {};
  //   obj["ImageAnnotationStatement"] = [];
  //   return obj;
  // };

  // //
  // //
  // // Image Annotations
  // createImageAnnotation = (annotationStatementCollection = {}) => {
  //   var obj = {};
  //   obj["dateTime"] = { value: this.getDate() };
  //   obj[
  //     "imageAnnotationStatementCollection"
  //   ] = this.createImageAnnotationStatementCollection();
  //   return obj;
  // };

  // createImageAnnotations = imageAnnotation => {
  //   var obj = {};
  //   obj["imageAnnotations"] = imageAnnotation;
  //   return obj;
  // };

  /*                                                */
  /*    Segmentation Entitiy Realted Functions      */
  /*                                                */

  createSegmentationEntity = (segmentation) => {
    var obj = {};
    obj["referencedSopInstanceUid"] = {
      root: segmentation.referencedSopInstanceUid,
    };
    obj["segmentNumber"] = { value: 1 };
    obj["seriesInstanceUid"] = {
      root: segmentation.seriesInstanceUid,
    };
    obj["studyInstanceUid"] = {
      root: segmentation.studyInstanceUid,
    };
    obj["xsi:type"] = "DicomSegmentationEntity";
    obj["sopClassUid"] = { root: "1.2.840.10008.5.1.4.1.1.66.4" };
    obj["sopInstanceUid"] = { root: segmentation.sopInstanceUid };
    obj["uniqueIdentifier"] = { root: generateUid() };
    const imageAnnotation = this.imageAnnotations.ImageAnnotation[0];
    if (!imageAnnotation.segmentationEntityCollection) {
      imageAnnotation.segmentationEntityCollection = {};
      imageAnnotation.segmentationEntityCollection.SegmentationEntity = [];
    }
    imageAnnotation.segmentationEntityCollection.SegmentationEntity.push(obj);
    return obj["uniqueIdentifier"];
  };

  //
  //
  // Person
  _createPerson = (person) => {
    const { sex, name, patientId, birthDate } = person;
    return {
      name: { value: name },
      id: { value: patientId },
      birthDate: { value: birthDate },
      sex: { value: sex },
    };
  };

  //
  //
  // Eqipment
  _createEquipment = (equipment) => {
    const {
      manufacturerName,
      manufacturerModelName,
      softwareVersion,
    } = equipment;
    return {
      manufacturerName: { value: manufacturerName },
      manufacturerModelName: { value: manufacturerModelName },
      softwareVersion: { value: softwareVersion },
    };
  };

  //
  //
  // User
  _createUser = (user) => {
    const { loginName, name } = user;
    return {
      name: { value: name },
      loginName: { value: loginName },
      name: { value: name },
    };
  };

  getAim = () => {
    delete this["temp"];
    const stringAim = JSON.stringify(this);
    const wrappedAim = `{"ImageAnnotationCollection": ${stringAim} } `;
    return wrappedAim;
  };
}

export default Aim;
