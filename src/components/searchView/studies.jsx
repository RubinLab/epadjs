import React, { Component } from "react";
import { connect } from "react-redux";
import ReactTable from "react-table";
import { withRouter } from "react-router-dom";
import { FaBatteryEmpty, FaBatteryFull, FaBatteryHalf } from "react-icons/fa";
import selectTableHOC from "react-table/lib/hoc/selectTable";
import treeTableHOC from "react-table/lib/hoc/treeTable";
import { toast } from "react-toastify";
import { getStudies } from "../../services/studyServices";
import { getSeries } from "../../services/seriesServices";
import ProjectModal from "../annotationsList/selectSerieModal";
import { MAX_PORT, widthUnit, formatDates } from "../../constants";
import Series from "./series";
import ReactTooltip from "react-tooltip";
import {
  getSingleSerie,
  selectStudy,
  clearSelection,
  startLoading,
  loadCompleted,
  annotationsLoadingError,
  addToGrid,
  getWholeData,
  alertViewPortFull,
  updatePatient
  // showAnnotationDock
} from "../annotationsList/action";
import { persistExpandView } from "../../Utils/aid";

//import "react-table/react-table.css";

function getNodes(data, node = []) {
  data.forEach(item => {
    if (item.hasOwnProperty("_subRows") && item._subRows) {
      node = getNodes(item._subRows, node);
    } else {
      node.push(item._original);
    }
  });
  return node;
}

const progressDisplay = status => {
  if (status === "STUDY_STATUS_COMPLETED") {
    return <FaBatteryFull className="progress-done" />;
  } else if (status === "STUDY_STATUS_NOT_STARTED") {
    return <FaBatteryEmpty className="progress-notStarted" />;
  } else if (status === "STUDY_STATUS_IN_PROGRESS") {
    return <FaBatteryHalf className="progress-inProgress" />;
  } else {
    return <div>{status}</div>;
  }
};
// const SelectTreeTable = selectTableHOC(treeTableHOC(ReactTable));

const TreeTable = treeTableHOC(ReactTable);

class Studies extends Component {
  constructor(props) {
    super(props);
    this.widthUnit = 20;
    this.state = {
      columns: [],
      selection: [],
      selectAll: false,
      selectType: "checkbox",
      expanded: {},
      selectedStudy: {},
      isSerieSelectionOpen: false,
      childExpanded: {},
      expansionArr: []
    };
  }

  async componentDidMount() {
    try {
      const {
        projectId,
        subjectId,
        expansionArr,
        expandLevel,
        treeExpand,
        patientIndex,
        expandLoading,
        patientExpandComplete,
        treeData
      } = this.props;
      let data = Object.values(treeData[subjectId].studies);
      if (data.length > 0) {
        data = data.map(el => el.data);
      } else {
        let studies = await getStudies(projectId, subjectId);
        data = studies.data;
        this.props.getTreeData("studies", data);
      }
      this.setState({ data });
      this.setState({ columns: this.setColumns() });
      const studyOpened = expansionArr.includes(subjectId);
      // const alreadyCounted = expandLoading.numOfPresentStudies > 0;
      if (!studyOpened && expandLevel === 1 && !patientExpandComplete) {
        this.props.updateExpandedLevelNums("subject", data.length, 1);
      }
      if (expandLevel > 1) {
        this.expandCurrentLevel();
        const obj = {
          patient: this.props.patientIndex,
          study: data.length
        };
        this.props.getTreeExpandAll(obj, true, expandLevel);
      }
      if (data.length === 0) {
        toast.info("No study found", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
      const expanded = {};
      if (treeExpand[patientIndex]) {
        const ptExpandKeys = Object.keys(treeExpand[patientIndex]);
        const ptExpandVal = Object.values(treeExpand[patientIndex]);
        ptExpandKeys.forEach((el, index) => {
          expanded[el] = ptExpandVal[index];
        });
        this.setState({ expanded });
      }
    } catch (err) {
      console.log("Couldn't load all study data. Please Try again!");
    }
  }

  async componentDidUpdate(prevProps) {
    try {
      if (this.props.update !== prevProps.update) {
        const { data: data } = await getStudies(
          this.props.projectId,
          this.props.subjectId
        );
        const expanded = persistExpandView(
          this.state.expanded,
          this.state.data,
          data,
          "studyUID"
        );
        await this.setState({ data, expanded });
      }
      const { expansionArr, expandLevel, subjectId } = this.props;
      const studyOpened = expansionArr.includes(subjectId);
      if (expandLevel != prevProps.expandLevel) {
        expandLevel >= 2
          ? this.expandCurrentLevel()
          : this.setState({ expanded: {} });

        const expandedToStudies =
          prevProps.expandLevel < expandLevel && expandLevel === 1;
        if (expandedToStudies && studyOpened) {
          this.props.updateExpandedLevelNums(
            "subject",
            this.state.data.length,
            1
          );
        }
        const shrinkedToStudy =
          prevProps.expandLevel > expandLevel && expandLevel === 1;
        const expandToSeries =
          prevProps.expandLevel < expandLevel && expandLevel === 2;
        const obj = {
          patient: this.props.patientIndex,
          study: this.state.data.length
        };
        if (shrinkedToStudy) {
          this.setState({ expansionArr: [] });
          this.props.getTreeExpandAll(obj, false, expandLevel);
        }
        if (expandToSeries) {
          this.props.getTreeExpandAll(obj, true, expandLevel);
        }
      }
    } catch (err) {
      console.log("Couldn't load all study data. Please Try again!");
    }
  }

  expandCurrentLevel = async () => {
    try {
      const expansionArr = [];
      // console.log("expand current level called");
      const expanded = {};
      for (let i = 0; i < this.state.data.length; i++) {
        expanded[i] = this.state.data[i].numberOfSeries ? true : false;
      }
      this.setState({ expanded });
    } catch (err) {
      console.log("Couldn't load all study data. Please Try again!");
    }
  };

  selectRow = selected => {
    // const { studyUID, numberOfSeries, patientID, projectID } = selected;
    // const studyObj = { studyUID, numberOfSeries, patientID, projectID };
    // const newState = { ...this.state.selectedStudy };
    // newState[studyUID]
    //   ? delete newState[studyUID]
    //   : (newState[studyUID] = studyObj);
    // this.setState({ selectedStudy: newState });
    this.props.dispatch(clearSelection("study"));
    this.props.dispatch(selectStudy(selected));
  };

  cleanCarets(string) {
    var i = 0,
      length = string.length;
    for (i; i < length; i++) {
      string = string.replace("^", " ");
    }
    return string;
  }

  setColumns() {
    const columns = [
      {
        id: "searchView-checkbox",
        accessor: "",
        width: this.widthUnit,
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.props.selectedStudies[original.studyUID] || false}
              onChange={() => this.selectRow(original)}
            />
          );
        }
      },
      {
        width: this.widthUnit * 12,
        Cell: row => {
          let desc = this.cleanCarets(row.original.studyDescription);
          desc = desc || "Unnamed Study";
          const id = "desc" + row.original.studyUID;
          return (
            <>
              <div data-tip data-for={id} style={{ whiteSpace: "pre-wrap" }}>
                {desc}
              </div>
              <ReactTooltip
                id={id}
                place="right"
                type="info"
                delayShow={500}
                clickable={true}
              >
                <span>{desc}</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        width: this.widthUnit * 2,
        Cell: row => (
          <div className="searchView-table__cell">
            <span className="badge badge-secondary">
              {row.original.numberOfAnnotations === 0 ? (
                ""
              ) : (
                <span className="badge badge-secondary">
                  {row.original.numberOfAnnotations}
                </span>
              )}
            </span>
          </div>
        )
      },
      {
        width: this.widthUnit * 3,
        Cell: row => (
          <div className="searchView-table__cell">
            {row.original.numberOfSeries === "" ? (
              ""
            ) : (
              <span className="badge badge-secondary">
                {row.original.numberOfSeries}{" "}
              </span>
            )}
          </div>
        )
      },
      {
        width: this.widthUnit * 3,
        Cell: row => (
          <div className="searchView-table__cell">
            {row.original.numberOfImages === "" ? (
              ""
            ) : (
              <span className="badge badge-secondary">
                {row.original.numberOfImages}
              </span>
            )}
          </div>
        )
      },
      {
        //Header: "Type",
        width: this.widthUnit * 5,
        Cell: row => (
          <div className="searchView-table__cell">
            {row.original.examTypes.join("/")}
          </div>
        )
      },
      {
        //Header: "Study/Created Date",
        width: this.widthUnit * 7,
        Cell: row => (
          <div className="searchView-table__cell">
            {formatDates(row.original.insertDate)}
          </div>
        )
      },
      {
        //Header: "Uploaded",
        width: this.widthUnit * 7,
        Cell: row => (
          <div className="searchView-table__cell">
            {formatDates(row.original.createdTime)}
          </div>
        )
      },
      {
        //Header: "Accession",
        width: this.widthUnit * 6,
        Cell: row => (
          <>
            <div
              className="searchView-table__cell"
              data-tip
              data-for={row.original.studyAccessionNumber}
            >
              {row.original.studyAccessionNumber}
            </div>
            <ReactTooltip
              id={row.original.studyAccessionNumber}
              place="right"
              type="info"
              delayShow={500}
              clickable={true}
            >
              <span>{row.original.studyAccessionNumber}</span>
            </ReactTooltip>
          </>
        )
      },
      {
        //Header: "Identifier",
        width: this.widthUnit * 10,
        Cell: row => (
          <>
            <div data-tip data-for={row.original.studyUID}>
              {row.original.studyUID}
            </div>{" "}
            <ReactTooltip
              id={row.original.studyUID}
              place="right"
              type="info"
              delayShow={500}
              clickable={true}
            >
              <span>{row.original.studyUID}</span>
            </ReactTooltip>
          </>
        )
      }
    ];
    return columns;
  }

  toggleSelection = (key, shift, row) => {
    /*
      Implementation of how to manage the selection state is up to the developer.
      This implementation uses an array stored in the component state.
      Other implementations could use object keys, a Javascript Set, or Redux... etc.
    */
    // start off with the existing state
    if (this.state.selectType === "radio") {
      let selection = [];
      if (selection.indexOf(key) < 0) selection.push(key);
      this.setState({ selection });
    } else {
      let selection = [...this.state.selection];
      const keyIndex = selection.indexOf(key);
      // check to see if the key exists
      if (keyIndex >= 0) {
        // it does exist so we will remove it using destructing
        selection = [
          ...selection.slice(0, keyIndex),
          ...selection.slice(keyIndex + 1)
        ];
      } else {
        // it does not exist so add it
        selection.push(key);
      }
      // update the state
      this.setState({ selection });
    }
  };
  toggleAll = () => {
    /*
      'toggleAll' is a tricky concept with any filterable table
      do you just select ALL the records that are in your data?
      OR
      do you only select ALL the records that are in the current filtered data?

      The latter makes more sense because 'selection' is a visual thing for the user.
      This is especially true if you are going to implement a set of external functions
      that act on the selected information (you would not want to DELETE the wrong thing!).

      So, to that end, access to the internals of ReactTable are required to get what is
      currently visible in the table (either on the current page or any other page).

      The HOC provides a method call 'getWrappedInstance' to get a ref to the wrapped
      ReactTable and then get the internal state and the 'sortedData'.
      That can then be iterrated to get all the currently visible records and set
      the selection state.
    */
    const selectAll = this.state.selectAll ? false : true;
    const selection = [];
    if (selectAll) {
      // we need to get at the internals of ReactTable
      const wrappedInstance = this.selectTable.getWrappedInstance();
      // the 'sortedData' property contains the currently accessible records based on the filter and sort
      const currentRecords = wrappedInstance.getResolvedState().sortedData;
      // we need to get all the 'real' (original) records out to get at their IDs
      const nodes = getNodes(currentRecords);
      // we just push all the IDs onto the selection array
      nodes.forEach(item => {
        selection.push(item._id);
      });
    }
    this.setState({ selectAll, selection });
  };
  isSelected = key => {
    /*
      Instead of passing our external selection state we provide an 'isSelected'
      callback and detect the selection state ourselves. This allows any implementation
      for selection (either an array, object keys, or even a Javascript Set object).
    */
    return this.state.selection.includes(key);
  };
  logSelection = () => {
    console.log("selection:", this.state.selection);
  };
  toggleType = () => {
    this.setState({
      selectType: this.state.selectType === "radio" ? "checkbox" : "radio",
      selection: [],
      selectAll: true
    });
  };
  // toggleTree = () => {
  //   if (this.state.pivotBy.length) {
  //     this.setState({ pivotBy: [], expanded: {} });
  //   } else {
  //     this.setState({ pivotBy: [], expanded: {} });
  //   }
  // };

  // onExpandedChange = (newExpanded, index, event) => {
  //   this.setState({ expanded: newExpanded });
  // };

  excludeOpenSeries = allSeriesArr => {
    const result = [];
    //get all series number in an array
    const idArr = this.props.openSeries.reduce((all, item, index) => {
      all.push(item.seriesUID);
      return all;
    }, []);
    //if array doesnot include that serie number
    allSeriesArr.forEach(serie => {
      if (!idArr.includes(serie.seriesUID)) {
        //push that serie in the result arr
        result.push(serie);
      }
    });
    return result;
  };

  getSeriesData = async selected => {
    this.props.dispatch(startLoading());
    const { projectID, patientID, studyUID } = selected;
    try {
      const { data: series } = await getSeries(projectID, patientID, studyUID);
      this.props.dispatch(loadCompleted());
      return series;
    } catch (err) {
      this.props.dispatch(annotationsLoadingError(err));
    }
  };

  displaySeries = async selected => {
    if (this.props.openSeries.length === MAX_PORT) {
      this.props.dispatch(alertViewPortFull());
    } else {
      const { patientID, studyUID } = selected;
      let seriesArr;
      //check if the patient is there (create a patient exist flag)
      const patientExists = this.props.patients[patientID];
      //if there is patient iterate over the series object of the study (form an array of series)
      if (patientExists) {
        seriesArr = Object.values(
          this.props.patients[patientID].studies[studyUID].series
        );
        //if there is not a patient get series data of the study and (form an array of series)
      } else {
        seriesArr = await this.getSeriesData(selected);
      }
      //get extraction of the series (extract unopen series)
      if (seriesArr.length > 0) seriesArr = this.excludeOpenSeries(seriesArr);
      //check if there is enough room
      if (seriesArr.length + this.props.openSeries.length > MAX_PORT) {
        //if there is not bring the modal
        await this.setState({
          isSerieSelectionOpen: true,
          selectedStudy: [seriesArr],
          studyName: selected.studyDescription
        });
      } else {
        //if there is enough room
        //add serie to the grid
        const promiseArr = [];
        for (let serie of seriesArr) {
          this.props.dispatch(addToGrid(serie));
          promiseArr.push(this.props.dispatch(getSingleSerie(serie)));
        }
        //getsingleSerie
        Promise.all(promiseArr)
          .then(() => {})
          .catch(err => console.log(err));

        //if patient doesnot exist get patient
        if (!patientExists) {
          this.props.dispatch(getWholeData(null, selected));
        } else {
          //check if study exist
          this.props.dispatch(
            updatePatient("study", true, patientID, studyUID)
          );
        }
        this.props.history.push("/display");
      }
      this.props.dispatch(clearSelection());
    }
  };

  closeSelectionModal = () => {
    this.setState(state => ({
      isSerieSelectionOpen: !state.isSerieSelectionOpen
    }));
  };

  onExpandedChange = (newExpanded, index, event) => {
    const { data } = this.state;
    this.setState({ expanded: newExpanded });
    const expansionArr = [...this.state.expansionArr];
    expansionArr[index] = expansionArr[index] ? false : data[index].studyUID;
    this.setState({ expansionArr });
    const obj = {
      patient: this.props.patientIndex,
      study: { [index]: newExpanded[index] }
    };
    this.props.getTreeExpandSingle(obj);
  };

  render() {
    const {
      toggleSelection,
      toggleAll,
      isSelected,
      logSelection,
      toggleType,
      onExpandedChange,
      toggleTree
    } = this;
    const { data, columns, selectAll, selectType } = this.state;
    const extraProps = {
      selectAll,
      isSelected,
      toggleAll,
      toggleSelection,
      selectType,
      // expanded,
      onExpandedChange
    };
    const TheadComponent = props => null;
    return (
      <div>
        {this.state.data ? (
          <TreeTable
            NoDataComponent={() => null}
            data={this.state.data}
            columns={this.state.columns}
            pageSize={this.state.data.length}
            ref={r => (this.selectTable = r)}
            className="-striped -highlight"
            // freezWhenExpanded={false}
            showPagination={false}
            TheadComponent={TheadComponent}
            {...extraProps}
            getTdProps={(state, rowInfo, column) => ({
              onDoubleClick: e => {
                this.displaySeries(rowInfo.original);
              }
            })}
            expanded={this.state.expanded}
            SubComponent={row => {
              return (
                <div style={{ paddingLeft: "20px" }}>
                  <Series
                    projectId={this.props.projectId}
                    subjectId={this.props.subjectId}
                    studyId={row.original.studyUID}
                    studyDescription={row.original.studyDescription}
                    update={this.props.update}
                    expandLevel={this.props.expandLevel}
                    updateExpandedLevelNums={this.props.updateExpandedLevelNums}
                    progressUpdated={this.props.progressUpdated}
                    expansionArr={this.state.expansionArr}
                    getTreeExpandSingle={this.props.getTreeExpandSingle}
                    getTreeExpandAll={this.props.getTreeExpandAll}
                    treeExpand={this.props.treeExpand}
                    patientIndex={this.props.patientIndex}
                    studyIndex={row.index}
                    expandLoading={this.props.expandLoading}
                    treeData={this.props.treeData}
                    getTreeData={this.props.getTreeData}
                  />
                </div>
              );
            }}
          />
        ) : null}
        {this.state.isSerieSelectionOpen && (
          <ProjectModal
            seriesPassed={this.state.selectedStudy}
            onCancel={this.closeSelectionModal}
            studyName={this.state.studyName}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    loading: state.annotationsListReducer.loading,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    showProjectModal: state.annotationsListReducer.showProjectModal
  };
};
export default withRouter(connect(mapStateToProps)(Studies));
