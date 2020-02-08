import React from "react";
import ReactTable from "react-table";
import { FaRegTrashAlt } from "react-icons/fa";
import { getDockerImages } from "../../../services/pluginServices";
class TriggerTab extends React.Component {
  state = {
    plImages: {},
    plContainers: {},
    selected: [],
    selectAll: 0
  };

  componentDidMount = async () => {
    const tempPlImages = await getDockerImages();
    this.setState({ plImages: tempPlImages });
  };
  handleSelectRow = id => {};
  handleSelectAll = () => {};
  handleDeleteOne = rowdata => {};
  //   defineTriggerTabColumns = () => {
  //     return [
  //       {
  //         id: "checkbox",
  //         accessor: "",
  //         width: 50,
  //         Cell: ({ original }) => {
  //           const { id } = original;
  //           return (
  //             <input
  //               type="checkbox"
  //               className="checkbox-cell"
  //               checked={this.state.selected[id]}
  //               onChange={() => this.handleSelectRow(id)}
  //             />
  //           );
  //         },
  //         Header: x => {
  //           return (
  //             <input
  //               type="checkbox"
  //               className="checkbox-cell"
  //               checked={this.state.selectAll === 1}
  //               ref={input => {
  //                 if (input) {
  //                   input.indeterminate = this.state.selectAll === 2;
  //                 }
  //               }}
  //               onChange={() => this.handleSelectAll()}
  //             />
  //           );
  //         },
  //         // sortable: false,
  //         resizable: false
  //         // minResizeWidth: 20
  //         // maxWidth: 45
  //       },
  //       {
  //         Header: "Name",
  //         accessor: "name",
  //         sortable: true,
  //         resizable: true,
  //         minResizeWidth: 100,
  //         width: 420
  //       },
  //       /*{
  //         Header: "container image",
  //         accessor: "container_image",
  //         sortable: true,
  //         resizable: true,
  //         minResizeWidth: 100,
  //         width: 420
  //       },*/
  //       {
  //         Header: "",
  //         Cell: original => {
  //           const rowdata = original.row.checkbox;
  //           return (
  //             <div onClick={() => this.handleDeleteOne(rowdata)}>
  //               <FaRegTrashAlt className="menu-clickable" />
  //             </div>
  //           );
  //         }
  //       }
  //     ];
  //   };
  defineTriggerTabColumns = () => {
    return [
      {
        Header: "Name",

        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 420
      },
      {
        Header: "Name",

        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 420
      }
      /*{
        Header: "container image",
        accessor: "container_image",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 420
      },*/
    ];
  };
  render() {
    // const data = this.state.plImages;
    // const pageSize = data.length < 10 ? 10 : data.length >= 40 ? 50 : 20;
    // return (
    //   <ReactTable
    //     className="pro-table"
    //     data={data}
    //     columns={this.defineTriggerTabColumns()}
    //     pageSizeOptions={[10, 20, 50]}
    //     defaultPageSize={pageSize}
    //   />
    // );
    return <div>cavit</div>;
  }
}

export default TriggerTab;
