import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import ReactTable from "react-table";
import selectTableHOC from "react-table/lib/hoc/selectTable";
import treeTableHOC from "react-table/lib/hoc/treeTable";
import { getAnnotations } from "../../services/annotationServices";
import {
  displaySingleAim,
  alertViewPortFull,
  getSingleSerie,
  getAnnotationListData
} from "../annotationsList/action";
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

class Annotations extends Component {
  constructor(props) {
    super(props);

    this.series = Object.assign({}, this.props);
    this.state = {
      columns: [],
      selection: [],
      selectAll: false,
      selectType: "checkbox",
      expanded: {}
    };
  }

  async componentDidMount() {
    const {
      data: {
        ResultSet: { Result: data }
      }
    } = await getAnnotations(this.series);
    this.setState({ data });
    this.setState({ columns: this.setColumns() });
  }

  setColumns() {
    const columns = [
      {
        Header: "Annotation Name",
        Cell: row => <div>{row.original.name}</div>
      },
      {
        Header: "Type",
        Cell: row => <div>{row.original.template}</div>
      },
      {
        Header: "Created Date",
        Cell: row => row.original.date
      },
      {
        Header: "Identifier",
        Cell: row => row.original.aimID
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

  dispatchAnnDisplay = selected => {
    console.log("in annotation function-selected:", selected);
    const { projectID, studyUID, seriesUID, aimID } = selected;
    const patientID = selected.originalSubjectID;
    const openSeries = Object.values(this.props.openSeries);
    const serieObj = { projectID, patientID, studyUID, seriesUID, aimID };
    let isSerieOpen = false;
    //check if there is enough space in the grid
    let isGridFull = openSeries.length === 6;
    //check if the serie is already open
    if (openSeries.length > 0) {
      for (let i = 0; i < openSeries.length; i++) {
        // for (let serie of openSeries) {
        if (openSeries[i].seriesUID === seriesUID) {
          isSerieOpen = true;
          break;
        }
      }
    }
    if (isSerieOpen) {
      this.props.dispatch(
        displaySingleAim(patientID, studyUID, seriesUID, aimID)
      );
    } else {
      if (isGridFull) {
        this.props.dispatch(alertViewPortFull());
      } else {
        if (this.props.patients[patientID]) {
          this.props.dispatch(getSingleSerie(serieObj, aimID));
          //if patient doesn't exist dispatch to get data
        } else {
          this.props.dispatch(getAnnotationListData(serieObj, null, aimID));
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
                  this.dispatchAnnDisplay(rowInfo.original);
                  console.log(rowInfo.original);
                }
              };
            }}
          />
        ) : null}
      </div>
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

export default withRouter(connect(mapStateToProps)(Annotations));
