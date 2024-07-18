import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Draggable from "react-draggable";
import cornerstone from "cornerstone-core";
import DOMPurify from 'dompurify'
import * as dcmjs from "dcmjs";
import dicomParser from 'dicom-parser';
import { uids } from "./uids";
import { getImageMetadata, getImage } from "../../services/imageServices"
import { getMetadata } from "../../services/seriesServices";
import { getAuthHeader } from "../../services/authService";
import btoa from "./btoa";
import getBulkDataURI from "./getBulkDataURI";
import { DicomTags } from "./DICOMTags";

import "./MetaData.css";

const mapStateToProps = state => {
  return {
    activePort: state.annotationsListReducer.activePort,
    loading: state.annotationsListReducer.loading
  };
};

const NewMetaData = (props) => {
    // console.log(" =====> props", props);
    const [output, setOutput] = useState([]);
    const [input, setInput] = useState("");
    const [imageDownloaded, setImageDownloaded] = useState(false);

//   constructor(props) {
//     super(props);
//     this.state = {
//       output: [],
//       input: "",
//       imageDownloaded: false
//     }
//     this.dumpDataSet = this.dumpDataSet.bind(this);
//     this.getImageData = this.getImageData.bind(this);
//     this.fillImageData = this.fillImageData.bind(this);
//   }

  const getImageData = async () => {
    let data = null;
    // check if the image has data
    const { activePort } = props;
    const item = cornerstone.getEnabledElements()[activePort];
    const element = item ? item.element : null;
    const image = element ? cornerstone.getImage(element) : null;
    // console.log(" ====> image", image);
    if (image.data) data = image.data;
    // if not get series metada 
    // const response = await getImage(props.imageData.imageID.replace("wadors:", ""));
    // const arrayBuffer = await response.arrayBuffer();
    // console.log(" +++++> array buffer", arrayBuffer);
    // const byteArray = new Uint8Array(arrayBuffer);
    // const dataSet = dicomParser.parseDicom(byteArray);
    // console.log(" ===> dataSet", dataSet);
    if (!image.data && props.imageData) {
        // getImageMetadata
        try { 
            const seriesURL = props.imageData.imageID.replace("wadors:", "").split("/instances/")[0];
            ({ data } = await getMetadata(seriesURL));
            data = data[props.imageData.index];
            // if fails get metadata for the image
        } catch (error1) {
            console.log("Couldn't get series metadata! Trying image metadata call");
            console.error(error1);
            try {
                ({ data } = await getImageMetadata(props.imageData.imageID));
                console.log(' ===> array?', Array.isArray(data));
            } catch(error2) {
                console.log("Couldn't get image metadata either!");
                console.error(error2);
            }
        }
    }
    return data;  
  }

  const fillImageData = async () => {
    const data = await getImageData();
    // console.log(" ++++++++++++> fillImageData", data);
    const tempOutput = [];
    if (data) {
      // console.log(" ++++> data", data);  
      formText(data, tempOutput);
      setImageDownloaded(true);
    }
    setOutput(tempOutput);
  }

  useEffect(() => {
    fillImageData();
  }, [imageDownloaded])

  const formText = (data) => {
    let resultData = {};
    try {
        for (let tag in data) {
            const result = returnValueFromVR(data, data[tag], tag, !!data[tag].vr);
            resultData[tag] = result;
        }
        // console.log(" ==> result", resultData);
        printDicomMetadata(resultData);
    } catch (err) {
        console.log(" ++++> error in reding tags");
        console.error(err);
    }
  }

  const getTagName = tag => {
    return DicomTags[tag]? DicomTags[tag].split(',')[0] : null;
  }

  const printDicomMetadata = (metadata) => {
    const display = [];
    for (const [tag, details] of Object.entries(metadata)) {
        let value = details.Value;
        let tagName = getTagName(tag);
        let text = `${tagName}: `;
        if (tagName && value && Array.isArray(value) && value.length > 0) {
          if (typeof value[0] === 'string' || typeof value[0] === 'number') {
            // Handle different value representations
            value = value.join(', ');
          } else if (typeof value[0] === 'object') {
              value = Object.entries(value[0])
                  .map(([key, val]) => `${getTagName(key)}: ${val.Value}`)
                  .join(' ');
          } else {
              value = value[0];
          }
          text = text + `${value}`;
          display.push(text);
      }
    }
    console.log(display);
  }

  const returnValueFromVR = (dataset, field, tag, withVR) => { 
    // console.log(" +++++> returnValueFromVR <++++++");
    // console.log(field, tag, withVR) ;
    var Value = field.Value;
    var vr = field.vr;
  
    var result = '';
    if (withVR) {
      result = {
        'vr': vr
      };
    }
  
    var studyUID = 'NA';
    var seriesUID = 'NA';
    var instanceUID = 'NA';
  
    if (dataset['0020000D'].Value[0]) {
      studyUID = dataset['0020000D'].Value[0];
    }
  
    if (dataset['0020000E'].Value[0]) {
      seriesUID = dataset['0020000E'].Value[0];
    }
  
    if (dataset['00080018'].Value[0]) {
      instanceUID = dataset['00080018'].Value[0];
    }
  
    switch (vr) {
      case "PN":
        if (Value && Value[0]) {
          if (withVR) {          
            if (Value[0].Alphabetic)
              result.Value = [
                {
                  Alphabetic: Value[0].Alphabetic,
                },
              ];
            else
              result.Value = [
                {
                  "Alphabetic": Value[0]
                },
              ];
          } else result = Value;
        }
        break;
      case "DS":
        // Note: Some implementations, such as dcm4chee,
        // include .0 on all decimal strings, but we don't.
        if (withVR) result.Value = Value.map(parseFloat);
        else result = Value.map(parseFloat);
        break;
      case "IS":
        if (withVR)
          result.Value = Value.map(function(a) {
            return parseInt(a, 10);
          });
        else
          result = Value.map(function(a) {
            return parseInt(a, 10);
          });
        break;
      case "UN":
        // TODO: Not sure what the actual limit should be,
        // but dcm4chee will use BulkDataURI if the Value
        // is too large. We should do the same
        // console.log(" ===> field", field);
        if (Value && Value[0].length < 100) {
          var converted = btoa(Value[0]);
          if (converted) {
            if (withVR) result.InlineBinary = converted;
            else result = converted;
          }
        } else {
          if (withVR) result.BulkDataURI = getBulkDataURI(studyUID, seriesUID, instanceUID, tag);
          else result = getBulkDataURI(studyUID, seriesUID, instanceUID, tag);
        }
  
        break;
      case "OW":
        if (withVR) result.BulkDataURI = getBulkDataURI(studyUID, seriesUID, instanceUID, tag);
        else result = getBulkDataURI(studyUID, seriesUID, instanceUID, tag);
        break;
      default:
        if (
          Value &&
          Value.length &&
          !(Value.length === 1 && (Value[0] === undefined || Value[0] === ''))
        ) {
          if (withVR) result.Value = Value;
          else result = Value;
        }
    }
  
    return result;
  };
  /*
  componentDidMount() {
    fillImageData();
    // // const dataset = dcmjs.data.DicomMetaDictionary.namifyDataset(elements);
    // Object.keys(elements).forEach(tag => {
    //   const data = Object.assign({}, elements[tag]);
    //   Object.keys(data.Value).forEach(index => {
    //     console.log("inner", data.Value[index], index);
    //   });
    // });
    // console.log("namedDataset", namedDataset);
  }


  componentDidUpdate(prevProps) {
    if (prevProps.loading !== this.props.loading && !imageDownloaded) {
      this.fillImageData();
    }
  }
 */

  // helper function to see if a string only has ascii characters in it

  const onChangeHandler = (e) => {
    setInput(e.target.value)
  }

  const lowerInput = input.toLowerCase();
  const list = output.filter(d => input === '' || d.toLowerCase().includes(lowerInput));

  const listHtml = { __html: DOMPurify.sanitize(list.join('')) };

    return (imageDownloaded ? <Draggable handle="#handle">
      <div className="md-pop-up">
        <div className="close-meta-data-menu" onClick={props.onClose}>
          <a href="#">X</a>
        </div>
        <div id="handle" className="buttonLabel">
          <span>Meta Data of Image</span>
        </div>
        <hr />
        <div> Filter :
          <input value={input} type="text" onChange={onChangeHandler} />
        </div>
        <div>
          {output.length && (<ul dangerouslySetInnerHTML={listHtml} />)}
        </div>
      </div>
      {/*  */}
    </Draggable> : null)
}

export default connect(mapStateToProps)(NewMetaData);
