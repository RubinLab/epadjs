import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { Modal } from "react-bootstrap";
import {
  clearGrid,
  getWholeData,
  getSingleSerie,
  clearSelection,
  addToGrid
} from "./action";
import SelectionItem from "./containers/selectionItem";
import { FaRegCheckSquare } from "react-icons/fa";
import { getSeries, setSignificantSeries } from "../../services/seriesServices";
import "./annotationsList.css";
import { isSupportedModality } from "../../Utils/aid.js";
import { extendWith } from "lodash";

const message = {
  title: "Not enough ports to open series"
};

class selectSerieModal extends React.Component {
  // _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      selectionType: "",
      selectionArr: [],
      // seriesList: [],
      selectedToDisplay: [],
      limit: 0,
      list: []
    };
    this.maxPort = parseInt(sessionStorage.getItem("maxPort"));
  }

  //get the serie list
  componentDidMount = async () => {
    // this._isMounted = true;
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
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  // getPatient = async study => {
  //   return this.props.dispatch(getPatient(study));
  // };

  getSerieListData = async (projectID, patientID, studyUID) => {
    const { data: series } = await getSeries(projectID, patientID, studyUID);

    return series;
  };

  componentDidUpdate = prevProps => {
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
    this.state.selectedToDisplay.forEach(item => {
      if (item) {
        selectCount++;
      }
    });
    return this.props.openSeries.length + selectCount;
  };

  selectToDisplay = async e => {
    let arr = [...this.state.selectedToDisplay];
    arr[e.target.dataset.index] = e.target.checked;
    await this.setState({ selectedToDisplay: arr });
    let limit = this.updateLimit();
    this.setState({ limit });
  };

  displaySelection = async () => {
    let studies = Object.values(this.props.seriesPassed);
    let series = [];
    let significantSeries = [];
    let significanceOrder = 1;
    studies.forEach(arr => {
      series = series.concat(arr);
    });
    let significanceSet = series.some(serie => serie.significanceOrder > 0);

    // let series = Object.values(this.props.seriesPassed)[0];
    //concatanete all arrays to getther
    for (let i = 0; i < this.state.selectedToDisplay.length; i++) {
      if (this.state.selectedToDisplay[i]) {
        if (!significanceSet) {
          significantSeries.push({
            seriesUID: series[i].seriesUID,
            significanceOrder
          });
          significanceOrder++;
        }
        this.props.dispatch(addToGrid(series[i], series[i].aimID));
        if (this.state.selectionType === "aim") {
          this.props.dispatch(getSingleSerie(series[i], series[i].aimID));
        } else {
          this.props.dispatch(getSingleSerie(series[i]));
        }
        // if (!this.props.patients[series[i]]) {
        //   this.props.dispatch(getWholeData(series[i]));
        // }
      }
    }
    const { projectID, patientID, studyUID, subjectID } = series[0];
    const subID = patientID ? patientID : subjectID;

    if (!significanceSet) {
      setSignificantSeries(projectID, subID, studyUID, significantSeries);
    }
    this.props.history.push("/display");
    this.handleCancel();
  };

  groupUnderPatient = objArr => {
    let groupedObj = {};
    for (let item of objArr) {
      groupedObj[item.patientID] = item;
    }
    return groupedObj;
  };

  handleCancel = () => {
    this.setState({
      selectionType: "",
      selectionArr: [],
      seriesList: [],
      selectedToDisplay: [],
      limit: 0
    });
    // this.props.dispatch(clearSelection());
    this.props.onCancel();
  };

  setPreSelecteds = () => {
    const { seriesPassed, openSeries } = this.props;
    let selectedToDisplay = [];
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
        if (!this.isSerieOpen(series[i][k].seriesUID)) {
          selectedToDisplay[count + k] = series[i][k].significanceOrder
            ? true
            : false;
          selectedCount++;
        }
      }
      count += series[i].length;
    }
    this.setState({ selectedToDisplay }, () => {
      this.setState({ limit: this.updateLimit() });
    });
  };

  isSerieOpen = serieUID => {
    const { openSeries } = this.props;
    let openSeriesUIDList = [];
    openSeries.forEach(port => {
      openSeriesUIDList.push(port.seriesUID);
    });
    return openSeriesUIDList.includes(serieUID);
  };

  renderSelection = () => {
    let selectionList = [];
    let item;
    const { seriesPassed } = this.props;
    let series = Array.isArray(seriesPassed)
      ? seriesPassed
      : Object.values(seriesPassed);
    let keys = Object.keys(this.props.seriesPassed);
    let count = 0;

    // filter the series according to displayable modalities
    for (let i = 0; i < series.length; i++) {
      series[i] = series[i].filter(isSupportedModality);
    }
    for (let i = 0; i < series.length; i++) {
      let innerList = [];
      let title = this.props.studyName
        ? this.props.studyName
        : series[i][0].bodyPart || series[i][0].studyDescription;
      if (!title) {
        if (this.props.selectedStudies[series[i][0].studyUID]) {
          title = this.props.selectedStudies[series[i][0].studyUID]
            .studyDescription;
        }
      }
      title = !title ? "Unnamed Study" : title;
      for (let k = 0; k < series[i].length; k++) {
        let alreadyOpen = this.isSerieOpen(series[i][k].seriesUID);
        let disabled =
          !this.state.selectedToDisplay[count + k] &&
          this.state.limit >= this.maxPort;
        let desc = series[i][k].seriesDescription || "Unnamed Serie";
        // desc = alreadyOpen ? `${desc} - already open` : desc;
        item = alreadyOpen ? (
          <div>
            <div
              key={k + "_" + series[i][k].seriesUID}
              className="alreadyOpen-disabled"
            >
              <FaRegCheckSquare data-tip data-for={"alreadyOpenSeries"} />
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
            onChange={this.selectToDisplay}
            index={count + k}
            disabled={disabled}
            key={k + "_" + series[i][k].seriesUID}
            isChecked={this.state.selectedToDisplay[count + k]}
          />
        );
        innerList.push(item);
      }
      selectionList.push(
        <div key={keys[i]}>
          <div className="serieSelection-title">{title}</div>
          <div>{innerList}</div>
        </div>
      );
      count += series[i].length;
    }
    return selectionList;
  };

  render = () => {
    const list = this.renderSelection();
    return (
      // <Modal.Dialog dialogClassName="alert-selectSerie">
      <Modal.Dialog id="modal-fix">
        <Modal.Header>
          <Modal.Title className="selectSerie__header">
            {message.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="selectSerie-container"
          style={{ textAlign: "start" }}
        >
          <div>Maximum {this.maxPort} series can be viewed at a time.</div>
          <button
            size="lg"
            className="selectSerie-clearButton"
            onClick={() => this.props.dispatch(clearGrid())}
          >
            Close all series
          </button>
          {this.state.limit >= this.maxPort && (
            <div>You reached Max number of series</div>
          )}
          <div>{list}</div>
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <button onClick={this.displaySelection}>Display selection</button>
          <button onClick={this.handleCancel}>Cancel</button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

const mapStateToProps = state => {
  return {
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    patients: state.annotationsListReducer.patients,
    openSeries: state.annotationsListReducer.openSeries
  };
};

export default withRouter(connect(mapStateToProps)(selectSerieModal));
