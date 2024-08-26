import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import ReactTooltip from "react-tooltip";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {
  clearGrid,
  getWholeData,
  getSingleSerie,
  clearSelection,
  addToGrid,
  setSeriesData,
} from "./action";
import SelectionItem from "./containers/selectionItem";
import { FaRegCheckSquare } from "react-icons/fa";
import { getSeries, setSignificantSeries } from "../../services/seriesServices";
import { getTemplate } from "../../services/templateServices";
import { uploadAim } from "services/annotationServices";
import "./annotationsList.css";
import { extendWith } from "lodash";
import { TiEject } from "react-icons/ti";
import * as questionaire from "../aimEditor/parseClass";
import { getUserForAim } from "../aimEditor/Helpers";
import { decryptAndAdd } from "services/decryptUrlService";
import { getSingleStudy, deleteStudy } from "../../services/studyServices";
import { Aim, enumAimType } from "aimapi";
import { teachingFileTempUid, teachingFileTempCode } from "../../constants";
import { isSupportedModality } from "../../Utils/aid";
import { DISP_MODALITIES } from "../../constants";

class selectSerieModal extends React.Component {
  // _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      selectionType: "",
      selectionArr: [],
      // seriesList: [],
      selectedToDisplay: {},
      limit: 0,
      list: [],
      isButtonDisabled: false,
    };
    this.maxPort = parseInt(sessionStorage.getItem("maxPort"));
    this.mode = sessionStorage.getItem("mode");
    this.wadoUrl = sessionStorage.getItem("wadoUrl");
  }

  //get the serie list
  componentDidMount = async () => {
    let selectionType = "";
    let { selectedStudies, selectedSeries, selectedAnnotations } = this.props;
    selectedStudies = Object.values(selectedStudies);
    selectedSeries = Object.values(selectedSeries);
    selectedAnnotations = Object.values(selectedAnnotations);
    if (selectedStudies.length > 0) {
      selectionType = "study";
    } else if (selectedSeries.length > 0) {
      selectionType = "series";
    } else {
      selectionType = "aim";
    }
    this.setState({ selectionType });
    this.setPreSelecteds();
    const limit = this.updateLimit();
    this.setState({ limit });

    // teaching file save related
    const { isTeachingFile } = this.props;
    if (isTeachingFile) {
      const element = document.getElementById("questionaire");
      const speciality = document.getElementById("speciality");
      const anatomy = document.getElementById("anatomy");
      const diagnosis = document.getElementById("diagnosis");

      this.semanticAnswers = new questionaire.AimEditor(
        element,
        // this.validateForm,
        this.renderButtons,
        "",
        {},
        null,
        true, // is teachinng flag
        { speciality, anatomy, diagnosis }, // the new div which holds only teaching components for aim editor
        "#ccc"
      );
      const { data: templates } = await getTemplate(teachingFileTempUid);
      this.semanticAnswers.loadTemplates({
        default: teachingFileTempCode,
        all: [templates],
      });
      this.semanticAnswers.createViewerWindow();
      this.props.completeLoading();
    } // end teaching file related part
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  // These two empty functions are necessary for aim editor
  renderButtons = () => {};
  validateForm = () => {};

  getSerieListData = async (projectID, patientID, studyUID) => {
    const { seriesData } = this.props;
    try {
      const dataExists =
        seriesData[projectID] &&
        seriesData[projectID][patientID] &&
        seriesData[projectID][patientID][studyUID] &&
        seriesData[projectID][patientID][studyUID].list;
      if (!dataExists) {
        const { data: series } = await getSeries(
          projectID,
          patientID,
          studyUID
        );
        this.props.dispatch(
          setSeriesData(projectID, patientID, studyUID, series, true)
        );
        return series;
      } else return seriesData[projectID][patientID][studyUID].list;
    } catch (err) {
      console.error(err);
    }
  };

  componentDidUpdate = (prevProps) => {
    const { openSeries, seriesPassed } = this.props;
    if (openSeries.length !== prevProps.openSeries.length) {
      let limit = this.updateLimit();
      this.setState({ limit });
    }
    if (seriesPassed.length !== prevProps.seriesPassed.length) {
      this.setPreSelecteds();
    }
  };

  updateLimit = () => {
    let selectCount = 0;
    const { openSeries } = this.props;
    const { selectedToDisplay } = this.state;
    selectCount = Object.keys(selectedToDisplay).length;
    return openSeries.length + selectCount;
  };

  selectToDisplay = (serieUID) => {
    let newSelections = { ...this.state.selectedToDisplay };
    if (newSelections[serieUID]) delete newSelections[serieUID];
    else newSelections[serieUID] = true;
    this.setState({ selectedToDisplay: { ...newSelections } }, () => {
      let limit = this.updateLimit();
      this.setState({ limit });
    });
  };

  findSerieFromSeries = (serieUID, seriesArray) => {
    for (let i = 0; i < seriesArray.length; i++) {
      if (serieUID === seriesArray[i].seriesUID) return seriesArray[i];
    }
  };

  saveSignificantSeries = async (series) => {
    const { selectedToDisplay } = this.state;
    let significantSeries = [];
    let significanceOrder = 1;
    let significanceSet = series.some((serie) => serie.significanceOrder > 0);
    const seriesInDetail = [];
    for (let key of Object.keys(selectedToDisplay)) {
      const ser = series.filter(el => el.seriesUID === key);
      const seriesDescription = ser.length > 0 ? ser[0].seriesDescription : null;
      if (!significanceSet) {
        significantSeries.push({
          seriesUID: key,
          significanceOrder,
          seriesDescription
        });
        significanceOrder++;
      } else {
        seriesInDetail.push(ser[0]);
      }
    }
    const { projectID, patientID, studyUID, subjectID } = series[0];
    const subID = patientID ? patientID : subjectID;

    if (!significanceSet && this.mode === "teaching") {
       const { data: res } = await setSignificantSeries(projectID, subID, studyUID, significantSeries);
       return res;
    } 
    return seriesInDetail;
  };

  getExistingSeriesData = (serie) => {
    const { projectID, patientID, studyUID } = serie;
    const {seriesData} = this.props;
    const dataExists =
        seriesData[projectID] &&
        seriesData[projectID][patientID] &&
        seriesData[projectID][patientID][studyUID] &&
        seriesData[projectID][patientID][studyUID].list;

    const existingData = dataExists
      ? seriesData[projectID][patientID][studyUID].list
      : null;
    return existingData;
  }

  displaySelection = async (aimID) => {
    let studies = Object.values(this.props.seriesPassed);
    let series = [];
    // TODO: what is the logic here?
    studies.forEach((arr) => {
      series = series.concat(arr);
    });
    const seriesArr = await this.saveSignificantSeries(series);
    //concatanete all arrays to getther
    // for (let key of Object.keys(selectedToDisplay)) {
    for (let el of seriesArr) {  
      let serie = this.findSerieFromSeries(el.seriesUID, series);
      const existingData = this.getExistingSeriesData(serie);
      if (aimID) this.props.dispatch(addToGrid(serie, aimID));
      else this.props.dispatch(addToGrid(serie, serie.aimID));
      if (this.state.selectionType === "aim") {
        this.props.dispatch(getSingleSerie(serie, serie.aimID, this.wadoUrl, existingData));
      } else {
        if (aimID)
          this.props.dispatch(getSingleSerie(serie, aimID, this.wadoUrl, existingData));
        else this.props.dispatch(getSingleSerie(serie, null, this.wadoUrl, existingData));
      }
    }
    this.props.history.push("/display");
    this.handleCancel(true);
  };

  groupUnderPatient = (objArr) => {
    let groupedObj = {};
    for (let item of objArr) {
      groupedObj[item.patientID] = item;
    }
    return groupedObj;
  };

  handleCancel = async (resetState) => {
    this.setState({
      selectionType: "",
      selectionArr: [],
      seriesList: [],
      selectedToDisplay: [],
      limit: 0,
      isButtonDisabled: false,
    });
    // this.props.dispatch(clearSelection());
    this.props.onCancel();
    try {
      if (this.mode === "teaching" && this.props.decrArgs && !resetState) {
        const { projectID, patientID, studyUID } = this.props.decrArgs;
        await deleteStudy({ projectID, patientID, studyUID }, "?all=true");
        this.setState({ isButtonDisabled: false });
        if (this.props.forceUpdatePage) this.props.forceUpdatePage();
      }
    } catch (err) {
      console.error(err);
    }
  };

  setPreSelecteds = () => {
    const { seriesPassed, openSeries } = this.props;
    let selectedToDisplay = {};
    let selectedCount = 0;
    let series = Object.values(seriesPassed);
    let count = 0;
    for (let i = 0; i < series.length; i++) {
      for (let k = 0; k < series[i].length; k++) {
        if (openSeries.length + selectedCount >= this.maxPort) {
          this.setState({ selectedToDisplay }, () => {
            this.setState({ limit: this.updateLimit() });
          });
          return;
        }
        // if (!this.isSerieOpen(series[i][k].seriesUID)) {
        //   selectedToDisplay[series[i][k].seriesUID] = series[i][k].significanceOrder
        //     ? true
        //     : false;
        //   selectedCount++;
        // }
        if (
          series[i][k].significanceOrder &&
          !this.isSerieOpen(series[i][k].seriesUID)
        ) {
          selectedToDisplay[series[i][k].seriesUID] = true;
          selectedCount++;
        }
      }
      count += series[i].length;
    }
    this.setState({ selectedToDisplay }, () => {
      this.setState({ limit: this.updateLimit() });
    });
  };

  isSerieOpen = (serieUID) => {
    const { openSeries, studyName } = this.props;
    let openSeriesUIDList = [];
    openSeries.forEach((port) => {
      openSeriesUIDList.push(port.seriesUID);
    });
    return openSeriesUIDList.includes(serieUID);
  };

  getTitle = (serie) => {
    const { studyName, selectedStudies } = this.props;
    let title = studyName
      ? studyName
      : serie.bodyPart || serie.studyDescription;
    if (!title) {
      if (selectedStudies[serie.studyUID]) {
        title = selectedStudies[serie.studyUID].studyDescription;
      }
    }
    title = !title ? "Unnamed Study" : title;
    return title;
  };

  renderSelection = () => {
    const { seriesPassed } = this.props;
    const { selectedToDisplay, limit } = this.state;
    let selectionList = [];
    let item;

    let series = Array.isArray(seriesPassed)
      ? seriesPassed
      : Object.values(seriesPassed);
    let keys = Object.keys(seriesPassed);
    let count = 0;
    let significantExplanation = false; //Explanations at the bottom of the modal

    // filter the series according to displayable modalities
    for (let i = 0; i < series.length; i++) {
      series[i] = series[i].filter(isSupportedModality);
    }

    for (let i = 0; i < series.length; i++) {
      let innerList = [];

      for (let k = 0; k < series[i].length; k++) {
        const { seriesUID } = series[i][k];
        let isSignificant = false;
        let alreadyOpen = this.isSerieOpen(seriesUID);
        let disabled = !selectedToDisplay[seriesUID] && limit >= this.maxPort;
        let seriesNo = series[i][k].seriesNo || "";
        let desc = series[i][k].seriesDescription;
        let description = desc ? desc : !desc && series[i][k].significanceOrder ? `Sig Series ${series[i][k].significanceOrder}` :  "Unnamed Series";
        desc = `${seriesNo} - ${description}`;
        if (series[i][k].significanceOrder) {
          desc = desc + " (S)";
          isSignificant = true;
          significantExplanation = true;
        }
        item = alreadyOpen ? (
          <div>
            <div key={k + "_" + seriesUID} className="alreadyOpen-disabled">
              <FaRegCheckSquare
                data-tip
                data-for={"alreadyOpenSeries"}
                style={{ marginRight: "0.4rem" }}
              />
              <div className="selectionItem-text">{desc}</div>
            </div>
            <ReactTooltip
              id="alreadyOpenSeries"
              place="right"
              type="info"
              delayShow={100}
              clickable={false}
            >
              <span>{"Already Open"}</span>
            </ReactTooltip>
          </div>
        ) : (
          <SelectionItem
            desc={desc}
            onChange={() => this.selectToDisplay(seriesUID)}
            index={count + k}
            disabled={disabled}
            key={k + "_" + seriesUID}
            isChecked={selectedToDisplay[seriesUID] || false}
            isSignificant={isSignificant}
          />
        );
        innerList.push(item);
      }
      selectionList.push(
        <div key={keys[i]}>
          {this.mode !== "teaching" && (
            <div className="serieSelection-title">
              {this.getTitle(series[i][0])}
            </div>
          )}
          {this.mode === "teaching" && <p></p>}
          <div>{innerList}</div>
        </div>
      );
      count += series[i].length;
    }
    if (significantExplanation)
      selectionList.push(
        <div key={"explanation"} className={"significant-series"}>
          <br />
          (S): Significant series
        </div>
      );
    return selectionList;
  };

  saveTeachingFile = async () => {
    this.setState({ isButtonDisabled: true });
    const selectedSeries = Object.keys(this.state.selectedToDisplay);
    if (this.semanticAnswers.checkFormSaveReady({ isTeachingModal: true })) {
      const result = window.confirm("Please fill all required fields!");

      if (result || !result) this.setState({ isButtonDisabled: false });

      return -1;
    }
    if (selectedSeries.length === 0) {
      const result = window.confirm("Please select at least one series!");

      if (result || !result) this.setState({ isButtonDisabled: false });

      return -1;
    }
    const { encrUrlArgs, decrArgs } = this.props;
    const { projectID, patientID, studyUID } = decrArgs;
    let updatedAimId, trackingUId; //should be undefined for creating new aim
    if (!encrUrlArgs) {
      console.error(
        "Error saving teaching file. No encrypted argument present"
      );
      return;
    }

    await decryptAndAdd(encrUrlArgs);
    const answers = this.semanticAnswers.saveAim();
    answers.name.value = "Teaching File";
    const { data: study } = await getSingleStudy(studyUID);
    let examTypes;
    ({ examTypes } = study);
    if (examTypes?.length === 1 && examTypes[0].includes("\\")) {
      examTypes = examTypes[0].split("\\");
    }
    study.examTypes = examTypes.filter((type) =>
      DISP_MODALITIES.includes(type)
    );
    study.birthdate = study.birthdate.split("-").join("");
    study.insertDate = study.insertDate.split("-").join("");
    study.studyDate = study.studyDate.split("-").join("");
    const aimData = { study, answers, user: getUserForAim() };
    const aim = new Aim(
      aimData,
      enumAimType.studyAnnotation,
      updatedAimId,
      trackingUId
    );
    const { root: result } = aim.uniqueIdentifier;
    const aimJson = aim.getAim();
    let aimSaved = JSON.parse(aimJson);
    const isUpdate = false;

    return uploadAim(aimSaved, projectID, isUpdate)
      .then(async () => {
        toast.success("Teaching File succesfully saved.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        let studies = Object.values(this.props.seriesPassed);
        let series = [];
        studies.forEach((arr) => {
          series = series.concat(arr);
        });
        await this.saveSignificantSeries(series);
        window.dispatchEvent(new Event("refreshProjects"));
        // to prevent concatanating the annotation list pass afterDelete parameter true
        this.props.onSave(this.props.searchTableIndex, true);
        this.setState({ isButtonDisabled: false });
        return result;
      })
      .catch((error) => {
        deleteStudy({ projectID, patientID, studyUID }, "?all=true")
          .then(() => {
            if (this.props.forceUpdatePage) this.props.forceUpdatePage();
          })
          .catch((err) => console.error(err));
        alert(
          "Teaching file couldn't be saved! More information about the error can be found in the logs."
        );
        console.error(error);
        this.setState({ isButtonDisabled: false });
      });
  };

  saveTeachingFileAndDisplay = async () => {
    let result = await this.saveTeachingFile();
    if (result === -1) return;

    this.displaySelection(result);
  };

  closeAllSeries = () => {
    this.props.dispatch(clearGrid());
    sessionStorage.removeItem("wwwc");
    const imgStatus = new Array(this.maxPort);
    sessionStorage.setItem("imgStatus", JSON.stringify(imgStatus));
    sessionStorage.removeItem("invertMap");
  }

  render = () => {
    const { openSeries, isTeachingFile } = this.props;
    const title = isTeachingFile
      ? "Create STELLA Teaching File"
      : "Series Selection Window";
    const selections = Object.keys(this.state.selectedToDisplay);
    const list = this.renderSelection();
    return (
      <Modal.Dialog id="series-modal" className="series-modal">
        <Modal.Header className="select-serie-header">
          <Modal.Title className="select-serie-title">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="select-serie-body">
          {isTeachingFile && (
            <>
              <div id="stella-beta-warning">
                Warning! Beta Software, Not For Routine Use During Preclinical
                Testing
              </div>
              <div id="questionaire" className={"field-grid"}>
                <row>
                  <div id="anatomy"></div>
                  <div id="diagnosis"></div>
                </row>
                <row>
                  <div id="speciality"></div>
                  <div id="comment">
                    {/* <i class="dropdown icon"></i>
                  <div className="title active" style={{ color: "rgb(204, 204, 204)", fontSize: "13px" }}>Narrative</div>
                  <div>
                  <input className="comment ui input"></input>
                </div> */}
                  </div>
                </row>
              </div>
            </>
          )}
          <br />
          <div className={"max-series"}>
            Please select up to {this.maxPort} series to display:
          </div>
          {openSeries.length > 0 && (
            <div>
              <span style={{padding: '6px'}}>{`${openSeries.length} viewport${openSeries.length > 1 ? 's' : ''} in use - close some or all to open new series.`}</span>
              <br />
              <button
              style={{marginLeft: '4px'}}
                size="lg"
                className="selectSerie-clearButton"
                onClick={this.closeAllSeries}
              >
                X - Close all series
              </button>
            </div>
          )}
          {/* <button
            size="lg"
            className="selectSerie-clearButton"
            onClick={() => this.props.dispatch(clearGrid())}
          >
            X  - Close all series
          </button> */}
          {this.state.limit > this.maxPort && !openSeries.length && (
            <div>Please select only {this.maxPort} series to open!</div>
          )}
          <div
            style={{
              paddingLeft: "0.5em",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            {list}
          </div>
        </Modal.Body>
        <Modal.Footer className="select-serie-footer">
          {isTeachingFile && (
            <div>
              <Button
                className={"modal-button"}
                variant="secondary"
                size="sm"
                onClick={async () => {
                  if ((await this.saveTeachingFile()) !== -1) {
                    this.handleCancel(true);
                    this.props.onSave();
                  }
                }}
                disabled={this.state.isButtonDisabled}
              >
                Save Teaching File
              </Button>
              <Button
                className={"modal-button"}
                variant="secondary"
                size="sm"
                onClick={() => this.saveTeachingFileAndDisplay()}
                disabled={this.state.isButtonDisabled}
              >
                Save Teaching File & Display
              </Button>
              <Button
                className={"modal-button"}
                variant="secondary"
                size="sm"
                onClick={this.handleCancel}
              >
                No New TF - Just Open Stella
              </Button>
            </div>
          )}
          {!isTeachingFile && (
            <div>
              <Button
                className={"modal-button"}
                variant="secondary"
                size="sm"
                onClick={() => this.displaySelection()}
                disabled={!selections.length}
              >
                Display selection
              </Button>
              <Button
                className={"modal-button"}
                variant="secondary"
                size="sm"
                onClick={this.handleCancel}
              >
                Cancel
              </Button>
            </div>
          )}
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    patients: state.annotationsListReducer.patients,
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    seriesData: state.annotationsListReducer.seriesData,
    searchTableIndex: state.annotationsListReducer.searchTableIndex,
  };
};

export default withRouter(connect(mapStateToProps)(selectSerieModal));
