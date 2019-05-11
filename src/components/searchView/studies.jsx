import React, { Component } from "react";
import { connect } from "react-redux";
import ReactTable from "react-table";
import { FaBatteryEmpty, FaBatteryFull, FaBatteryHalf } from "react-icons/fa";
import selectTableHOC from "react-table/lib/hoc/selectTable";
import treeTableHOC from "react-table/lib/hoc/treeTable";
import { getStudies } from "../../services/studyServices";
import { getSeries } from "../../services/seriesServices";

import Series from "./series";
import {
  openProjectSelectionModal,
  getSingleSerie,
  getAnnotationListData,
  selectStudy,
  clearSelection
} from "../annotationsList/action";
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

    this.state = {
      columns: [],
      selection: [],
      selectAll: false,
      selectType: "checkbox",
      expanded: {}
      // selectedStudy: {}
    };
  }

  async componentDidMount() {
    const {
      data: {
        ResultSet: { Result: data }
      }
    } = await getStudies(this.props.projectId, this.props.subjectId);
    this.setState({ data });
    this.setState({ columns: this.setColumns() });
  }

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

  setColumns() {
    const columns = [
      {
        id: "checkbox",
        accessor: "",
        width: 30,
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
        /*Header: (
          <div>
            Study Description{" "}
            <span className="badge badge-secondary"> # of Annotations </span>
          </div>
        ),*/
        Cell: row => (
          <div>
            {row.original.studyDescription || "Unnamed Study"} &nbsp;
            {row.original.numberOfAnnotations === "" ? (
              "merru"
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
        /*Header: (
          <div>
            <span className="badge badge-secondary"> # of Series </span>
            &nbsp;&nbsp;
            <span className="badge badge-secondary"> # of Images </span>
          </div>
        ),*/
        Cell: row => (
          <div>
            {row.original.numberOfSeries === "" ? (
              ""
            ) : (
              <span className="badge badge-secondary">
                {" "}
                {row.original.numberOfSeries}{" "}
              </span>
            )}
            &nbsp;&nbsp;
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
        //Header: "Type",
        Cell: row => row.original.examTypes.join("/")
      },
      {
        //Header: "Ready",
        Cell: row => (
          <div>{progressDisplay(row.original.studyProcessingStatus)}</div>
        )
      },
      {
        //Header: "Study/Created Date",
        Cell: row => row.original.insertDate
      },
      {
        //Header: "Uploaded",
        Cell: row => row.original.createdTime
      },
      {
        //Header: "Accession",
        Cell: row => row.original.studyAccessionNumber
      },
      {
        //Header: "Identifier",
        Cell: row => row.original.studyUID
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
    const { projectID, patientID, studyUID } = selected;
    try {
      const {
        data: {
          ResultSet: { Result: series }
        }
      } = await getSeries(projectID, patientID, studyUID);
      return series;
    } catch (err) {
      console.log(err);
    }
  };

  displaySeries = async selected => {
    console.log(selected);
    const { projectID, patientID, studyUID } = selected;
    // let total;
    //check if the patient already exist
    //if patient exists extract the open series and control the grid for enough room
    if (this.props.patients[patientID]) {
      const study = this.props.patients[patientID].studies[studyUID];
      const extractedStudy = this.excludeOpenSeries(
        Object.values(study.series)
      );
      //if there is not enough room bring modal
      // total = extractedStudy.length + this.props.openSeries.length;
      console.log(
        "total",
        extractedStudy.length + this.props.openSeries.length
      );
      if (extractedStudy.length + this.props.openSeries.length > 6) {
        if (this.props.loading) {
          setTimeout(function() {
            //do what you need here
          }, 1000);
        }
        await this.props.dispatch(selectStudy(selected));
        this.props.dispatch(openProjectSelectionModal());
        //add the project to the selected studies
        // if there is enough room iterate over the extracted array and call getsingleserie
      } else {
        extractedStudy.forEach(serie => {
          this.props.dispatch(getSingleSerie({ ...serie, projectID }));
        });
      }
    } else {
      //if patient is not there make the control
      //if not enough room bring the modal
      // total = selected.numberOfSeries + this.props.openSeries.length;
      console.log(
        "total",
        selected.numberOfSeries + this.props.openSeries.length
      );

      if (selected.numberOfSeries + this.props.openSeries.length > 6) {
        if (this.props.loading) {
          setTimeout(function() {
            //do what you need here
          }, 1000);
        }
        await this.props.dispatch(selectStudy(selected));
        this.props.dispatch(openProjectSelectionModal());
        //add the project to the selected studies
      } else {
        //if enough room bring all series
        const result = await this.getSeriesData(selected);
        if (Array.isArray(result) && result.length > 0) {
          await this.props.dispatch(await getAnnotationListData(result[0]));
          for (let i = 1; i < result.length; i++) {
            console.log("inside the loop", result[i]);
            await this.props.dispatch(getSingleSerie(result[i]));
          }
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
    const TheadComponent = props => null;
    return (
      <div>
        {this.state.data ? (
          <TreeTable
            data={this.state.data}
            columns={this.state.columns}
            defaultPageSize={this.state.data.length}
            ref={r => (this.selectTable = r)}
            className="-striped -highlight"
            freezWhenExpanded={false}
            showPagination={false}
            TheadComponent={TheadComponent}
            {...extraProps}
            getTdProps={(state, rowInfo, column) => ({
              onDoubleClick: e => {
                this.displaySeries(rowInfo.original);
                console.log(rowInfo.original);
              }
            })}
            SubComponent={row => {
              return (
                <div style={{ paddingLeft: "20px" }}>
                  <Series
                    projectId={this.props.projectId}
                    subjectId={this.props.subjectId}
                    studyId={row.original.studyUID}
                  />
                </div>
              );
            }}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    loading: state.annotationsListReducer.loading,
    selectedStudies: state.annotationsListReducer.selectedStudies
  };
};
export default connect(mapStateToProps)(Studies);
