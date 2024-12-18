import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Draggable from "react-draggable";
import cornerstone from "cornerstone-core";
import { getImageMetadata } from "../../services/imageServices"
import btoa from "./btoa";
import getBulkDataURI from "./getBulkDataURI";
import { DicomTags } from "./DICOMTags";
import "./MetaData.css";

const mapStateToProps = state => {
  return {
    activePort: state.annotationsListReducer.activePort,
    loading: state.annotationsListReducer.loading,
    openSeries: state.annotationsListReducer.openSeries
  };
};

const NewMetaData = (props) => {
    const [output, setOutput] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [input, setInput] = useState("");
    const [imageDownloaded, setImageDownloaded] = useState(false);

  const getImageData = async () => {
    let data = [];
    const { activePort } = props;
    const item = cornerstone.getEnabledElements()[activePort];
    const element = item ? item.element : null;
    const image = element ? cornerstone.getImage(element) : null;
    if (image && image.data) data = image.data;
    if (image && !image.data) {
      const imgURL = image.imageId.replace("wadors:", "").split('/frames/')[0];
      try {
        ({ data } = await getImageMetadata(imgURL));
      } catch(error2) {
        console.log("Couldn't get image metadata either!");
        console.error(error2);
      }   
    }
    return data[0];  
  }

  const fillImageData = async () => {
    const data = await getImageData();
    if (data) {
      formText(data);
      setImageDownloaded(true);
    }
  }

  useEffect(() => {
    fillImageData();
  }, [imageDownloaded, props.loading, props.activePort, props.openSeries[props.activePort].imageID])

  const formText = (data) => {
    let resultData = {};
    try {
      for (let tag in data) {
        const result = returnValueFromVR(data, data[tag], tag, !!data[tag].vr);
        resultData[tag] = result;
      }
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
    try {
      const display = [];
      for (const [tag, details] of Object.entries(metadata)) {
        let value = details.Value;
        let tagName = getTagName(tag);
        let text = `${tagName}: `;
        if (tagName && value && Array.isArray(value) && value.length > 0) {
          if ((typeof value[0] === 'string' || typeof value[0] === 'number') && text) {
            text = text + value.join(', ');
            display.push(text);
          } else if (typeof value[0] === 'object') {
            Object.entries(value[0])
              .forEach(([key, val]) => {
                if (typeof key === 'string' && key === 'Alphabetic') {
                  text = text + `${val}`;
                  display.push(text);
                  text = '';
                } else {
                  if (text) display.push(text);
                  text = `-- ${getTagName(key)}: ${val.Value && Array.isArray(val.Value) ? val.Value.join(', ') : val.Value ? val.Value : val}`
                  display.push(text);
                  text = '';
                }}
              );      
          } else {
            text = text + `${value[0]}`;
            display.push(text);
          }
        }
      }
      setOutput(display); 
      if (input) 
        filterOutput(input, display); 
    } catch (err) {
      console.error(err);
    }
  }

  const returnValueFromVR = (dataset, field, tag, withVR) => { 
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
  componentDidUpdate(prevProps) {
    if (prevProps.loading !== this.props.loading && !imageDownloaded) {
      this.fillImageData();
    }
  }
 */

  // helper function to see if a string only has ascii characters in it

  const filterOutput = (typed, data) => {
    const raw = data ? data : output;
    const filteredOutput = raw.filter(d => typed === '' || d.toLowerCase().includes(typed.toLowerCase()));
    setFiltered(filteredOutput);
  }

  const onChangeHandler = (e) => {
    const typed = e.target.value;
    setInput(typed)
    filterOutput(typed);
  }

  const renderList = () => {
    const listTorender = input ? filtered : output;
    return listTorender.map((el, i) => 
      <li className="metadata-line" key={`tag-${i}`}>
        <span className="metadata-line__tag">{`${el.split(':')[0]}:`}</span>
        <span className="metadata-line__info">{el.split(':')[1]}</span>
      </li>
      )
  }

    return (imageDownloaded && <Draggable handle="#handle">
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
          {output.length > 0 && (<ul className="metadata-list">{ renderList() }</ul>)}
        </div>
      </div>
      {/*  */}
    </Draggable>)
}

export default connect(mapStateToProps)(NewMetaData);
