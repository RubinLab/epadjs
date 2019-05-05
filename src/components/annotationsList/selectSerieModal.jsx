import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import {
  openProjectSelectionModal,
  clearGrid,
  getPatient,
  getWholeData,
  getSingleSerie,
  clearSelection,
  startLoading,
  loadCompleted
} from "./action";
import SerieSelect from "./containers/serieSelection";
import SelectionItem from "./containers/selectionItem";

import { getSeries } from "../../services/seriesServices";

const message = {
  title: "Not enough ports to open series"
};
class selectSerieModal extends React.Component {
  state = {
    selectionType: "",
    selectionArr: [],
    // seriesList: [],
    selectedToDisplay: [],
    limit: 0
  };
  //get the serie list
  componentDidMount = async () => {
    console.log(this.props.seriesPassed);
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
    // this.setState({ selectionType, selectionArr, seriesList });
    // if (selectionType === "study") {
    //   for (let item of selectionArr) {
    //     let seriesOfSt;
    //     if (!this.props.patients[item.patientID]) {
    //       seriesOfSt = await this.getSerieListData(
    //         item.projectID,
    //         item.patientID,
    //         item.studyUID
    //       );
    //     } else {
    //       seriesOfSt = Object.values(
    //         this.props.patients[item.patientID].studies[item.studyUID].series
    //       );
    //     }
    //     seriesList = seriesList.concat(seriesOfSt);
    //   }
    //   this.setState({ seriesList });
    // }
  };

  getPatient = async study => {
    return this.props.dispatch(getPatient(study));
  };

  getSerieListData = async (projectID, patientID, studyUID) => {
    const {
      data: {
        ResultSet: { Result: series }
      }
    } = await getSeries(projectID, patientID, studyUID);

    return series;
  };

  selectToDisplay = async e => {
    let selectCount = 0;
    let arr = [...this.state.selectedToDisplay];
    arr[e.target.dataset.index] = e.target.checked;
    await this.setState({ selectedToDisplay: arr });
    this.state.selectedToDisplay.forEach(item => {
      if (item) {
        selectCount++;
      }
    });
    let limit = this.props.openSeries.length + selectCount;
    this.setState({ limit });
  };

  displaySelection = async () => {
    let series = Object.values(this.props.seriesPassed)[0];
    for (let i = 0; i < this.state.selectedToDisplay.length; i++) {
      if (!this.props.patients[series[i].patientID]) {
        this.props.dispatch(getWholeData(null, series[i]));
      }
      if (this.state.selectedToDisplay[i]) {
        if (this.state.selectionType === "aim") {
          this.props.dispatch(getSingleSerie(null, series[i]));
        } else {
          this.props.dispatch(getSingleSerie(series[i]));
        }
      }
    }
    this.handleCancel();
    this.props.dispatch(clearSelection());
  };

  handleCancel = () => {
    this.setState({
      selectionType: "",
      selectionArr: [],
      seriesList: [],
      selectedToDisplay: [],
      limit: 0
    });
    this.props.dispatch(openProjectSelectionModal());
    this.props.dispatch(clearSelection());
    this.props.onCancel();
  };

  renderSelection = () => {
    let selectionList = [];
    let item;
    console.log(this.props.seriesPassed);
    let series = Object.values(this.props.seriesPassed);
    let keys = Object.keys(this.props.seriesPassed);
    console.log(series);
    let count = 0;

    for (let i = 0; i < series.length; i++) {
      let innerList = [];
      let title = series[i][0].bodyPart || series[i][0].studyDescription;
      title = !title ? "Unnamed Study" : title;
      for (let k = 0; k < series[i].length; k++) {
        let disabled =
          !this.state.selectedToDisplay[count + k] && this.state.limit >= 6;
        item = (
          <SelectionItem
            desc={series[i][k].seriesDescription}
            onSelect={this.selectToDisplay}
            index={count + k}
            disabled={disabled}
            key={series[i][k].seriesUID}
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
    console.log(this.state);
    console.log(this.props);

    return (
      <Modal.Dialog dialogClassName="alert-selectSerie">
        <Modal.Header>
          <Modal.Title className="selectSerie__header">
            {message.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="selectSerie-container">
          <div>Maximum 6 series can be viewed at a time.</div>
          <button
            size="lg"
            className="selectSerie-clearButton"
            onClick={() => this.props.dispatch(clearGrid())}
          >
            Close all views
          </button>
          {this.state.limit >= 6 && <div>You reached Max number of series</div>}
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

selectSerieModal.propTypes = {
  onOK: PropTypes.func
};

const mapStateToProps = state => {
  return {
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    patients: state.annotationsListReducer.patients,
    openSeries: state.annotationsListReducer.openSeries
  };
};

export default connect(mapStateToProps)(selectSerieModal);

// if (series.length === 1) {
//   console.log("here");
//   item = (
//     <SerieSelect
//       itemArr={series[0]}
//       onSelect={this.selectToDisplay}
//       limit={this.state.limit}
//       checkList={this.state.selectedToDisplay}
//       key="0"
//       indexStart={0}
//     />
//   );
//   selectionList.push(item);
// } else {
//   for (let i = 0; i < series.length; i++) {
//     let title = series[i][0].bodyPart || series[i][0].studyDescription;
//     item = (
//       <div key={keys[i]}>
//         <div>{title}</div>
//         <SerieSelect
//           itemArr={series[i]}
//           onSelect={this.selectToDisplay}
//           limit={this.state.limit}
//           checkList={this.state.selectedToDisplay}
//           key="0"
//           indexStart={count}
//         />
//       </div>
//     );
//     selectionList.push(item);
