import React from "react";
import { connect } from "react-redux";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import * as dcmjs from "dcmjs";
import { FaTimes } from "react-icons/fa";
import TagRequirements from "./tagRequirementList";
import TagEditTree from "./tagEditTable";
import TagEditor from "./tagEditor";
import { isEmpty, extractTableData } from "../../Utils/aid";
import Modal from "../management/common/customModal";
import {
  getImageIds,
  getImageArrayBuffer,
} from "../../services/seriesServices";
import "../searchView/searchView.css";
// import "react-tabs/style/react-tabs.css";
import "./tagEditor.css";

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "solid 1px #ddd",
  //   width: "fit-content",
  height: "fit-content",
};

class UploadWizard extends React.Component {
  constructor() {
    super();
    this.state = {
      x: 100,
      y: 100,
      path: null,
      showRequirements: false,
      requirements: {
        PatientIDLO: true,
        PatientNamePN: true,
        StudyInstanceUIDUI: true,
        StudyDescriptionLO: true,
        SeriesInstanceUIDUI: true,
        SeriesDescriptionLO: true,
      },
      treeData: null,
      rawData: null,
      showTagEditor: false,
      tabIndex: 2,
      seriesIndex: 0,
      tagValues: {},
      error: "",
    };
  }

  handleTagInput = (e, tagName, tagValue) => {
    let name, value;
    if (e) {
      name = e.target.name;
      value = e.target.value;
      if (name || value) {
        if (!value) this.setState({ error: `Please fill the ${name}` });
        else {
          this.setState({ error: "" });
          this.storeTagValuePair(name, value);
        }
      }
    } else if (tagName && tagValue) {
      this.storeTagValuePair(tagName, tagValue);
    }
  };

  storeTagValuePair = (tagName, tagValue) => {
    const tags = { ...this.state.tagValues };
    tags[tagName] = tagValue;
    this.setState({ tagValues: tags });
  };

  handleButtonClick = e => {
    let confirm;
    const { name } = e.target;
    let seriesIndex = this.state.seriesIndex;
    const seriesArr = Object.keys(this.props.selectedSeries);
    const newTag = this.checkNewTag();
    if (name === "back" && seriesIndex > 0) {
      if (newTag) {
        confirm = window.confirm("You are going to lose unsaved changes!");
        if (confirm) {
          seriesIndex -= 1;
          this.setState({ seriesIndex, tagValues: {} });
        } else {
          return;
        }
      } else {
        seriesIndex -= 1;
        this.setState({ seriesIndex, tagValues: {} });
      }
    } else if (name === "next" && seriesIndex < seriesArr.length - 1) {
      if (newTag) {
        confirm = window.confirm("You are going to lose unsaved changes!");
        if (confirm) {
          seriesIndex += 1;
          this.setState({ seriesIndex, tagValues: {} });
        } else {
          return;
        }
      } else {
        seriesIndex += 1;
        this.setState({ seriesIndex, tagValues: {} });
      }
    } else if (name === "save") {
      console.log("save tags clicked");
    } else {
      return;
    }
  };

  checkNewTag = () => {
    let result = false;
    const { tagValues, treeData, seriesIndex } = this.state;
    for (let tag in tagValues) {
      if (treeData[seriesIndex][tag] !== tagValues[tag]) {
        result = true;
        break;
      }
    }
    return result;
  };

  componentDidMount = () => {
    let { selectedSeries } = this.props;

    selectedSeries = Object.values(selectedSeries);
    if (selectedSeries.length) {
      this.getFirstImgOfSeries(selectedSeries);
    }
  };

  handleRequirements = () => {
    this.setState(state => ({ showRequirements: !state.showRequirements }));
  };

  handleTagEditorSelect = (seriesIndex, patientID, studyUID, seriesUID) => {
    this.setState(state => ({ showTagEditor: !state.showTagEditor }));
    // this.setState({ pathToSeries: { patientID, studyUID, seriesUID } });
    this.setState({ seriesIndex, tabIndex: 2 });
  };

  handleReqSelect = async e => {
    const { name, checked } = e.target;
    // const { rawData, requirements } = this.state;
    if (name === "RequireAll" && checked) {
      await this.setState({
        requirements: {
          PatientIDLO: true,
          PatientNamePN: true,
          StudyInstanceUIDUI: true,
          StudyDescriptionLO: true,
          SeriesInstanceUIDUI: true,
          SeriesDescriptionLO: true,
        },
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
    const treeData = extractTableData(
      this.state.rawData,
      this.state.requirements
    );
    this.setState({ treeData });
  };

  // getDatasetsOf first images for list of series
  getFirstImgOfSeries = seriesList => {
    const promises = [];
    let rawData = [];
    for (let i = 0; i < seriesList.length; i += 1) {
      const projectUID = seriesList[i].projectID;
      const subjectUID = seriesList[i].subjectID;
      const { studyUID, seriesUID } = seriesList[i];
      promises.push(
        getImageIds({ projectUID, subjectUID, studyUID, seriesUID })
      );
    }
    Promise.all(promises)
      .then(res => {
        const imgIDPromises = [];
        res.forEach(item => {
          imgIDPromises.push(getImageArrayBuffer(item.data[0].lossyImage));
        });
        Promise.all(imgIDPromises)
          .then(buffers => {
            rawData = buffers.map(buffer => {
              return this.getDataset(buffer.data);
            });
            console.log(" ---> rawData");
            console.log(rawData);
            this.setState({ rawData });
            const treeData = extractTableData(
              this.state.rawData,
              this.state.requirements
            );
            this.setState({ treeData });
          })
          .catch();
      })
      .catch(err => {
        console.log(err);
      });
  };

  getDataset = arrayBuffer => {
    try {
      let DicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer);
      const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
        DicomDict.dict
      );
      console.log(" ---> dataset");
      console.log(dataset);
      return dataset;
    } catch (err) {
      console.log("Error in reading dicom dataset", err);
    }
  };

  render = () => {
    const { treeData, requirements, seriesIndex, tagValues } = this.state;
    const { selectedSeries } = this.props;
    const requirementKeys = Object.keys(requirements);
    return (
      <Modal>
        <div className="uploadWizard">
          <div className="uploadWizard-header">
            <div className="uploadWizard-header__title">ePAD Tag Editor</div>
            <div className="menu-clickable" onClick={this.props.onClose}>
              <FaTimes />
            </div>
          </div>
          {/* <input
            className="uploadWizard-define"
            onClick={this.handleRequirements}
            value="Define Requirements"
            type="button"
          /> */}
          {/* Define Requirements
          </button> */}
          <Tabs
            selectedIndex={this.state.tabIndex}
            onSelect={tabIndex => this.setState({ tabIndex })}
          >
            <TabList>
              <Tab>Define Requirements</Tab>
              <Tab>Select Series</Tab>
              <Tab>Edit Tags</Tab>
            </TabList>
            <TabPanel>
              <TagRequirements
                handleInput={this.handleReqSelect}
                onClose={this.handleRequirements}
                requirements={Object.keys(this.state.requirements)}
                // requirements={requirements}
              />
            </TabPanel>
            <TabPanel>
              {!isEmpty(treeData) && (
                <TagEditTree
                  dataset={treeData}
                  onEditClick={this.handleTagEditorSelect}
                />
              )}
            </TabPanel>
            <TabPanel>
              <TagEditor
                requirements={requirementKeys}
                requirementsObj={requirements}
                treeData={treeData}
                seriesIndex={seriesIndex}
                seriesArr={Object.keys(selectedSeries)}
                buttonClick={this.handleButtonClick}
                handleTagInput={this.handleTagInput}
                tagValues={tagValues}
                // path={this.state.pathToSeries}
              />
            </TabPanel>
          </Tabs>
        </div>
      </Modal>
    );
  };
}

const mapStateToProps = state => {
  return {
    selectedSeries: state.annotationsListReducer.selectedSeries,
  };
};
export default connect(mapStateToProps)(UploadWizard);
