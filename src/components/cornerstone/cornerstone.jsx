import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import { connect } from "react-redux";

function getBlobUrl(url) {
  const baseUrl = window.URL || window.webkitURL;
  const blob = new Blob([`importScripts('${url}')`], {
    type: "application/javascript"
  });

  return baseUrl.createObjectURL(blob);
}

const Cornerstone = ({ dispatch }) => {
  let webWorkerUrl = getBlobUrl(
    "https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.min.js"
  );
  let codecsUrl = getBlobUrl(
    "https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderCodecs.js"
  );

  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
  //cornerstoneTools.external.Hammer = Hammer;
  //cornerstoneWebImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

  const config = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    webWorkerPath: webWorkerUrl,
    //webWorkerTaskPaths: [webWorkerTaskPath],
    taskConfiguration: {
      decodeTask: {
        loadCodecsOnStartup: true,
        initializeCodecsOnStartup: false,
        codecsPath: codecsUrl,
        usePDFJS: false
      }
    }
  };

  const confug = {
    drawAllMarkers: true
  };

  cornerstoneTools.orientationMarkers.setConfiguration(confug);
  cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
  dispatch({
    type: "INIT_CORNER",
    payload: {
      cs: cornerstone,
      csT: cornerstoneTools
    }
  });
  return null;
};

export default connect()(Cornerstone);
