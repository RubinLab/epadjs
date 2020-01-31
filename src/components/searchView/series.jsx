import React, { Component } from "react";
import { connect } from "react-redux";
import { FaBatteryEmpty, FaBatteryFull, FaBatteryHalf } from "react-icons/fa";
import ReactTooltip from "react-tooltip";
import { BrowserRouter, withRouter } from "react-router-dom";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import selectTableHOC from "react-table/lib/hoc/selectTable";
import treeTableHOC from "react-table/lib/hoc/treeTable";
import Annotations from "./annotations";
import { getSeries } from "../../services/seriesServices";
import {
  alertViewPortFull,
  getSingleSerie,
  changeActivePort,
  selectSerie,
  clearSelection,
  addToGrid,
  getWholeData,
  updatePatient
} from "../annotationsList/action";
import { MAX_PORT, formatDates } from "../../constants";
import AlertGridFull from "./alertGridFull";
import { persistExpandView } from "../../Utils/aid";
import "react-table/react-table.css";

// const SelectTreeTable = selectTableHOC(treeTableHOC(ReactTable));
const TreeTable = treeTableHOC(ReactTable);

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
  if (status === "DONE") {
    return <FaBatteryFull className="progress-done" />;
  } else if (status === "NOT_STARTED") {
    return <FaBatteryEmpty className="progress-notStarted" />;
  } else if (status === "IN_PROGRESS") {
    return <FaBatteryHalf className="progress-inProgress" />;
  } else {
    return <div>{status}</div>;
  }
};

function selectSeries(projectId, subjectId, studyId, seriesId) {
  return {
    type: "SELECT_SERIES",
    payload: {
      projectId,
      subjectId,
      studyId,
      seriesId
    }
  };
}

class Series extends Component {
  constructor(props) {
    super(props);
    this.widthUnit = 20;
    this.state = {
      series: this.props.series,
      columns: [],
      selection: [],
      selectAll: false,
      selectType: "checkbox",
      expanded: {},
      showGridFullWarning: false,
      // selectedSerie: {}
      expansionArr: []
    };
  }

  async componentDidMount() {
    try {
      const {
        projectId,
        subjectId,
        studyId,
        expansionArr,
        updateExpandedLevelNums,
        expandLevel,
        treeExpand,
        patientIndex,
        studyIndex,
        expandLoading,
        treeData
      } = this.props;
      const { numOfPresentStudies, numOfStudiesLoaded } = expandLoading;
      // const { data: data } = await getSeries(projectId, subjectId, studyId);
      let data = Object.values(treeData[subjectId].studies[studyId].series);
      if (data.length > 0) {
        data = data.map(el => el.data);
      } else {
        let series = await getSeries(projectId, subjectId, studyId);
        data = series.data;
        this.props.getTreeData("series", data);
      }
      this.setState({ data });
      this.setState({ columns: this.setColumns() });
      const seriesOpened = expansionArr.includes(studyId);
      const alreadyCounted = numOfPresentStudies === numOfStudiesLoaded;
      if (!seriesOpened && expandLevel === 2 && !alreadyCounted) {
        updateExpandedLevelNums("study", data.length, 1);
      }
      if (expandLevel > 2) {
        this.expandCurrentLevel();
        const obj = {
          patient: this.props.patientIndex,
          study: this.props.studyIndex,
          series: data.length
        };
        this.props.getTreeExpandAll(obj, true, expandLevel);
      }

      if (data.length === 0) {
        toast.info("No serie found", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
      const expanded = {};
      const ptExpandKeys = Object.keys(treeExpand[patientIndex][studyIndex]);
      const ptExpandVal = Object.values(treeExpand[patientIndex][studyIndex]);
      ptExpandKeys.forEach((el, index) => {
        expanded[el] = ptExpandVal[index];
      });
      this.setState({ expanded });
    } catch (err) {
      console.log("Couldn't load all series data. Please Try again!");
    }
  }

  async componentDidUpdate(prevProps) {
    try {
      const {
        update,
        studyId,
        expansionArr,
        updateExpandedLevelNums,
        expandLevel
      } = this.props;
      const seriesOpened = expansionArr.includes(studyId);
      if (update !== prevProps.update) {
        const { data: data } = await getSeries(
          this.props.projectId,
          this.props.subjectId,
          this.props.studyId
        );
        const expanded = persistExpandView(
          this.state.expanded,
          this.state.data,
          data,
          "seriesUID"
        );
        this.setState({ data, expanded });
      }
      if (this.props.expandLevel != prevProps.expandLevel) {
        this.props.expandLevel >= 3
          ? this.expandCurrentLevel()
          : this.setState({ expanded: {} });

        const expandedToSeries =
          prevProps.expandLevel < expandLevel && expandLevel === 2;
        if (expandedToSeries && seriesOpened) {
          updateExpandedLevelNums("study", this.state.data.length, 1);
        }
        const expandToAnnotations =
          prevProps.expandLevel < expandLevel && expandLevel === 3;
        const shrinkedToSeries =
          prevProps.expandLevel > expandLevel && expandLevel === 2;
        const obj = {
          patient: this.props.patientIndex,
          study: this.props.studyIndex,
          series: this.state.data.length
        };
        if (shrinkedToSeries) {
          this.setState({ expansionArr: [] });
          this.props.getTreeExpandAll(obj, false, this.props.expandLevel);
        }

        if (expandToAnnotations)
          this.props.getTreeExpandAll(obj, true, this.props.expandLevel);
      }
    } catch (err) {
      console.log("Couldn't load all series data. Please Try again!");
    }
  }

  expandCurrentLevel = () => {
    try {
      const expanded = {};
      for (let i = 0; i < this.state.data.length; i++) {
        // expanded[i] = this.state.data[i].numberOfAnnotations ? true : false;
        expanded[i] = this.state.data[i];
      }
      this.setState({ expanded });
    } catch (err) {
      console.log("Couldn't load all series data. Please Try again!");
    }
  };

  selectRow = selected => {
    // const newState = { ...this.state.selectedSerie };
    // newState[selected.seriesUID]
    //   ? delete newState[selected.seriesUID]
    //   : (newState[selected.seriesUID] = selected.seriesDescription);
    // this.setState({ selectedSerie: newState });
    this.props.dispatch(clearSelection("serie"));
    this.props.dispatch(selectSerie(selected, this.props.studyDescription));
  };
  setColumns() {
    const columns = [
      {
        id: "checkbox",
        accessor: "",
        width: this.widthUnit,
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.props.selectedSeries[original.seriesUID] || false}
              onChange={() => this.selectRow(original)}
            />
          );
        }
      },
      {
        Header: (
          <div>
            Series Description{" "}
            <span className="badge badge-secondary"> # of Annotations </span>
          </div>
        ),
        width: this.widthUnit * 11,
        Cell: row => {
          let desc = row.original.seriesDescription || "Unnamed Serie";
          let id = "desc" + row.original.seriesUID;
          return (
            <>
              <div data-tip data-for={id} style={{ whiteSpace: "pre-wrap" }}>
                {desc}
              </div>{" "}
              <ReactTooltip
                id={id}
                place="top"
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
        //annotations
        width: this.widthUnit * 2,
        Cell: row => (
          <div className="searchView-table__cell">
            {row.original.numberOfAnnotations === "" ? (
              ""
            ) : (
              <span className="badge badge-secondary">
                {row.original.numberOfAnnotations}
              </span>
            )}
          </div>
        )
      },
      {
        //subitem
        width: this.widthUnit * 3,
        Cell: row => <div />
      },
      {
        Header: (
          <div>
            <span className="badge badge-secondary"> # of Images </span>
          </div>
        ),
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
        Header: "Type",
        width: this.widthUnit * 5,
        Cell: row => (
          <div className="searchView-table__cell">{row.original.examType}</div>
        )
      },
      {
        width: this.widthUnit * 7,
        Header: "Study/Created Date",
        Cell: row => (
          <div className="searchView-table__cell">
            {formatDates(row.original.seriesDate)}
          </div>
        )
      },
      {
        width: this.widthUnit * 7,
        Header: "Uploaded",
        Cell: row => (
          <div className="searchView-table__cell">
            {formatDates(row.original.createdTime)}
          </div>
        )
      },
      {
        Header: "Accession",
        width: this.widthUnit * 6,
        Cell: row => (
          <div className="searchView-table__cell">
            {row.original.accessionNumber}
          </div>
        )
      },
      {
        Header: "Identifier",
        width: this.widthUnit * 10,
        Cell: row => (
          <>
            <div
              className="searchView-table__cell"
              data-tip
              data-for={row.original.seriesUID}
            >
              {row.original.seriesUID}
            </div>{" "}
            <ReactTooltip
              id={row.original.seriesUID}
              place="right"
              type="info"
              delayShow={500}
              clickable={true}
            >
              <span>{row.original.seriesUID}</span>
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
      selectAll: false
    });
  };
  toggleTree = () => {
    if (this.state.pivotBy.length) {
      this.setState({ pivotBy: [], expanded: {} });
    } else {
      this.setState({ pivotBy: [], expanded: {} });
    }
  };

  onExpandedChange = (newExpanded, index, event) => {
    const { data } = this.state;
    this.setState({ expanded: newExpanded });
    const expansionArr = [...this.state.expansionArr];
    expansionArr[index] = expansionArr[index] ? false : data[index].seriesUID;
    this.setState({ expansionArr });
    const obj = {
      patient: this.props.patientIndex,
      study: this.props.studyIndex,
      series: { [index]: newExpanded[index] }
    };
    this.props.getTreeExpandSingle(obj);
  };

  handleSelectSeries = row => {
    if (!this.state.series.find(serie => serie.seriesId === row.seriesUID)) {
      this.props.dispatch(
        selectSeries(
          row.projectID,
          this.props.subjectId,
          row.studyUID,
          row.seriesUID
        )
      );
    }
    this.props.history.push("/display");
  };

  handleCloseModal = () => {
    this.setState({ showGridFullWarning: false });
  };

  dispatchSerieDisplay = selected => {
    const openSeries = Object.values(this.props.openSeries);
    const { patientID, studyUID } = selected;
    let isSerieOpen = false;

    //check if there is enough space in the grid
    let isGridFull = openSeries.length === MAX_PORT;
    //check if the serie is already open

    if (openSeries.length > 0) {
      for (let i = 0; i < openSeries.length; i++) {
        if (openSeries[i].seriesUID === selected.seriesUID) {
          isSerieOpen = true;
          this.props.dispatch(changeActivePort(i));
          break;
        }
        // }
      }
    }

    //serie is not already open;
    if (!isSerieOpen) {
      //if the grid is full show warning
      if (isGridFull) {
        // this.setState({ showGridFullWarning: true });
        this.props.dispatch(alertViewPortFull());
      } else {
        this.props.dispatch(addToGrid(selected));
        this.props
          .dispatch(getSingleSerie(selected))
          .then(() => {})
          .catch(err => console.log(err));
        //if grid is NOT full check if patient data exists
        if (!this.props.patients[selected.patientID]) {
          this.props.dispatch(getWholeData(selected));
        } else {
          this.props.dispatch(
            updatePatient(
              "serie",
              true,
              patientID,
              studyUID,
              selected.seriesUID
            )
          );
        }
      }
    }
    this.props.dispatch(clearSelection());
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
    const { data, columns, selectAll, selectType, expanded } = this.state;
    const extraProps = {
      selectAll,
      isSelected,
      toggleAll,
      toggleSelection,
      selectType,
      onExpandedChange,
      expanded
    };

    const TheadComponent = props => null;
    return (
      <>
        <div>
          {this.state.data ? (
            <TreeTable
              NoDataComponent={() => null}
              data={this.state.data}
              columns={this.state.columns}
              pageSize={this.state.data.length}
              ref={r => (this.selectTable = r)}
              className="-striped -highlight"
              freezWhenExpanded={false}
              showPagination={false}
              TheadComponent={TheadComponent}
              {...extraProps}
              getTdProps={(state, rowInfo, column, instance) => {
                return {
                  onDoubleClick: (e, handleOriginal) => {
                    this.handleSelectSeries(rowInfo.original);
                    if (handleOriginal) {
                      handleOriginal();
                    }
                    this.dispatchSerieDisplay(rowInfo.original);
                  }
                };
              }}
              SubComponent={row => {
                return (
                  <div style={{ paddingLeft: "20px" }}>
                    <Annotations
                      projectId={this.props.projectId}
                      subjectId={this.props.subjectId}
                      studyId={row.original.studyUID}
                      seriesId={row.original.seriesUID}
                      studyDescription={this.props.studyDescription}
                      seriesDescription={row.original.seriesDescription}
                      update={this.props.update}
                      updateExpandedLevelNums={
                        this.props.updateExpandedLevelNums
                      }
                      expandLevel={this.props.expandLevel}
                      progressUpdated={this.props.progressUpdated}
                      expansionArr={this.state.expansionArr}
                      expandLevel={this.props.expandLevel}
                      expandLoading={this.props.expandLoading}
                      treeExpand={this.props.treeExpand}
                      patientIndex={this.props.patientIndex}
                      studyIndex={this.props.studyIndex}
                      seriesIndex={row.index}
                    />
                  </div>
                );
              }}
            />
          ) : null}
        </div>
        {this.state.showGridFullWarning && (
          <AlertGridFull onOK={this.handleCloseModal} />
        )}
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    series: state.searchViewReducer.series,
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    activePort: state.annotationsListReducer.activePort,
    selectedSeries: state.annotationsListReducer.selectedSeries
  };
};

export default withRouter(connect(mapStateToProps)(Series));
