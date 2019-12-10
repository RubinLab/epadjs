import React, { Component } from "react";
import ReactTable from "react-table";
// import treeTableHOC from "react-table/lib/hoc/treeTable";
import TagEditStudy from "./tagEditStudy";
// const TreeTable = treeTableHOC(ReactTable);

class TagEditTree extends React.Component {
  state = {
    expanded: {}
  };
  onExpandedChange = (newExpanded, index, event) => {
    this.setState({ expanded: newExpanded });
  };
  render = () => {
    const data = Object.values(this.props.dataset);
    const columns = [
      {
        Header: "Name/Description",
        id: "tagEditTree-desc",
        resizable: true,
        accessor: "patientName"
      },
      {
        Header: "# of img",
        id: "tagEditTree-imgCount",
        resizable: true,
        width: 80
      },
      {
        Header: "Tag Editor",
        id: "tagEditTree-tagEditor",
        resizable: true,
        width: 80
      }
    ];

    return (
      <div>
        <ReactTable
          data={data}
          columns={columns}
          pageSize={data.length}
          className="-striped -highlight"
          showPagination={false}
          expanded={this.state.expanded}
          onExpandedChange={this.onExpandedChange}
          SubComponent={row => {
            const studies = Object.values(row.original.studies);
            return (
              <div style={{ paddingLeft: 20 }}>
                <TagEditStudy
                  studies={studies}
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

export default TagEditTree;
