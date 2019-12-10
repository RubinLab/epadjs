import React, { Component } from "react";
import ReactTable from "react-table";
import TagEditSeries from "./tagEditSeries";

class TagEditStudy extends React.Component {
  state = {
    expanded: {}
  };
  onExpandedChange = (newExpanded, index, event) => {
    this.setState({ expanded: newExpanded });
  };
  render = () => {
    const columns = [
      {
        accessor: "studyDesc"
      },
      { width: 80 },
      { width: 80 }
    ];
    console.log("study props", this.props);

    return (
      <div>
        <ReactTable
          data={this.props.studies}
          columns={columns}
          pageSize={this.props.studies.length}
          className="-striped -highlight"
          showPagination={false}
          expanded={this.state.expanded}
          onExpandedChange={this.onExpandedChange}
          SubComponent={row => {
            console.log(row.original);
            const series = Object.values(row.original.series);
            console.log(series);
            return (
              <div style={{ paddingLeft: 20 }}>
                <TagEditSeries
                  series={series}
                  onEditClick={this.props.onEditClick}
                />
              </div>
            );
          }}
        />
      </div>
    );
  };
}

export default TagEditStudy;
