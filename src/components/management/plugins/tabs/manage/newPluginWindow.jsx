import React from "react";
import PropTypes from "prop-types";
import Popup from "../../common/Popup.jsx";
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
      <div className="create_plugin_container" id="newplugin">
        <Popup>
        <div className="create_plugin_modal">
          <div className="create_plugin_header">
            <div className="create_plugin_header">New Plugin</div>
          </div>
          <div className="create_plugin_modal_body">
            <table className="create_plugin_table">
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
                <tr>
                  <td>
                    <h5 className="form-exp required">*Required</h5>
                    {error && <div className="err-message">{error}</div>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="create_plugin_modal_footer">
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
          </div>
        </div>
        </Popup>
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
