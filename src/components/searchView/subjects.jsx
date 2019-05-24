import React, { Component } from "react";
import { connect } from "react-redux";
import ReactTable from "react-table";
import selectTableHOC from "react-table/lib/hoc/selectTable";
import treeTableHOC from "react-table/lib/hoc/treeTable";
import ReactTooltip from "react-tooltip";
import Chance from "chance";
import "react-table/react-table.css";
import Studies from "./studies";
import { getSubjects } from "../../services/subjectServices";
import { selectPatient, clearSelection } from "../annotationsList/action";

// const SelectTreeTable = selectTableHOC(treeTableHOC(ReactTable));
const TreeTable = treeTableHOC(ReactTable);
const chance = new Chance();
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

class Subjects extends Component {
  constructor(props) {
    super(props);
    this.widthUnit = 20;
    this.state = {
      pid: this.props.pid,
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
    } = await getSubjects(this.props.pid);
    this.setState({ data });
    this.setState({ columns: this.setColumns() });
  }

  incColumns = ["subjectName", "numberOfStudies"];
  getColumns(data) {
    const columns = [];
    const sample = data[0];
    for (let key in sample) {
      if (this.incColumns.includes(key)) {
        columns.push({
          accessor: key,
          Header: key,
          style: { whiteSpace: "normal" }
        });
      }
    }
    return columns;
  }

  selectRow = selected => {
    this.props.dispatch(clearSelection("patient"));
    this.props.dispatch(selectPatient(selected));
  };
  setColumns() {
    const columns = [
      {
        id: "searchView-checkbox",
        accessor: "",
        resizable: false,
        width: this.widthUnit,
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.props.selectedPatients[original.subjectID] || false}
              onChange={() => this.selectRow(original)}
            />
          );
        }
      },
      {
        Header: (
          <div className="search-header__col--left">Description/Name</div>
        ),
        width: this.widthUnit * 13,
        id: "searchView-desc__col",
        resizable: false,
        Cell: ({ original }) => {
          const desc = this.cleanCarets(original.subjectName);
          const id = "desc-tool" + original.subjectID;
          return (
            <>
              <div data-tip data-for={id}>
                {desc}
              </div>
              <ReactTooltip id={id} place="right" type="info" delayShow={500}>
                <span>{desc}</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        Header: (
          <div className="search-header__col badge-flex">
            <span> # of </span>
            <span> aims </span>
          </div>
        ),
        width: this.widthUnit * 2,
        id: "searchView-aims__col",
        resizable: false,
        Cell: row => (
          <div className="searchView-table__cell">
            {row.original.numberOfAnnotations === 0 ? (
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
        Header: (
          <div className="search-header__col badge-flex">
            <span># of </span>
            <span> sub </span>
          </div>
        ),
        width: this.widthUnit * 3,
        id: "searchView-sub__col",
        resizable: false,
        Cell: row => (
          <div className="searchView-table__cell">
            {row.original.numberOfStudies === 0 ? (
              ""
            ) : (
              <span className="badge badge-secondary">
                {row.original.numberOfStudies}
              </span>
            )}
          </div>
        )
      },
      {
        Header: (
          <div className="search-header__col badge-flex">
            <span> # of </span>
            <span> images </span>
          </div>
        ),
        width: this.widthUnit * 3,
        id: "searchView-img__col",
        resizable: false,
        // minResizeWidth: this.widthUnit * 3,
        Cell: row => <div />
      },
      {
        Header: <div className="search-header__col">Type</div>,
        width: this.widthUnit * 5,
        id: "searchView-type__col",
        resizable: false,
        // minResizeWidth: this.widthUnit * 5,
        Cell: row => <div />
      },
      {
        Header: <div className="search-header__col">Creation date</div>,
        width: this.widthUnit * 7,
        id: "searchView-crDate_col",
        resizable: false,
        // minResizeWidth: this.widthUnit * 10,
        Cell: row => <div />
      },
      {
        Header: <div className="search-header__col">Upload date</div>,
        width: this.widthUnit * 7,
        id: "searchView-upldDate_col",
        resizable: false,
        // minResizeWidth: this.widthUnit * 10,
        Cell: row => <div />
      },
      {
        Header: <div className="search-header__col">Accession</div>,
        width: this.widthUnit * 5,
        id: "searchView-access_col",
        resizable: false,
        // minResizeWidth: this.widthUnit * 4,
        Cell: row => <div />
      },
      {
        Header: <div className="search-header__col">Idenditifier</div>,
        width: this.widthUnit * 10,
        // minResizeWidth: this.widthUnit * 12,
        id: "searchView-UID_col",
        resizable: false,
        Cell: ({ original }) => {
          const id = "id-tool" + original.subjectID;
          return (
            <>
              <div className="searchView-table__cell" data-tip data-for={id}>
                {original.subjectID}
              </div>
              <ReactTooltip
                id={id}
                place="right"
                type="info"
                delayShow={500}
                clickable={true}
              >
                <span>{original.subjectID}</span>
              </ReactTooltip>
            </>
          );
        }
      }
    ];
    return columns;
  }

  cleanCarets(string) {
    var i = 0,
      length = string.length;
    for (i; i < length; i++) {
      string = string.replace("^", " ");
    }
    return string;
  }

  getData(projects) {
    console.log("Projects :" + this.projects);
    const data = projects.map(item => {
      // using chancejs to generate guid
      // shortid is probably better but seems to have performance issues
      // on codesandbox.io
      const _id = chance.guid();
      return {
        _id,
        ...item
      };
    });
    return data;
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
    const {
      data,
      columns,
      selectAll,
      selectType,
      pivotBy,
      expanded
    } = this.state;
    const extraProps = {
      selectAll,
      isSelected,
      toggleAll,
      toggleSelection,
      selectType,
      pivotBy,
      expanded,
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
            defaultPageSize={this.state.data.length}
            ref={r => (this.selectTable = r)}
            className="-striped -highlight"
            freezWhenExpanded={false}
            showPagination={false}
            // TheadComponent={TheadComponent}
            {...extraProps}
            SubComponent={row => {
              return (
                <div style={{ paddingLeft: 20 }}>
                  <Studies
                    projectId={this.props.pid}
                    subjectId={row.original.displaySubjectID}
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
    selectedPatients: state.annotationsListReducer.selectedPatients
  };
};
export default connect(mapStateToProps)(Subjects);
