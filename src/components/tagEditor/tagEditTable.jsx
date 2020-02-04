import React, { Component } from "react";
import Table from "react-table";
import { FaCheck, FaEdit } from "react-icons/fa";

class TagEditTable extends React.Component {
  state = {
    expanded: {}
  };

  render = () => {
    const data = Object.values(this.props.dataset);

    const columns = [
      {
        Header: "Patient",
        id: "tagEditTree-patient",
        resizable: true,
        accessor: "patientName"
      },
      {
        Header: "Study",
        resizable: true,
        id: "tagEditTree-study",
        accessor: "studyDesc"
      },
      {
        Header: "Series",
        resizable: true,
        id: "tagEditTree-series",
        accessor: "seriesDesc"
      },
      {
        Header: "# of img",
        resizable: true,
        id: "tagEditTree-imgCount",
        resizable: true,
        accessor: "imageCount"
      },
      {
        Header: "Tag Editor",
        resizable: true,
        id: "tagEditTree-tagEditor",
        resizable: true,
        width: 80,
        Cell: row => {
          const { patientID, studyUID, seriesUID } = row.original;
          return (
            <div>
              {row.original.missingTags.length > 0 ? (
                <div
                  onClick={() =>
                    this.props.onEditClick(
                      row.index,
                      patientID,
                      studyUID,
                      seriesUID
                    )
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

    return (
      <div>
        <Table
          data={data}
          columns={columns}
          pageSize={data.length}
          showPagination={false}
          // style={{ height: "-webkit-fill-available" }}
        />
      </div>
    );
  };
}

export default TagEditTable;
