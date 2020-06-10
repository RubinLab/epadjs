import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { Modal } from "react-bootstrap";
import { getTemplatesDataFromDb } from "../../../../../services/templateServices";
import "../../css/plugin.css";
class NewPluginWindow extends React.Component {
  constructor(props) {
    super(props);
  }
  prepareDropDownHtmlForPluginAimRequired = () => {
    let options = [];

    options.push(
      <option key="-1" name="AimRequired" value="">
        No Aim Required
      </option>
    );
    options.push(
      <option key="0" name="AimRequired" value="0">
        One Aim
      </option>
    );
    options.push(
      <option key="1" name="AimRequired" value="1">
        Multiple Aims
      </option>
    );
    return options;
  };
  render() {
    const { onChange, error, pluginFormElements } = this.props;
    return (
      <div className="tools menu-display" id="template">
        <Modal.Dialog className="create-plugin__modal">
          <Modal.Header>
            <Modal.Title>New Plugin</Modal.Title>
          </Modal.Header>
          <Modal.Body className="create-user__modal--body">
            <table className="t1">
              <tbody>
                <tr>
                  <td>
                    <h5 className="add-project__modal--label">Name*</h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="name"
                      type="text"
                      onChange={onChange}
                      id="form-first-element"
                      value={pluginFormElements.name}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="add-project__modal--label">ID*</h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="plugin_id"
                      type="text"
                      value={pluginFormElements.plugin_id}
                      onChange={onChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="add-project__modal--label">Image repo*</h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="image_repo"
                      type="text"
                      value={pluginFormElements.image_repo}
                      onChange={onChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="add-project__modal--label">Image tag*</h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="image_tag"
                      type="text"
                      value={pluginFormElements.image_tag}
                      onChange={onChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="add-project__modal--label">Image name</h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="image_name"
                      type="text"
                      value={pluginFormElements.image_name}
                      onChange={onChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="add-project__modal--label">Image id</h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="image_id"
                      type="text"
                      value={pluginFormElements.image_id}
                      onChange={onChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="add-project__modal--label">Description</h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="add-project__modal--input"
                      name="description"
                      type="text"
                      value={pluginFormElements.description}
                      onChange={onChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="add-project__modal--label">Enabled</h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      onMouseDown={(e) => e.stopPropagation()}
                      className="input_enabled"
                      name="enabled"
                      type="checkbox"
                      value={pluginFormElements.enabled}
                      onChange={onChange}
                      defaultChecked={true}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <h5 className="add-project__modal--label">
                      Annotation required
                    </h5>
                  </td>
                </tr>
                <tr>
                  <td>
                    <select
                      className="pluginaddqueueselect"
                      id="processmultipleaims"
                      name="processmultipleaims"
                      onChange={onChange}
                      onMouseDown={(e) => e.stopPropagation()}
                      value={pluginFormElements.processmultipleaims}
                    >
                      {this.prepareDropDownHtmlForPluginAimRequired()}
                    </select>
                  </td>
                </tr>

                {/* <h5 className="add-project__modal--label">Modality</h5>
              <input
                onMouseDown={(e) => e.stopPropagation()}
                className="add-project__modal--input"
                name="modality"
                type="text"
                value={pluginFormElements.modality}
                onChange={onChange}
              />
              <h5 className="add-project__modal--label">Developer</h5>
              <input
                onMouseDown={(e) => e.stopPropagation()}
                className="add-project__modal--input"
                name="developer"
                type="text"
                value={pluginFormElements.developer}
                onChange={onChange}
              />
              <h5 className="add-project__modal--label">Documentation</h5>
              <input
                onMouseDown={(e) => e.stopPropagation()}
                className="add-project__modal--input"
                name="documentation"
                type="text"
                value={pluginFormElements.documentation}
                onChange={onChange}
              /> */}

                <tr>
                  <td>
                    <h5 className="form-exp required">*Required</h5>
                    {error && <div className="err-message">{error}</div>}
                  </td>
                </tr>
              </tbody>
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
      </div>
    );
  }
}

export default NewPluginWindow;
PropTypes.NewPluginWindow = {
  //onSelect: PropTypes.func,
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
};
