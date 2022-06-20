import React from "react";
import ReactTable from "react-table-v6";
import treeTableHOC from "react-table-v6/lib/hoc/treeTable";
import _ from "lodash";
import { Button } from "react-bootstrap";
import { getSeries } from "../../services/seriesServices";
import { getStudies } from "../../services/projectServices";
import ColumnSelect from "./ColumnSelect.jsx";
import StudyTable from "./StudyTable";
import SelectSerieModal from "../annotationsList/selectSerieModal";
import SeriesTable from "./SeriesTable";
import 'react-table-v6/react-table.css';
// import "../annotationSearch/annotationSearch.css";
// import "./flexView.css";

const TreeTable = treeTableHOC(ReactTable);
let mode;

class FlexView extends React.Component {
  mode = sessionStorage.getItem('mode');
  state = {
    columns: [],
    order: mode === 'teaching' ? [1, 8, 16, 4, 6, 9, 13, 3] : [1, 4, 0, 10, 11, 6],
    expanded: {},
    seriesTableOpen: false,
    series: [],
  };

  studyColumns = [
    "Exam",
    "Patient Name",
    "PatientID",
    "Sex",
    "Description",
    "Insert Date",
    "Study Date",
    "Study Time",
    "Study UID",
    "# of Aims",
    "# Of Img",
    "# Of Series",
    "Created Time",
    "Birth Date",
    "Project ID",
    "Referring Physician Name",
    `Study Accession Number`,
    "Study ID",
  ];

  mountEvents = () => {
    let headers = Array.prototype.slice.call(
      document.querySelectorAll(".rt-th.rt-resizable-header")
    );
    headers.forEach((header, i) => {
      header.setAttribute("draggable", true);
      header.ondrag = (e) => e.stopPropagation();
      header.ondragend = (e) => e.stopPropagation();
      header.ondragover = (e) => e.preventDefault();

      header.ondragstart = (e) => {
        e.stopPropagation();
        this.draggedCol = i;
        // Firefox needs this to get draggin workin
        // See https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations
        e.dataTransfer.setData("text", "fix firefox dragevents");
      };

      header.ondrop = async (e) => {
        e.preventDefault();
        // Remove item from array and stick it in a new position.

        let newOrder = [...this.state.order];
        newOrder.splice(i, 0, newOrder.splice(this.draggedCol, 1)[0]);
        await this.setState({ order: newOrder });
        this.defineColumns();
        this.mountEvents();
      };
    });
  };

  showSeriesTable = async (projectID, patientID, studyUID) => {
    try {
      const { data } = await getSeries(projectID, patientID, studyUID);
      this.setState({ showSeriesTable: true, series: data });
    } catch (err) {
      console.log(err);
    }
  };

  closeSeriesTable = () => {
    this.setState({ showSeriesTable: false, series: [] });
  };

  componentDidMount = async () => {
    const order = JSON.parse(sessionStorage.getItem('studyListColumns'));
    if (order && order.length)
      this.setState({ order });
    try {
      if (this.props.pid) {
        await this.getData(this.props.pid);
        await this.defineColumns();
        this.mountEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  componentDidUpdate = async (prevProps) => {
    console.log("Update", prevProps, this.props);
    try {
      if (prevProps.pid !== this.props.pid) {
        console.log("in the if");
        await this.getData(this.props.pid);
        await this.defineColumns();
      }
    } catch (err) {
      console.log(err);
    }
  };
  getData = async (pid) => {
    const { data: studies } = await getStudies(pid);
    this.setState({ data: studies });
  };

  componentWillUnmount = () => {
    sessionStorage.setItem('studyListColumns', JSON.stringify(this.state.order));
  };

  defineColumns = () => {
    const { order } = this.state;
    const tableColumns = [];
    for (let item of order) {
      tableColumns.push(this.studyColumns[item]);
    }
    this.setState({ columns: tableColumns });
  };

  // selectDropdown = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   this.setState((state) => ({ dropdownSelected: !state.dropdownSelected }));
  // };

  toggleColumn = async (e) => {
    const index = this.state.order.findIndex(
      (i) => i === parseInt(e.target.value)
    );
    let newOrder;
    if (index >= 0) {
      newOrder = this.state.order
        .slice(0, index)
        .concat(this.state.order.slice(index + 1));
    } else {
      newOrder = [...this.state.order];
      newOrder.push(parseInt(e.target.value));
    }
    await this.setState({ order: newOrder });
    this.defineColumns();
    this.mountEvents();
  };

  handleExpand = (newExpanded, index, event) => {
    this.setState({ expanded: newExpanded });
  };
  render = () => {
    const {
      order,
      data,
      series,
      showSeriesTable,
    } = this.state;
    return (
      <div className="flexView">
        {showSeriesTable && (
          // <SeriesTable series={series} onClose={this.closeSeriesTable} />
          <SelectSerieModal seriesPassed={[series]} onCancel={this.closeSeriesTable} />
        )}
        <ColumnSelect
          order={order}
          onChecked={this.toggleColumn}
          studyColumns={this.studyColumns}
          onClose={this.selectDropdown}
        />
        {this.state.data && (
          <StudyTable
            data={data}
            order={order}
            showSeriesTable={this.showSeriesTable}
          />
        )}
      </div>
    );
  };
}

export default FlexView;

// <TreeTable
//   NoDataComponent={() => null}
//   className="flexView-table"
//   data={this.state.data}
//   columns={this.state.columns}
//   showPagination={false}
//   pageSize={this.state.data.length}
//   expanded={this.state.expanded}
//   onExpandedChange={this.handleExpand}
//   onSortedChange={() => {
//     this.onSortedChange();
//   }}
//   SubComponent={row => {
//     return (
//       <div style={{ paddingLeft: 40 }}>
//         <Series
//           // data={this.state.data}
//           order={this.state.order}
//           projectId={row.original.projectID}
//           subjectId={row.original.patientID}
//           studyId={row.original.studyUID}
//           studyColumns={this.studyColumns}
//         />
//       </div>
//     );
//   }}
// />
