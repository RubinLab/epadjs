import React, { Component } from "react";
import Table from "react-table-v6";
import { FaExclamationTriangle, FaCheck, FaEdit } from "react-icons/fa";

class TagEditTable extends React.Component {
  state = {
    expanded: {},
  };

  render = () => {
    const data = Object.values(this.props.dataset);

    const columns = [
      {
        Header: "Patient",
        id: "tagEditTree-patient",
        resizable: true,
        accessor: "PatientName",
      },
      {
        Header: "Study",
        id: "tagEditTree-study",
        resizable: true,
        accessor: "StudyDescription",
      },
      {
        Header: "Series",
        id: "tagEditTree-series",
        resizable: true,
        accessor: "SeriesDescription",
      },
      {
        Header: "# of img",
        id: "tagEditTree-imgCount",
        resizable: true,
        accessor: "imageCount",
      },
      {
        Header: "Required Tags",
        id: "tagEditTree-icon",
        resizable: true,
        Cell: row => {
          const { patientID, studyUID, seriesUID } = row.original;
          return (
            <div className="tagEditTree-icon">
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
                >
                  <FaExclamationTriangle className="--warnning" />
                </div>
              ) : (
                <div>
                  <FaCheck className="--check" />
                </div>
              )}
            </div>
          );
        },
      },
      {
        Header: "Edit tags",
        id: "tagEditTree-tagEditor",
        resizable: true,
        resizable: true,
        width: 80,
        Cell: row => {
          const { patientID, studyUID, seriesUID } = row.original;
          return (
            <div
              onClick={() =>
                this.props.onEditClick(
                  row.index,
                  patientID,
                  studyUID,
                  seriesUID
                )
              }
              className="menu-clickable tagEditTree-tagEditor"
            >
              <FaEdit />
            </div>
          );
        },
      },
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
