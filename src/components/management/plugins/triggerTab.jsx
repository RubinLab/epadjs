import React from "react";
import ReactTable from "react-table";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  getDockerImages,
  getAnnotationTemplates,
  getAnnotationProjects
} from "../../../services/pluginServices";
class TriggerTab extends React.Component {
  state = {
    plImages: {},
    plContainers: {},
    selectedTemplates: [],
    selectedProjects: [],
    selectedAnnotations: [],
    selectAll: 0,
    templates: [],
    projects: [],
    annotations: []
  };

  componentDidMount = async () => {
    //const tempPlImages = await getDockerImages();
    //this.setState({ plImages: tempPlImages });
    const tempTemplates = await getAnnotationTemplates();
    const tempProjects = await getAnnotationProjects();
    this.setState({ templates: tempTemplates.data });
    this.setState({ projects: tempProjects.data });
  };
  componentDidUpdate = () => {
    console.log("did update", this.state.projects);
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

  populateProjectRows = () => {
    let rows = [];

    this.state.projects.forEach(project => {
      //console.log("template modal ---->>>>>> ", template);
      rows.push(
        <tr key={project.id} className="edit-userRole__table--row">
          <td>
            <input
              type="checkbox"
              value={project.id}
              name={project.id}
              onChange={this.handleOnChange}
            />
          </td>
          <td>{project.name}</td>
        </tr>
      );
    });
    return rows;
  };
  populateTemplateRows = () => {
    let rows = [];

    this.state.templates.forEach(template => {
      //console.log("template modal ---->>>>>> ", template);
      rows.push(
        <tr key={template.id} className="edit-userRole__table--row">
          <td>
            <input
              type="checkbox"
              value={template.id}
              name={template.id}
              onChange={this.handleOnChange}
            />
          </td>
          <td>{template.templateName}</td>
        </tr>
      );
    });
    return rows;
  };

  handleProjectOnChange = () => {};
  handleTemplateOnChange = () => {};

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
    return (
      <div>
        <div className="create-user__modal--buttons">
          <button variant="primary" className="btn btn-sm btn-outline-light">
            Trigger
          </button>
          <button variant="secondary" className="btn btn-sm btn-outline-light">
            Clear
          </button>
        </div>

        <div className="row">
          <div className="column">
            <h2>Projects</h2>
            <table>
              <tbody>{this.populateProjectRows()}</tbody>
            </table>
          </div>
          <div className="column">
            <h2>Templates</h2>

            <table>
              <tbody>{this.populateTemplateRows()}</tbody>
            </table>
          </div>
          <div className="column">
            <h2>Annotations</h2>
          </div>
        </div>
      </div>
    );
  }
}

export default TriggerTab;
