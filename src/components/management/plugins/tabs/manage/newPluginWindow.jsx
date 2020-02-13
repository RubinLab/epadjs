import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { Modal } from "react-bootstrap";
import { getTemplatesDataFromDb } from "../../../../../services/templateServices";
class NewPluginWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { allTemplates: props.allTemplates };
    //console.log("modal log templates", props.allTemplates);
  }

  state = {
    allTemplates: []
  };

  render() {
    const { onChange, error, pluginFormElements } = this.props;
    return (
      <Modal.Dialog className="create-plugin__modal">
        <Modal.Header>
          <Modal.Title>New Plugin</Modal.Title>
        </Modal.Header>
        <Modal.Body className="create-user__modal--body">
          <form className="add-project__modal--form">
            <h5 className="add-project__modal--label">Name*</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-project__modal--input"
              name="name"
              type="text"
              onChange={onChange}
              id="form-first-element"
              value={pluginFormElements.name}
            />
            <h5 className="add-project__modal--label">ID*</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-project__modal--input"
              name="id"
              type="text"
              value={pluginFormElements.id}
              onChange={onChange}
            />
            <h5 className="add-project__modal--label">Image*</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-project__modal--input"
              name="image"
              type="text"
              value={pluginFormElements.image}
              onChange={onChange}
            />
            <h5 className="add-project__modal--label">Description</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-project__modal--input"
              name="description"
              type="text"
              value={pluginFormElements.description}
              onChange={onChange}
            />
            <h5 className="add-project__modal--label">Enabled</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-project__modal--input"
              name="enabled"
              type="text"
              value={pluginFormElements.enabled}
              onChange={onChange}
            />
            <h5 className="add-project__modal--label">Modality</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-project__modal--input"
              name="modality"
              type="text"
              value={pluginFormElements.modality}
              onChange={onChange}
            />
            <h5 className="add-project__modal--label">Developer</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-project__modal--input"
              name="developer"
              type="text"
              value={pluginFormElements.developer}
              onChange={onChange}
            />
            <h5 className="add-project__modal--label">Documentation</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-project__modal--input"
              name="documentation"
              type="text"
              value={pluginFormElements.documentation}
              onChange={onChange}
            />

            <h5 className="form-exp required">*Required</h5>
            {error && <div className="err-message">{error}</div>}
          </form>
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
    );
  }
}

export default NewPluginWindow;
PropTypes.NewPluginWindow = {
  //onSelect: PropTypes.func,
  onCancel: PropTypes.func,
  onSave: PropTypes.func
};
