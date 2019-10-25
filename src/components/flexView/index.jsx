import React from "react";
import ReactTable from "react-table";
import treeTableHOC from "react-table/lib/hoc/treeTable";
import _ from "lodash";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { getStudies } from "../../services/projectServices";
// import { studyColumns } from "./columns";
import DropDownMenu from "./dropdownMenu";
import Series from "./series";
import "./flexView.css";

const TreeTable = treeTableHOC(ReactTable);

class FlexView extends React.Component {
  state = {
    columns: [],
    order: [5, 0, 1, 2, 7],
    dropdownSelected: false,
    expanded: {}
  };

  clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string;
    }
  };
  studyColumns = [
    {
      Header: "Exam",
      sortable: false,
      show: true,
      Cell: row => {
        return Array.isArray(row.original.examTypes) ? (
          <div>{row.original.examTypes.join(" ,")}</div>
        ) : (
          <div>{row.original.examType}</div>
        );
      }
    },
    {
      Header: "Patient",
      // accessor: "patientName",
      sortable: true,
      show: true,
      Cell: row => {
        return <div>{this.clearCarets(row.original.patientName)}</div>;
      }
    },
    { Header: "PatientID", accessor: "patientID", sortable: true, show: true },
    { Header: "Sex", accessor: "sex", sortable: true, show: true },
    {
      Header: "Description",
      // accessor: "seriesDescription" || "studyDescription",
      sortable: true,
      show: true,
      Cell: row => {
        let desc = row.original.seriesUID
          ? row.original.seriesDescription
          : row.original.studyDescription;
        if (!desc) {
          desc = row.original.seriesUID ? "Unnamed Series" : "Unnamed Study";
        }
        return <div>{desc}</div>;
      }
    },
    {
      Header: "Insert Date",
      accessor: "insertDate",
      sortable: true,
      show: true
    },
    { Header: "Study Date", accessor: "studyDate", sortable: true, show: true },
    { Header: "Study Time", accessor: "studyTime", sortable: true, show: true },
    {
      Header: "UID",
      // accessor: "seriesUID" || "studyUID",
      sortable: true,
      show: true,
      Cell: row => {
        const UID = row.original.seriesUID
          ? row.original.seriesUID
          : row.original.studyUID;

        return <div>{UID}</div>;
      }
    },
    {
      Header: "# of Aims",
      accessor: "numberOfAnnotations",
      sortable: true,
      show: true
    },
    {
      Header: "# Of Img",
      accessor: "numberOfImages",
      sortable: true,
      show: true
    },
    {
      Header: "# Of Series",
      accessor: "numberOfSeries",
      sortable: true,
      show: true
    },
    {
      Header: "created Time",
      accessor: "createdTime",
      sortable: true,
      show: true
    },
    {
      Header: "birth date",
      accessor: "birthdate",
      sortable: true,
      show: true
    }
  ];

  mountEvents = () => {
    let headers = Array.prototype.slice.call(
      document.querySelectorAll(".rt-th")
    );
    headers.shift();
    headers.forEach((header, i) => {
      header.setAttribute("draggable", true);
      header.ondrag = e => e.stopPropagation();
      header.ondragend = e => e.stopPropagation();
      header.ondragover = e => e.preventDefault();

      header.ondragstart = e => {
        e.stopPropagation();
        this.draggedCol = i;
        // Firefox needs this to get draggin workin
        // See https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations
        e.dataTransfer.setData("text", "fix firefox dragevents");
      };

      header.ondrop = async e => {
        e.preventDefault();
        // Remove item from array and stick it in a new position.
        console.log("i");
        console.log(i);
        let newOrder = [...this.state.order];
        newOrder.splice(i, 0, newOrder.splice(this.draggedCol, 1)[0]);
        console.log("neworder");
        console.log(newOrder);
        await this.setState({ order: newOrder });
        this.defineColumns();
        this.mountEvents();
      };
    });
  };

  componentDidMount = async () => {
    await this.getData();
    await this.defineColumns();
    this.mountEvents();
  };

  componentDidUpdate = async prevProps => {
    if (prevProps.match.params.pid !== this.props.match.params.pid) {
      await this.getData();
      await this.defineColumns();
    }
  };
  getData = async () => {
    const { data: studies } = await getStudies(this.props.match.params.pid);
    this.setState({ data: studies });
  };

  componentWillUnmount = () => {};

  defineColumns = () => {
    const { order } = this.state;
    const tableColumns = [];
    for (let item of order) {
      tableColumns.push(this.studyColumns[item]);
    }
    this.setState({ columns: tableColumns });
  };

  selectDropdown = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState(state => ({ dropdownSelected: !state.dropdownSelected }));
  };

  toggleColumn = async e => {
    const index = this.state.order.findIndex(
      i => i === parseInt(e.target.value)
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
    const { dropdownSelected, order } = this.state;
    console.log("-----order");
    console.log(order);
    return (
      <div className="flexView">
        <Button
          onClick={this.selectDropdown}
          variant="outline-dark"
          id="flexMenu-button"
        >
          {" "}
          Select columns
        </Button>
        {dropdownSelected ? (
          <DropDownMenu
            selected={dropdownSelected}
            order={order}
            onChecked={this.toggleColumn}
            studyColumns={this.studyColumns}
          />
        ) : null}
        <TreeTable
          NoDataComponent={() => null}
          className="flexView-table"
          data={this.state.data}
          columns={this.state.columns}
          showPagination={false}
          pageSize={this.state.columns.length}
          expanded={this.state.expanded}
          onExpandedChange={this.handleExpand}
          SubComponent={row => {
            return (
              <div style={{ paddingLeft: 40 }}>
                <Series
                  // data={this.state.data}
                  order={this.state.order}
                  projectId={row.original.projectID}
                  subjectId={row.original.patientID}
                  studyId={row.original.studyUID}
                  studyColumns={this.studyColumns}
                />
              </div>
            );
          }}
        />
      </div>
    );
  };
}

export default FlexView;
