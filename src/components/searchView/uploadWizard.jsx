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
      requirements: {},
      treeData: null,
      rawData: null
    };
  }

  handleRequirements = () => {
    this.setState(state => ({ showRequirements: !state.showRequirements }));
  };

  handleReqSelect = async e => {
    const { name, checked } = e.target;
    if (name === "RequireAll" && checked) {
      await this.setState({
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
      await this.setState({ requirements: {} });
    } else {
      const newRequirements = { ...this.state.requirements };
      newRequirements[name] && !checked
        ? delete newRequirements[name]
        : (newRequirements[name] = true);
      await this.setState({ requirements: newRequirements });
    }

    this.extractTreeData(this.state.rawData);
  };
  onSelectFile = async e => {
    const { files } = e.target;
    const nonDicomFiles = [];
    const promises = [];
    for (let i = 0, f; i < files.length; i += 1) {
      let extension = files[i].name.split(".").pop();
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
        this.setState({ rawData: datasets });
        this.extractTreeData(datasets);
      })
      .catch(err => console.log(err));
  };

  extractTreeData = datasets => {
    const result = {};

    datasets.forEach(data => {
      const { PatientID, StudyInstanceUID, SeriesInstanceUID } = data;
      const patient = result[PatientID];
      if (patient) {
        const study = patient.studies[StudyInstanceUID];
        if (study) {
          const series = study.series[SeriesInstanceUID];
          if (series) {
            series.imageCount += 1;
            if (this.checkMissingTags(data).length > 0 && !series.tagRequired) {
              series.tagRequired = data;
            }
          } else {
            result[PatientID].studies[StudyInstanceUID].series[
              SeriesInstanceUID
            ] = this.createSeries(data);
          }
        } else {
          result[PatientID].studies[StudyInstanceUID] = this.createStudy(data);
        }
      } else {
        result[PatientID] = this.createPatient(data);
      }
    });
    this.setState({ treeData: result });
  };

  createSeries = data => {
    const { SeriesInstanceUID, SeriesDescription } = data;
    const result = {
      seriesUID: SeriesInstanceUID,
      seriesDesc: SeriesDescription,
      imageCount: 1
    };
    if (this.checkMissingTags(data).length > 0) {
      result.tagRequired = data;
    }
    return result;
  };

  createStudy = data => {
    const {
      StudyInstanceUID,
      StudyDescription,
      SeriesInstanceUID,
      SeriesDescription
    } = data;
    const result = {
      studyUID: StudyInstanceUID,
      studyDesc: StudyDescription,
      series: {
        [SeriesInstanceUID]: {
          seriesUID: SeriesInstanceUID,
          seriesDesc: SeriesDescription,
          imageCount: 1
        }
      }
    };
    const series = result.series[SeriesInstanceUID];
    if (this.checkMissingTags(data).length > 0) {
      series.tagRequired = data;
    }
    return result;
  };

  createPatient = data => {
    const {
      PatientID,
      PatientName,
      StudyInstanceUID,
      StudyDescription,
      SeriesInstanceUID,
      SeriesDescription
    } = data;

    const result = {
      id: PatientID,
      Name: PatientName,
      studies: {
        [StudyInstanceUID]: {
          studyUID: StudyInstanceUID,
          studyDesc: StudyDescription,
          series: {
            [SeriesInstanceUID]: {
              seriesUID: SeriesInstanceUID,
              seriesDesc: SeriesDescription,
              imageCount: 1
            }
          }
        }
      }
    };
    const series = result.studies[StudyInstanceUID].series[SeriesInstanceUID];
    if (this.checkMissingTags(data).length > 0) {
      series.tagRequired = data;
    }
    return result;
  };

  checkMissingTags = dataset => {
    const missingTags = [];
    const requirements = Object.keys(this.state.requirements);
    requirements.forEach(req => {
      if (!dataset[req]) {
        missingTags.push(req);
      }
    });
    return missingTags;
  };

  clearSelectedFiles = () => {
    const element = document.getElementById("uploadWizard");
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
            id="uploadWizard"
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
    );
  }
}

export default UploadWizard;
