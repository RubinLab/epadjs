import React from "react";
import ReactTable from "react-table";
import { getSeries } from "../../services/seriesServices";
import _ from "lodash";
// import { studyColumns } from "./columns";
import "./flexView.css";
import { clearToolOptionsByToolType } from "../../cornerstoneTools/toolOptions";

class Series extends React.Component {
  state = {
    columns: [],
    data: []
  };

  componentDidMount = async () => {
    this.defineColumns();
    //get series data
    const { data } = await getSeries(
      this.props.projectId,
      this.props.subjectId,
      this.props.studyId
    );
    console.log(data);
    this.setState({ data });
  };

  defineColumns = () => {
    const { order } = this.props;
    const tableColumns = [];
    for (let item of order) {
      tableColumns.push(this.props.studyColumns[item]);
    }
    this.setState({ columns: tableColumns });
  };

  componentDidUpdate = prevProps => {
    const columnAdded = prevProps.order.length !== this.props.order.length;
    const orderChanged = !_.isEqual(
      _.sortBy(prevProps.order),
      _.sortBy(this.props.order)
    );
    console.log(prevProps.order);
    console.log(this.props.order);
    console.log(columnAdded, orderChanged);
    if (columnAdded || orderChanged) {
      this.defineColumns();
    }
  };

  render = () => {
    return (
      <ReactTable
        NoDataComponent={() => null}
        className="flexView-table__sub"
        data={this.state.data}
        columns={this.state.columns}
        showPagination={false}
        TheadComponent={props => null}
        pageSize={this.state.data.length}
      />
    );
  };
}

export default Series;
