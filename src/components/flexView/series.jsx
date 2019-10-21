import React from "react";
import ReactTable from "react-table";
import _ from "lodash";
import { studyColumns } from "./columns";
import "./flexView.css";
import { clearToolOptionsByToolType } from "../../cornerstoneTools/toolOptions";

class Series extends React.Component {
  state = {
    columns: []
  };

  componentDidMount = () => {
    this.defineColumns();
  };

  defineColumns = () => {
    const { order } = this.props;
    const tableColumns = [];
    for (let item of order) {
      tableColumns.push(studyColumns[item]);
    }
    this.setState({ columns: tableColumns });
  };

  componentDidUpdate = prevProps => {
    if (prevProps.order.length !== this.props.order.length) {
      this.defineColumns();
    }
  };

  render = () => {
    return (
      <ReactTable
        className="flexView-table__sub"
        data={this.props.data}
        columns={this.state.columns}
        showPagination={false}
        TheadComponent={props => null}
        pageSize={this.props.data.length}
      />
    );
  };
}

export default Series;
