import * as cornerstone from "cornerstone-core";
// import * as cornerstoneTools from "cornerstone-tools/dist/cornerstoneTools";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import auth from "../../services/authService";
import { connect } from "react-redux";

import OHIFSegmentationExtension from "../../ohif-segmentation-plugin";

// function getBlobUrl(url) {
//   const baseUrl = window.URL || window.webkitURL;
//   const blob = new Blob([`importScripts('${url}')`], {
//     type: "application/javascript"
//   });

//   return baseUrl.createObjectURL(blob);
// }

const Cornerstone = ({ dispatch }) => {
  // let webWorkerUrl = getBlobUrl(
  //   "https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.min.js"
  // );
  // let codecsUrl = getBlobUrl(
  //   "https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderCodecs.js"
  // );

  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
  cornerstoneTools.external.Hammer = Hammer;

  cornerstoneTools.init({ globalToolSyncEnabled: true, showSVGCursors: true });

  // OHIFSegmentationExtension.preRegistration();
  OHIFSegmentationExtension.preRegistration();

  // Set the tool font and font size
  // context.font = "[style] [variant] [weight] [size]/[line height] [font family]";
  const fontFamily =
    "Work Sans, Roboto, OpenSans, HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif";
  cornerstoneTools.textStyle.setFont(`12px ${fontFamily}`);

  // Set the tool width
  cornerstoneTools.toolStyle.setToolWidth(2);

  // Set color for inactive tools
  cornerstoneTools.toolColors.setToolColor("rgb(255, 255, 0)");

  // Set color for active tools
  cornerstoneTools.toolColors.setActiveColor("rgb(255, 255, 0)");

  cornerstoneTools.store.state.touchProximity = 40;
  cornerstoneTools.store.state.showCalculations = true;

  const config = {
    globalToolSyncEnabled: true,
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    // webWorkerPath: webWorkerUrl,
    webWorkerTaskPaths: [],
    taskConfiguration: {
      decodeTask: {
        // loadCodecsOnStartup: true,
        initializeCodecsOnStartup: false,
        // codecsPath: codecsUrl,
        usePDFJS: false,
        strict: false
      }
    },
    showSVGCursors: true
  };

  cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
  //cornerstoneWebImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

  cornerstoneWADOImageLoader.configure({
    beforeSend: function (xhr) {
      // Add custom headers here
      auth
        .getAuthHeader()
        .then(header => {
          if (header && header) {
            xhr.setRequestHeader("Authorization", header);
            // xhr.setRequestHeader("authorization", header);
            // xhr.setRequestHeader('access-token', token);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  });

  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

  // dispatch({
  //   type: "INIT_CORNER",
  //   payload: {
  //     cs: cornerstone,
  //     csT: cornerstoneTools
  //   }
  // });
  return null;
};

export default connect()(Cornerstone);
