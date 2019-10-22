import React from "react";
import ReactTable from "react-table";
import treeTableHOC from "react-table/lib/hoc/treeTable";
import _ from "lodash";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { getStudies } from "../../services/projectServices";
import { studyColumns } from "./columns";
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
        let newOrder = [...this.state.order];
        newOrder.splice(i, 0, newOrder.splice(this.draggedCol, 1)[0]);
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
    console.log("studies");
    console.log(studies);
    this.setState({ data: studies });
  };

  componentWillUnmount = () => {};

  defineColumns = () => {
    const { order } = this.state;
    const tableColumns = [];
    for (let item of order) {
      tableColumns.push(studyColumns[item]);
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
                <Series data={this.state.data} order={this.state.order} />
              </div>
            );
          }}
        />
      </div>
    );
  };
}

export default FlexView;
