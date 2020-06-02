import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import selectTableHOC from "react-table/lib/hoc/selectTable";
import treeTableHOC from "react-table/lib/hoc/treeTable";
import ReactTooltip from "react-tooltip";
import { MAX_PORT, formatDates } from "../../constants";
import { getAnnotations } from "../../services/annotationServices";
import {
  alertViewPortFull,
  getSingleSerie,
  clearSelection,
  selectAnnotation,
  changeActivePort,
  addToGrid,
  getWholeData,
  updatePatient,
  jumpToAim,
  showAnnotationDock,
} from "../annotationsList/action";
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

class Annotations extends Component {
  constructor(props) {
    super(props);
    this.widthUnit = 20;
    this.series = Object.assign({}, this.props);
    this.state = {
      columns: [],
      selection: [],
      selectAll: false,
      selectType: "checkbox",
      expanded: {},
    };
  }

  async componentDidMount() {
    try {
      const {
        // updateExpandedLevelNums,
        expansionArr,
        seriesId,
        // expandLoading
      } = this.props;
      // const { numOfSeriesLoaded, numOfPressentSeries } = expandLoading;
      const { data } = await getAnnotations(this.series);
      this.setState({ data });
      this.setState({ columns: this.setColumns() });
      const annsOpened = expansionArr.includes(seriesId);
      // const alreadyCounted = numOfSeriesLoaded === numOfPresentSeries;

      // if (!annsOpened && !alreadyCounted)
      //   updateExpandedLevelNums("series", data.length, 1);
      if (data.length === 0 && this.props.expandLevel !== 3) {
        toast.info("No annotations found", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.log("Couldn't load all annotation data. Please Try again!");
    }
  }

  async componentDidUpdate(prevProps) {
    try {
      const {
        progressUpdated,
        update,
        expandLevel,
        expansionArr,
        seriesId,
        selectedAnnotations
        // updateExpandedLevelNums
      } = this.props;
      const annsOpened = expansionArr.includes(seriesId);
      if (
        update !== prevProps.update ||
        progressUpdated !== prevProps.progressUpdated
      ) {
        const { data } = await getAnnotations(this.series);
        const expanded = persistExpandView(
          this.state.expanded,
          this.state.data,
          data,
          "aimID"
        );
        this.setState({ data, expanded });
      }

      const newSelectedAnnArr = Object.keys(selectedAnnotations);
      const oldSelectedAnnArr = Object.keys(prevProps.selectedAnnotations);
      if (newSelectedAnnArr.length !== oldSelectedAnnArr.length) {
        this.setState({ columns: this.setColumns() });
      }

      // if (expandLevel != prevProps.expandLevel) {
      //   if (expandLevel === 3 && annsOpened) {
      //     updateExpandedLevelNums("series", this.state.data.length, 1);
      //   }
      // }
    } catch (err) {
      console.log("Couldn't load all annotation data. Please Try again!");
    }
  }

  selectRow = selected => {
    const { studyDescription, seriesDescription } = this.props;
    this.props.dispatch(clearSelection("annotation"));
    this.props.dispatch(
      selectAnnotation(selected, studyDescription, seriesDescription)
    );
  };

  setColumns() {
    const { selectedAnnotations } = this.props;

    const columns = [
      {
        expander: true,
        width: 35,
        Expander: ({ isExpanded, ...rest }) => (
          <div>
            {isExpanded ? <span>&#x25BC;</span> : <span>&#x25B6;</span>}
          </div>
        ),
        style: {
          cursor: 'pointer',
          fontSize: 10,
          padding: '0',
          textAlign: 'center',
          userSelect: 'none',
          color: '#fafafa',
          padding: "7px 5px",
          verticalAlign: "middle"
        },
      },
      {
        id: "checkbox",
        accessor: "",
        width: this.widthUnit,
        Cell: ({ original }) => {
          const { aimID, projectID } = original;
          const selected =
            selectedAnnotations[aimID] &&
            selectedAnnotations[aimID].projectID === projectID;
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={selected}
              onChange={() => this.selectRow(original)}
            />
          );
        },
      },
      {
        Header: "Annotation Name",
        width: this.widthUnit * 10,
        Cell: row => {
          let desc = row.original.name || "Unnamed annotation";
          let id = "aimName-tool" + row.original.aimID;
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
        },
      },
      {
        //no of aims
        width: this.widthUnit * 2,
        Cell: row => <div />,
      },
      {
        //no of sub item
        width: this.widthUnit * 3,
        Cell: row => <div />,
      },
      {
        //no of sub images
        width: this.widthUnit * 3,
        Cell: row => <div />,
      },
      {
        Header: "Type",
        width: this.widthUnit * 5,
        Cell: row => (
          <div className="searchView-table__cell">{row.original.template}</div>
        ),
      },
      {
        Header: "Created Date",
        width: this.widthUnit * 7,
        Cell: row => {
          return (
            <div className="searchView-table__cell">
              {formatDates(row.original.date)}
            </div>
          );
        },
      },
      {
        //upload date
        width: this.widthUnit * 7,
        Cell: row => <div />,
      },
      {
        //uaccession
        width: this.widthUnit * 6,
        Cell: row => <div />,
      },
      {
        Header: "Identifier",
        width: this.widthUnit * 10,
        Cell: row => {
          let id = "aimid-tool" + row.original.aimID;
          return (
            <>
              <div data-tip data-for={id}>
                {row.original.aimID}
              </div>
              <ReactTooltip
                id={id}
                place="right"
                type="info"
                delayShow={500}
                clickable={true}
              >
                <span>{row.original.aimID}</span>
              </ReactTooltip>
            </>
          );
        },
      },
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
          ...selection.slice(keyIndex + 1),
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
      "toggleAll" is a tricky concept with any filterable table
      do you just select ALL the records that are in your data?
      OR
      do you only select ALL the records that are in the current filtered data?

      The latter makes more sense because "selection" is a visual thing for the user.
      This is especially true if you are going to implement a set of external functions
      that act on the selected information (you would not want to DELETE the wrong thing!).

      So, to that end, access to the internals of ReactTable are required to get what is
      currently visible in the table (either on the current page or any other page).

      The HOC provides a method call "getWrappedInstance" to get a ref to the wrapped
      ReactTable and then get the internal state and the "sortedData".
      That can then be iterrated to get all the currently visible records and set
      the selection state.
    */
    const selectAll = this.state.selectAll ? false : true;
    const selection = [];
    if (selectAll) {
      // we need to get at the internals of ReactTable
      const wrappedInstance = this.selectTable.getWrappedInstance();
      // the "sortedData" property contains the currently accessible records based on the filter and sort
      const currentRecords = wrappedInstance.getResolvedState().sortedData;
      // we need to get all the "real" (original) records out to get at their IDs
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
      Instead of passing our external selection state we provide an "isSelected"
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
      selectAll: false,
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

  checkIfSerieOpen = selectedSerie => {
    let isOpen = false;
    let index;
    this.props.openSeries.forEach((serie, i) => {
      if (serie.seriesUID === selectedSerie) {
        isOpen = true;
        index = i;
      }
    });
    return { isOpen, index };
  };

  displayAnnotations = selected => {
    const { projectID, studyUID, seriesUID, aimID } = selected;
    const patientID = selected.subjectID;
    const { openSeries } = this.props;
    // const serieObj = { projectID, patientID, studyUID, seriesUID, aimID };
    //check if there is enough space in the grid
    let isGridFull = openSeries.length === MAX_PORT;
    //check if the serie is already open
    if (this.checkIfSerieOpen(seriesUID).isOpen) {
      const { index } = this.checkIfSerieOpen(seriesUID);
      this.props.dispatch(changeActivePort(index));
      this.props.dispatch(jumpToAim(seriesUID, aimID, index));
    } else {
      if (isGridFull) {
        this.props.dispatch(alertViewPortFull());
      } else {
        this.props.dispatch(addToGrid(selected, aimID));
        this.props
          .dispatch(getSingleSerie(selected, aimID))
          .then(() => {})
          .catch(err => console.log(err));
        //if grid is NOT full check if patient data exists
        if (!this.props.patients[patientID]) {
          this.props.dispatch(getWholeData(null, null, selected));
        } else {
          this.props.dispatch(
            updatePatient(
              "annotation",
              true,
              patientID,
              studyUID,
              seriesUID,
              aimID
            )
          );
        }
      }
    }
    this.props.dispatch(clearSelection());
    this.props.history.push("/display");
  };

  render() {
    const {
      toggleSelection,
      toggleAll,
      isSelected,
      logSelection,
      toggleType,
      onExpandedChange,
      toggleTree,
    } = this;
    const { data, columns, selectAll, selectType, expanded } = this.state;
    const extraProps = {
      selectAll,
      isSelected,
      toggleAll,
      toggleSelection,
      selectType,
      expanded,
      onExpandedChange,
    };
    const TheadComponent = props => null;
    return (
      <div style={{ paddingLeft: "35px" }}>
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
                  this.displayAnnotations(rowInfo.original);
                },
              };
            }}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    series: state.searchViewReducer.series,
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    activePort: state.annotationsListReducer.activePort,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
  };
};

export default withRouter(connect(mapStateToProps)(Annotations));
