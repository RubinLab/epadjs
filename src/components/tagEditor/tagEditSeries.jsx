import React, { Component } from "react";
import ReactTable from "react-table";
import { FaCheck, FaEdit } from "react-icons/fa";

class TagEditSeries extends React.Component {
  state = {
    expanded: {}
  };
  trigger = () => {
    console.log("here");
  };
  render = () => {
    const columns = [
      {
        accessor: "seriesDesc"
      },
      {
        width: 80,
        accessor: "imageCount"
      },
      {
        width: 80,
        Cell: row => {
          const { patientID, studyUID, seriesUID } = row.original;
          return (
            <div>
              {row.original.tagRequired ? (
                <div
                  onClick={() =>
                    this.props.onEditClick(patientID, studyUID, seriesUID)
                  }
                  className="menu-clickable"
                >
                  <FaEdit />
                </div>
              ) : (
                <div>
                  <FaCheck />
                </div>
              )}
            </div>
          );
        }
      }
    ];

    console.log("series props", this.props);

    return (
      <div>
        <ReactTable
          data={this.props.series}
          columns={columns}
          pageSize={this.props.series.length}
          className="-striped -highlight"
          showPagination={false}
          expanded={this.state.expanded}
          onExpandedChange={(expanded, index, event) => {
            this.setState({ expanded });
          }}
        />
      </div>
    );
  };
}

export default TagEditSeries;
