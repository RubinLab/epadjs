// import external from '../externalModules.js';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

/**
 * Calculates a Standardized Uptake Value.
 * @export @public @method
 * @name calculateSUV
 *
 * @param  {Object} image            The image.
 * @param  {number} storedPixelValue The raw pixel value.
 * @param  {bool} [skipRescale=false]
 * @returns {number}                  The SUV.
 */
function calculateSUV(image, storedPixelValue, skipRescale = false) {
  // const cornerstone = external.cornerstoneWADOImageLoader;
  const metadata = cornerstoneWADOImageLoader.wadors.metaDataManager.get(image.imageId);

  if (!metadata) {
    return;
  }
  const modality = metadata['00080060'].Value[0];

  // Image must be PET
  if (modality !== 'PT') {
    return;
  }

  const modalityPixelValue = skipRescale
    ? storedPixelValue
    : storedPixelValue * image.slope + image.intercept;

  if (!metadata['00101030']) {
    return;
  }
  const patientWeight = metadata['00101030'].Value[0]; // In kg

  if (!metadata['00540016']) {
    return;
  }
  const radiopharmaceuticalInfo = metadata['00540016'].Value[0];
  if (!radiopharmaceuticalInfo['00181072'] || !radiopharmaceuticalInfo['00181074'] || !radiopharmaceuticalInfo['00181075']) {
    return;
  }

  const startTime = parseTime(radiopharmaceuticalInfo['00181072'].Value[0]);
  const totalDose = radiopharmaceuticalInfo['00181074'].Value[0];
  const halfLife = radiopharmaceuticalInfo['00181075'].Value[0];

  const seriesAcquisitionTime = parseTime(metadata['00080031'].Value[0]);

  if (!startTime || !totalDose || !halfLife || !seriesAcquisitionTime) {
    return;
  }
  const acquisitionTimeInSeconds =
    fracToDec(seriesAcquisitionTime.fractionalSeconds || 0) +
    seriesAcquisitionTime.seconds +
    seriesAcquisitionTime.minutes * 60 +
    seriesAcquisitionTime.hours * 60 * 60;

  const injectionStartTimeInSeconds =
    fracToDec(startTime.fractionalSeconds) +
    startTime.seconds +
    startTime.minutes * 60 +
    startTime.hours * 60 * 60;
  const durationInSeconds =
    acquisitionTimeInSeconds - injectionStartTimeInSeconds;
  const correctedDose =
    totalDose * Math.exp((-durationInSeconds * Math.log(2)) / halfLife);
  const suv = ((modalityPixelValue * patientWeight) / correctedDose) * 1000;
  return suv;
}

/**
 * Computes the raw pixel value from a given SUV.
 * @export @public @method
 * @name reverseSUV
 *
 * @param  {Object} image The image.
 * @param  {number} suv   The SUV value.
 * @param  {bool} [skipRescale=false]
 * @returns {number}       The raw pixel value.
 */
export function reverseSUV(image, suv, skipRescale = false) {
  const metadata = cornerstoneWADOImageLoader.wadors.metaDataManager.get(image.imageId);

  if (!metadata) {
    return;
  }
  const modality = metadata['00080060'].Value[0];

  // Image must be PET
  if (modality !== 'PT') {
    return;
  }

  if (!metadata['00101030']) {
    return;
  }
  const patientWeight = metadata['00101030'].Value[0]; // In kg

  if (!metadata['00540016']) {
    return;
  }
  const radiopharmaceuticalInfo = metadata['00540016'].Value[0];
  if (!radiopharmaceuticalInfo['00181072'] || !radiopharmaceuticalInfo['00181074'] || !radiopharmaceuticalInfo['00181075']) {
    return;
  }

  const startTime = parseTime(radiopharmaceuticalInfo['00181072'].Value[0]);
  const totalDose = radiopharmaceuticalInfo['00181074'].Value[0];
  const halfLife = radiopharmaceuticalInfo['00181075'].Value[0];

  const seriesAcquisitionTime = parseTime(metadata['00080031'].Value[0]);

  if (!startTime || !totalDose || !halfLife || !seriesAcquisitionTime) {
    return;
  }

  const acquisitionTimeInSeconds =
    fracToDec(seriesAcquisitionTime.fractionalSeconds || 0) +
    seriesAcquisitionTime.seconds +
    seriesAcquisitionTime.minutes * 60 +
    seriesAcquisitionTime.hours * 60 * 60;
  const injectionStartTimeInSeconds =
    fracToDec(startTime.fractionalSeconds) +
    startTime.seconds +
    startTime.minutes * 60 +
    startTime.hours * 60 * 60;
  const durationInSeconds =
    acquisitionTimeInSeconds - injectionStartTimeInSeconds;
  const correctedDose =
    totalDose * Math.exp((-durationInSeconds * Math.log(2)) / halfLife);

  // Calculate raw pixel value from SUV
  let modalityPixelValue = (suv * correctedDose) / (patientWeight * 1000);

  // Apply inverse rescale if needed
  if (!skipRescale) {
    modalityPixelValue = (modalityPixelValue - image.intercept) / image.slope;
  }

  return modalityPixelValue;
}

/**
 * Returns a decimal value given a fractional value.
 * @private
 * @method
 * @name fracToDec
 *
 * @param  {number} fractionalValue The value to convert.
 * @returns {number}                 The value converted to decimal.
 */
function fracToDec(fractionalValue) {
  return parseFloat(`.${fractionalValue}`);
}

function parseTime(timeStr) {
  // Ensure the input is padded correctly for parsing
  timeStr = parseFloat(timeStr).toFixed(2).padStart(9, '0');

  // Extract hours, minutes, seconds, and fractional part
  let hours = parseInt(timeStr.slice(0, 2));
  let minutes = parseInt(timeStr.slice(2, 4));
  let seconds = parseInt(timeStr.slice(4, 6));
  let fractionalSeconds = parseInt(timeStr.slice(8));

  // Return as an object
  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    fractionalSeconds: fractionalSeconds
  };
}

// Export calculateSUV as the default export
export default calculateSUV;
