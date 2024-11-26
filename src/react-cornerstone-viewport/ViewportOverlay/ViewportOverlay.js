import { PureComponent } from "react";
import React from "react";
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import PropTypes from "prop-types";
import cornerstone from "cornerstone-core";
import dicomParser from "dicom-parser";
import { helpers } from "../helpers/index.js";
import "./ViewportOverlay.css";

const {
  formatPN,
  formatDA,
  formatNumberPrecision,
  formatTM,
  isValidNumber,
} = helpers;

function getCompression(imageId) {
  const generalImageModule =
    cornerstone.metaData.get("generalImageModule", imageId) || {};
  const {
    lossyImageCompression,
    lossyImageCompressionRatio,
    lossyImageCompressionMethod,
  } = generalImageModule;

  if (lossyImageCompression === "01" && lossyImageCompressionRatio !== "") {
    const compressionMethod = lossyImageCompressionMethod || "Lossy: ";
    const compressionRatio = formatNumberPrecision(
      lossyImageCompressionRatio,
      2
    );
    return compressionMethod + compressionRatio + " : 1";
  }

  return "Lossless / Uncompressed";
}

class ViewportOverlay extends PureComponent {
  static propTypes = {
    scale: PropTypes.number.isRequired,
    windowWidth: PropTypes.number.isRequired,
    windowCenter: PropTypes.number.isRequired,
    imageId: PropTypes.string.isRequired,
    imageIndex: PropTypes.number.isRequired,
    stackSize: PropTypes.number.isRequired,
  };

  formDate = (date, time) => {
    const year = date ? date.substring(0, 4): '1900';
    const monthIndex = date ? parseInt(date.substring(4, 6)) - 1: '01';
    const day = date ? date.substring(6, 8) : '01';
    const hour = time ? time.substring(0, 2) : '00';
    const min = time ? time.substring(2, 4) : '00';
    const sec = time ? time.substring(4, 6) : '00';
    return new Date(year, monthIndex, day, hour, min, sec);
  }

  calculateAge = (studyObj, dobObj) => {
    let age = '';
    const studyDate = this.formDate(studyObj.date, studyObj.time);
    const dobDate = this.formDate(dobObj.date, dobObj.time);
    const timeDiff = studyDate.getTime() - dobDate.getTime();
    const timeDiffDate = new Date(timeDiff);
    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
    const years = timeDiffDate.getFullYear() - 1970;
    if (dayDiff <= 59) {
      age = `${dayDiff}-day-old `;
    } else if (years < 2) {
      let months = (studyDate.getFullYear() - dobDate.getFullYear()) * 12;
      months += studyDate.getMonth() - dobDate.getMonth();
      age = `${months}mo `;
    } else {
      age = `${years}yo `;
    }
    return age;
  }

  render() {
    const { imageId, scale, windowWidth, windowCenter } = this.props;

    if (!imageId) {
      return null;
    }

    const zoomPercentage = formatNumberPrecision(scale * 100, 0);
    const seriesMetadata =
      cornerstone.metaData.get("generalSeriesModule", imageId) || {};

    const imagePlaneModule =
      cornerstone.metaData.get("imagePlaneModule", imageId) || {};
    const { rows, columns, sliceThickness, sliceLocation } = imagePlaneModule;
    const { seriesNumber } = seriesMetadata;
    // const { seriesDescription } =
    //   cornerstone.metaData.get("specialSeriesModule", imageId) || {};

    const metadata = cornerstoneWADOImageLoader.wadors.metaDataManager.get(imageId);
    const seriesDescription = metadata['0008103E'] && metadata['0008103E'].Value && metadata['0008103E'].Value[0]
      ? metadata['0008103E'].Value[0] : '';
    const generalStudyModule =
      cornerstone.metaData.get("generalStudyModule", imageId) || {};
    const { studyDate, studyTime, studyDescription } = generalStudyModule;

    const patientModule =
      cornerstone.metaData.get("patientModule", imageId) || {};
    const { patientId, patientName, patientSex, patientBirthDate } = patientModule;

    const age = this.calculateAge({ date: studyDate, time: studyTime }, { date: patientBirthDate });

    const generalImageModule =
      cornerstone.metaData.get("generalImageModule", imageId) || {};
    const { instanceNumber } = generalImageModule;

    const cineModule = cornerstone.metaData.get("cineModule", imageId) || {};
    const { frameTime } = cineModule;

    const frameRate = formatNumberPrecision(1000 / frameTime, 1);
    const compression = getCompression(imageId);
    const precision = Math.abs(windowWidth) <= 20 ? 2 : 0;
    const wwwc = `W: ${windowWidth.toFixed(precision)} L: ${windowCenter.toFixed(precision)}`;
    const imageDimensions = `${columns} x ${rows}`;

    const { imageIndex, stackSize } = this.props;

    const normal = (
      <React.Fragment>
        <div className="top-left overlay-element">
          <div>{formatPN(patientName)}</div>
          <div>{patientId}</div>
          <div>{`${patientSex} / ${age}`}</div>
        </div>
        <div className="top-right overlay-element">
          <div>{studyDescription}</div>
          <div>
            {formatDA(studyDate)} {formatTM(studyTime)}
          </div>
        </div>
        <div className="bottom-right overlay-element">
          <div>Zoom: {zoomPercentage}%</div>
          <div>{wwwc}</div>
          <div className="compressionIndicator">{compression}</div>
        </div>
        <div className="bottom-left overlay-element">
          <div>{seriesNumber >= 0 ? `Ser: ${seriesNumber}` : ""}</div>
          <div>
            {stackSize > 1
              ? `Img: ${instanceNumber} ${imageIndex}/${stackSize}`
              : ""}
          </div>
          <div>
            {frameRate >= 0 ? `${formatNumberPrecision(frameRate, 2)} FPS` : ""}
            <div>{imageDimensions}</div>
            <div>
              {isValidNumber(sliceLocation)
                ? `Loc: ${formatNumberPrecision(sliceLocation, 2)} mm `
                : ""}
              {sliceThickness
                ? `Thick: ${formatNumberPrecision(sliceThickness, 2)} mm`
                : ""}
            </div>
            <div>{seriesDescription}</div>
          </div>
        </div>
      </React.Fragment>
    );

    return <div className="ViewportOverlay">{normal}</div>;
  }
}

export default ViewportOverlay;
