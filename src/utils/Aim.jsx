class Aim {
  constructor(aim = {}) {
    Object.assign(this, aim);
  }

  static parse(data) {
    return new Aim(data);
  }

  createLengthEntity = () => {};
}

export default Aim;

function createObject(name, value) {
  var obj = {};
  obj[name] = { value };
  return obj;
}

// IN REFACTORING WE SHOULD CHANGE THIS CODE TO FOLLOWING FOR EFFICIENCY
/*
var Vehicle = {
    type: "General",
    display: function(){console.log(this.type);}
}
var Car = Object.create(Vehicle); //create a new Car inherits from Vehicle
Car.type = "Car"; //overwrite the property
Car.display();//"Car"
Vehicle.display();//still "General"
*/

/*                                          */
/*  Calculation Entitiy Realted Functions   */
/*                                          */

function createDimension(label, index = 0, size = 1) {
  return {
    Dimension: Object.assign(
      {},
      createObject("size", size),
      createObject("index", index),
      createObject("label", label)
    )
  };
}

function createDoubleDataType() {
  var obj = {
    dataType: {
      code: "C48870",
      codeSystem: "NCI",
      "iso:displayName": { "xmlns:iso": "uri:iso.org:21090", value: "Double" }
    }
  };
  return obj;
}

function createCalcResult(unit, label, value, preLabel = "") {
  var obj = createObject("unitOfMeasure", unit);
  Object.assign(obj, createDoubleDataType());
  obj["xsi:type"] = "CompactCalculationResult";
  obj["dimensionCollection"] = createDimension(preLabel + label);
  obj["type"] = "scalar";
  Object.assign(obj, createObject("value", value));
  return obj;
}

//if called with the default values returns DCM type code
function createTypeCode(
  code = 11203,
  codeSystemName = "DCM",
  displayNameValue = "Attenuation Coefficient"
) {
  var obj = {};
  obj["code"] = code;
  obj["codeSystemName"] = codeSystemName;
  obj["iso:displayName"] = {
    "xmlns:iso": "uri:iso.org:21090",
    value: displayNameValue
  };
  return obj;
}

function createLengthCalcEntity(length) {
  let { unit, value, uId } = length;
  var obj = {};
  obj["calculationResultCollection"] = {
    CalculationResult: createCalcResult(unit, "LineLength", value)
  };
  obj["description"] = { value: "Length" };
  obj["uniqueIdentifier"] = { root: uId };
  obj["typeCode"] = [createTypeCode("G-D7FE", "SRT", "Length")];
  return obj;
}

function createLongAxisCalcEntity(longAxis) {
  let { unit, value, uId } = longAxis;
  var obj = {};
  obj["calculationResultCollection"] = {
    CalculationResult: createCalcResult(unit, "LongAxis", value)
  };
  obj["description"] = { value: "LongAxis" };
  obj["uniqueIdentifier"] = { root: uId };
  obj["typeCode"] = [createTypeCode("G-A185", "SRT", "LongAxis")];
  return obj;
}

function createShortAxisCalcEntity(shortAxis) {
  let { unit, value, uId } = shortAxis;
  var obj = {};
  obj["calculationResultCollection"] = {
    CalculationResult: createCalcResult(unit, "ShortAxis", value)
  };
  obj["description"] = { value: "ShortAxis" };
  obj["uniqueIdentifier"] = { root: uId };
  obj["typeCode"] = [createTypeCode("G-A186", "SRT", "ShortAxis")];
  return obj;
}

function createMeanCalcEntity(mean, preLabel) {
  let { unit, value, uId } = mean;
  var obj = {};
  obj["calculationResultCollection"] = {
    CalculationResult: createCalcResult(unit, "Mean", value, preLabel)
  };
  obj["description"] = { value: "Mean" };
  obj["uniqueIdentifier"] = { root: uId };
  obj["typeCode"] = [
    createTypeCode(),
    createTypeCode("R-00317", "SRT", "Mean")
  ];
  return obj;
}

function createStdDevCalcEntity(stdDev, preLabel) {
  let { unit, value, uId } = stdDev;
  var obj = {};
  obj["calculationResultCollection"] = {
    CalculationResult: createCalcResult(
      unit,
      "Standard Deviation",
      value,
      preLabel
    )
  };
  obj["description"] = { value: "Standard Deviation" };
  obj["uniqueIdentifier"] = { root: uId };
  obj["typeCode"] = [
    createTypeCode(),
    createTypeCode("R-10047", "SRT", "Standard Deviation")
  ];
  return obj;
}

function createMinCalcEntity(min, preLabel) {
  let { unit, value, uId } = min;
  var obj = {};
  obj["calculationResultCollection"] = {
    CalculationResult: createCalcResult(unit, "Minimum", value, preLabel)
  };
  obj["description"] = { value: "Minimum" };
  obj["uniqueIdentifier"] = { root: uId };
  obj["typeCode"] = [
    createTypeCode(),
    createTypeCode("R-404FB", "SRT", "Minimum")
  ];
  return obj;
}

function createMaxCalcEntity(max, preLabel) {
  let { unit, value, uId } = max;
  var obj = {};
  obj["calculationResultCollection"] = {
    CalculationResult: createCalcResult(unit, "Maximum", value, preLabel)
  };
  obj["description"] = { value: "Maximum" };
  obj["uniqueIdentifier"] = { root: uId };
  obj["typeCode"] = [
    createTypeCode(),
    createTypeCode("G-A437", "SRT", "Maximum")
  ];
  return obj;
}

function createCommonCalcEntites(mean, stdDev, min, max, preLabel) {
  var entities = [];
  entities.push(createMeanCalcEntity(mean, preLabel));
  entities.push(createStdDevCalcEntity(stdDev, preLabel));
  entities.push(createMinCalcEntity(min, preLabel));
  entities.push(createMaxCalcEntity(max, preLabel));
  return entities;
}

function createLineCalcEntities(length, mean, stdDev, min, max) {
  var entities = [];
  entities.push(createLengthCalcEntity(length));
  return entities.concat(createCommonCalcEntites(mean, stdDev, min, max));
}

function createLongAxisCalcEntities(longAxis, mean, stdDev, min, max) {
  var entities = [];
  entities.push(createLongAxisCalcEntity(longAxis));
  return entities.concat(
    createCommonCalcEntites(mean, stdDev, min, max, "LongAxis_")
  );
}

function createShortAxisCalcEntities(shortAxis, mean, stdDev, min, max) {
  var entities = [];
  entities.push(createShortAxisCalcEntity(shortAxis));
  return entities.concat(
    createCommonCalcEntites(mean, stdDev, min, max, "ShortAxis_")
  );
}

function createCalculationEntityCollection(entities) {
  var obj = {};
  obj["calculationEntityCollection"] = { CalculationEntity: entities };
  return obj;
}

/*                                          */
/*  Markup Entitiy Realted Functions        */
/*                                          */

function createCoordinate(coordinate, index) {
  var obj = {};
  obj["x"] = { value: coordinate.x };
  obj["coordinateIndex"] = { value: index };
  obj["y"] = { value: coordinate.y };
  return obj;
}

function createCoordinateArray(points) {
  var coordinates = [];
  points.forEach((point, index) => {
    coordinates.push(createCoordinate(point, index));
  });
  return coordinates;
}

function createMarkupEntity(type, shapeIndex, points, frameNumber = 1) {
  //frameNumber should only be sent in multiframes
  var obj = {};
  obj["includeFlag"] = { value: true };
  obj["shapeIdentifier"] = { value: shapeIndex };
  obj["referencedFrameNumber"] = { value: frameNumber };
  obj["xsi:type"] = type;
  obj["twoDimensionSpatialCoordinateCollection"] = {
    TwoDimensionSpatialCoordinate: createCoordinateArray(points)
  };
  obj["uniqueIdentifier"] = { root: "?" };
  obj["imageReferenceUid"] = { root: "?" };
  return obj;
}

function createMarkupEntityCollection(entities) {
  var obj = {};
  obj["markupEntityCollection"] = { MarkupEntity: entities };
  return obj;
}

function createModality(code, codeSystemName, displayName, codeSystemVersion) {
  var obj = {};
  obj["code"] = code;
  obj["codeSystemName"] = codeSystemName;
  obj["iso:displayName"] = {
    "xmlns:iso:": "uri:iso.org:21090",
    value: displayName
  };
  obj["codeSystemVersion"] = codeSystemName;
  return obj;
}

function createImageCollection(sopClass, sopInstance) {
  var obj = {};
  var sopClass = { root: sopClass };
  var sopInstance = { root: sopInstance };
  obj["Image"] = { sopClassUid: sopClass, sopInstanceUid: sopInstance };
  return obj;
}
