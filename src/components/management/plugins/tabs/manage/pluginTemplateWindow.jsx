import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { getTemplatesDataFromDb } from "../../../../../services/templateServices";
import ParametersForTemplateWindow from "./parametersForTemplateWindow";
class PluginTemplateWindow extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    allTemplates: [],
    showparamswindow: false,
    pluginid: null,
    templateid: null,
  };
  handleShowParamatersWindow = (templateid, seldata) => {
    console.log(" project id :", templateid);
    console.log(" pluginid", seldata.original.id);
    this.setState({
      showparamswindow: true,
      pluginid: seldata.original.id,
      templateid: templateid,
    });
  };
  handleParameterCancel = () => {
    this.setState({ showparamswindow: false });
  };
  populateRows = () => {
    let rows = [];

    this.props.allTemplates.forEach((template) => {
      //console.log("template modal ---->>>>>> ", template);
      rows.push(
        <tr key={template.id} className="edit-userRole__table--row">
          <td>
            <input
              type="checkbox"
              value={template.id}
              name={template.id}
              defaultChecked={
                template.id ===
                this.props.selectedTemplateAsMap.get(template.id)
              }
              onChange={() => {
                this.props.onChange(template.id, this.props.tableSelectedData);
              }}
            />
          </td>
          <td>{template.templateName}</td>
          <td>
            <div
              onClick={() => {
                this.handleShowParamatersWindow(
                  template.id,
                  this.props.tableSelectedData
                );
              }}
            >
              &nbsp; params
            </div>
          </td>
        </tr>
      );
    });
    return rows;
  };

  render() {
    return (
      <div>
        <Modal.Dialog dialogClassName="create-user__modal">
          <Modal.Header>
            <Modal.Title>Templates</Modal.Title>
          </Modal.Header>
          <Modal.Body className="create-user__modal --body">
            <table>
              <thead>
                <tr>
                  <th className="user-table__header--user">add/remove</th>
                  <th className="user-table__header">template</th>
                </tr>
              </thead>
              <tbody>{this.populateRows()}</tbody>
            </table>
          </Modal.Body>

          <Modal.Footer className="create-user__modal--footer">
            <div className="create-user__modal--buttons">
              <button
                variant="primary"
                className="btn btn-sm btn-outline-light"
                onClick={this.props.onSave}
              >
                Submit
              </button>
              <button
                variant="secondary"
                className="btn btn-sm btn-outline-light"
                onClick={this.props.onCancel}
              >
                Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
        {this.state.showparamswindow && (
          <ParametersForTemplateWindow
            onCancel={this.handleParameterCancel}
            onSave={this.handleDefaultParameterSave}
            plugindbid={this.state.pluginid}
            templatedbid={this.state.templateid}
          />
        )}
      </div>
    );
  }
}

export default PluginTemplateWindow;
PropTypes.projectTable = {
  //onSelect: PropTypes.func,
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
  allTemplates: PropTypes.Array,
  tableSelectedData: PropTypes.Array,
  selectedTemplateAsMap: PropTypes.Array,
};
