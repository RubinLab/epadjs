import React from "react";
import { Rnd } from "react-rnd";
import * as dcmjs from "dcmjs";
import { FaTimes } from "react-icons/fa";
import { Tabs, Nav, Content } from "react-tiny-tabs";
import TagRequirements from "./tagRequirementList";
import "./searchView.css";
import { th } from "date-fns/esm/locale";

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "solid 1px #ddd",
  //   width: "fit-content",
  height: "fit-content"
};

class UploadWizard extends React.Component {
  constructor() {
    super();
    this.state = {
      x: 100,
      y: 100,
      path: null,
      showRequirements: false,
      requirements: {}
    };
  }

  // walk = (obj, dir, done) => {
  //   var results = [];
  //   fs.readdir(dir, function(err, list) {
  //     if (err) return done(err);
  //     var pending = list.length;
  //     if (!pending) return done(null, results);
  //     list.forEach(function(file) {
  //       file = path.resolve(dir, file);
  //       fs.stat(file, function(err, stat) {
  //         if (stat && stat.isDirectory()) {
  //           walk(file, function(err, res) {
  //             results = results.concat(res);
  //             if (!--pending) done(null, results);
  //           });
  //         } else {
  //           results.push(file);
  //           if (!--pending) done(null, results);
  //         }
  //     });
  //   });
  // };

  handleRequirements = () => {
    this.setState(state => ({ showRequirements: !state.showRequirements }));
  };

  handleReqSelect = e => {
    const { name, checked } = e.target;
    console.log(name, checked);
    if (name === "RequireAll" && checked) {
      console.log(" ---- 000 here");
      this.setState({
        requirements: {
          PatientID: true,
          PatientName: true,
          StudyInstanceUID: true,
          StudyDescription: true,
          SeriesInstanceUID: true,
          SeriesDescription: true
        }
      });
    } else if (name === "RequireAll" && !checked) {
      this.setState({ requirements: {} });
    } else {
      const newRequirements = { ...this.state.requirements };
      newRequirements[name] && !checked
        ? delete newRequirements[name]
        : (newRequirements[name] = true);
      this.setState({ requirements: newRequirements });
    }
  };
  onSelectFile = async e => {
    const { files } = e.target;
    const nonDicomFiles = [];
    const promises = [];
    // iterate over the files
    console.log(Date.now());
    for (let i = 0, f; i < files.length; i += 1) {
      let extension = files[i].name.split(".").pop();
      // if file does not have dcm extension put them in another array for warning
      if (extension !== "dcm") {
        nonDicomFiles.push(files[i].name);
        continue;
      }
      const blob = new Blob([files[i]], {
        type: "application/dicom"
      });
      promises.push(this.getDataset(blob));
    }

    Promise.all(promises)
      .then(datasets => {
        console.log(datasets);
        //   datasets.forEach(data => {
        //     console.log(data);
        //   });
        console.log(Date.now());
      })
      .catch(err => console.log(err));
    // if file is dicom check if it meets the requirements
    // form the object stucture as
    // {patientID: {studyUID: {seriesUID: {countOfDicom: #, tagReq: imgID: {dataset}}}}}
  };

  checkRequirements = dataset => {
    const result = [];
    const requirements = Object.keys(this.state.requirements);
    requirements.forEach(req => {
      if (!dataset[req]) {
        result.push(req);
      }
    });
    return result;
  };

  getDataset = fileBlob => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      try {
        let dataset;
        let arrayBuffer;
        fileReader.onload = event => {
          arrayBuffer = event.target.result;
          let DicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer);
          dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
            DicomDict.dict
          );
          //   return dataset;
          // };
          resolve(dataset);
        };
      } catch (err) {
        reject("Error in reading dicom dataset", err);
      }
      fileReader.readAsArrayBuffer(fileBlob);
    });
  };

  render() {
    return (
      <Rnd
        style={style}
        // size={{ width: this.state.width, height: this.state.height }}
        position={{ x: this.state.x, y: this.state.y }}
        onDragStop={(e, d) => {
          this.setState({ x: d.x, y: d.y });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          this.setState({
            width: ref.style.width,
            height: ref.style.height,
            ...position
          });
        }}
        className="uploadWizard-modal"
      >
        <div className="uploadWizard">
          <div className="uploadWizard-header">
            <div className="uploadWizard-header__title">ePAD Upload Wizard</div>
            <div className="menu-clickable" onClick={this.props.onClose}>
              <FaTimes />
            </div>
          </div>
          <input
            type="file"
            className="upload-display"
            multiple={true}
            // name="tiff"
            webkitdirectory="true"
            directory="true"
            onChange={this.onSelectFile}
          />
          <button className="upload-display" onClick={this.handleRequirements}>
            Define Requirements
          </button>
          {this.state.showRequirements && (
            <TagRequirements
              handleInput={this.handleReqSelect}
              onClose={this.handleRequirements}
              requirements={Object.keys(this.state.requirements)}
            />
          )}
        </div>
      </Rnd>
      // read file and get the path use the following code to read data
      /* 
        const filePath = "/Users/pieper/data/public-dicom/MRHead-multiframe+seg/MRHead-multiframe.dcm"
        let arrayBuffer = fs.readFileSync(filePath).buffer;
        let DicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer);
        const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(DicomDict.dict);
        console.log(dataset);
      */
    );
  }
}

export default UploadWizard;
