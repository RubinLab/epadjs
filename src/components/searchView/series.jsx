import React, { Component } from "react";
import { connect } from "react-redux";
import { BrowserRouter, withRouter } from "react-router-dom";
import ReactTable from "react-table";
import selectTableHOC from "react-table/lib/hoc/selectTable";
import treeTableHOC from "react-table/lib/hoc/treeTable";
import Annotations from "./annotations";
import { getSeries } from "../../services/seriesServices";
import {
  alertViewPortFull,
  getAnnotationListData,
  getSingleSerie,
  changeActivePort
} from "../annotationsList/action";
import AlertGridFull from "./alertGridFull";
import "react-table/react-table.css";

const SelectTreeTable = selectTableHOC(treeTableHOC(ReactTable));

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

    this.state = {
      series: this.props.series,
      columns: [],
      selection: [],
      selectAll: false,
      selectType: "checkbox",
      expanded: {},
      showGridFullWarning: false
    };
  }

  async componentDidMount() {
    const {
      data: {
        ResultSet: { Result: data }
      }
    } = await getSeries(
      this.props.projectId,
      this.props.subjectId,
      this.props.studyId
    );
    this.setState({ data });
    this.setState({ columns: this.setColumns() });
  }

  setColumns() {
    const columns = [
      {
        Header: (
          <div>
            Series Description{" "}
            <span className="badge badge-secondary"> # of Annotations </span>
          </div>
        ),
        Cell: row => (
          <div>
            {row.original.seriesDescription} &nbsp; <br />
            {row.original.numberOfAnnotations === "" ? (
              ""
            ) : (
              <span className="badge badge-secondary">
                {" "}
                {row.original.numberOfAnnotations}{" "}
              </span>
            )}
          </div>
        )
      },
      {
        Header: (
          <div>
            <span className="badge badge-secondary"> # of Images </span>
          </div>
        ),
        Cell: row => (
          <div>
            {row.original.numberOfImages === "" ? (
              ""
            ) : (
              <span className="badge badge-secondary">
                {" "}
                {row.original.numberOfImages}{" "}
              </span>
            )}
          </div>
        )
      },
      {
        Header: "Type",
        Cell: row => row.original.examType
      },
      {
        Header: "Ready",
        Cell: row => row.original.seriesProcessingStatus
      },
      {
        Header: "Study/Created Date",
        Cell: row => row.original.seriesDate
      },
      {
        Header: "Uploaded",
        Cell: row => row.original.createdTime
      },
      {
        Header: "Accession",
        Cell: row => row.original.accessionNumber
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
  onExpandedChange = expanded => {
    this.setState({ expanded });
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
    // console.log(this.props);
    const openSeries = Object.values(this.props.openSeries);
    let isSerieOpen = false;
    //check if there is enough space in the grid
    let isGridFull = openSeries.length === 6;
    //check if the serie is already open
    if (openSeries.length > 0) {
      for (let i = 0; i < openSeries.length; i++) {
        // for (let serie of openSeries) {
        if (openSeries[i]) {
          if (openSeries[i].seriesUID === selected.seriesUID) {
            isSerieOpen = true;
            this.props.dispatch(changeActivePort(i));
            break;
          }
        }
      }
    }
    //serie is not already open;
    if (!isSerieOpen) {
      //if the grid is full show warning
      if (isGridFull) {
        // this.setState({ showGridFullWarning: true });
        this.props.dispatch(alertViewPortFull());
      } else {
        //if grid is NOT full check if patient data exists
        if (this.props.patients[selected.patientID]) {
          this.props.dispatch(getSingleSerie(selected));
          //if patient doesn't exist dispatch to get data
        } else {
          this.props.dispatch(getAnnotationListData(selected));
        }
      }
    }
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
      expanded,
      onExpandedChange
    };
    return (
      <>
        <div>
          {this.state.data ? (
            <SelectTreeTable
              data={this.state.data}
              columns={this.state.columns}
              defaultPageSize={this.state.data.length}
              ref={r => (this.selectTable = r)}
              className="-striped -highlight"
              freezWhenExpanded={false}
              showPagination={false}
              {...extraProps}
              getTdProps={(state, rowInfo, column, instance) => {
                return {
                  onDoubleClick: (e, handleOriginal) => {
                    console.log(rowInfo.original);
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
  const { openSeries, patients, activePort } = state.annotationsListReducer;
  return {
    series: state.searchViewReducer.series,
    openSeries,
    patients,
    activePort
  };
};

export default withRouter(connect(mapStateToProps)(Series));
