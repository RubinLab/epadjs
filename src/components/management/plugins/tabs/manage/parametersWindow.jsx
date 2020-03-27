import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import ReactTable from "react-table";
class ParametersWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { allTemplates: props.allTemplates };
    //console.log("modal log templates", props.allTemplates);
  }

  state = {
    plugindbid: -1,
    addnew: false,
    allTemplates: []
  };

  showAddForm = () => {
    this.setState({ addnew: true });
  };

  closeAddForm = () => {
    this.setState({ addnew: false });
  };
  defineParametersTableColumns = () => {
    return [
      {
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70
      },
      {
        Header: "value",
        accessor: "default_value",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70
      },
      {
        Header: "format",
        accessor: "format",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70
      },
      {
        Header: "type",
        accessor: "type",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70
      },
      {
        Header: "prefix",
        accessor: "prefix",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70
      },
      {
        Header: "description",
        accessor: "description",
        sortable: true,
        resizable: true,
        minResizeWidth: 50,
        width: 70
      }
    ];
  };
  render() {
    const { onChange, error, parameterFormElements, data } = this.props;
    console.log("in render : ", data);
    return (
      <div className="tools menu-display" id="template">
        <Modal.Dialog className="create-plugin__modal">
          <Modal.Header>
            <Modal.Title>Paramaters</Modal.Title>
          </Modal.Header>
          <Modal.Body className="create-user__modal--body">
            {!this.state.addnew && (
              <ReactTable
                className="pro-table"
                data={this.props.data}
                columns={this.defineParametersTableColumns()}
                pageSizeOptions={[10, 20, 50]}
                defaultPageSize={10}
              />
            )}
            {this.state.addnew && (
              <div>
                <h5>add new parameter</h5>
                <form className="add-project__modal--form">
                  <h5 className="add-project__modal--label">Name*</h5>
                  <input
                    onMouseDown={e => e.stopPropagation()}
                    className="add-project__modal--input"
                    name="name"
                    type="text"
                    onChange={onChange}
                    id="form-first-element"
                    value={parameterFormElements.name}
                  />
                  <h5 className="add-project__modal--label">Default value*</h5>
                  <input
                    onMouseDown={e => e.stopPropagation()}
                    className="add-project__modal--input"
                    name="default_value"
                    type="text"
                    value={parameterFormElements.default_value}
                    onChange={onChange}
                  />
                  <h5 className="add-project__modal--label">Type*</h5>
                  <input
                    onMouseDown={e => e.stopPropagation()}
                    className="add-project__modal--input"
                    name="type"
                    type="text"
                    value={parameterFormElements.type}
                    onChange={onChange}
                  />
                  <h5 className="add-project__modal--label">Description*</h5>
                  <input
                    onMouseDown={e => e.stopPropagation()}
                    className="add-project__modal--input"
                    name="description"
                    type="text"
                    value={parameterFormElements.description}
                    onChange={onChange}
                  />

                  <h5 className="form-exp required">*Required</h5>
                  {error && <div className="err-message">{error}</div>}
                </form>
              </div>
            )}
          </Modal.Body>
          {this.state.addnew && (
            <Modal.Footer className="create-user__modal--footer">
              <div className="create-user__modal--buttons">
                <button
                  variant="primary"
                  className="btn btn-sm btn-outline-light"
                  onClick={this.props.onSave}
                >
                  add parameter
                </button>
                <button
                  variant="secondary"
                  className="btn btn-sm btn-outline-light"
                  onClick={this.closeAddForm}
                >
                  Close
                </button>
              </div>
            </Modal.Footer>
          )}
          {!this.state.addnew && (
            <Modal.Footer className="create-user__modal--footer">
              <div className="create-user__modal--buttons">
                <button
                  variant="primary"
                  className="btn btn-sm btn-outline-light"
                  onClick={this.showAddForm}
                >
                  add parameter
                </button>
                <button
                  variant="secondary"
                  className="btn btn-sm btn-outline-light"
                  onClick={this.props.onCancel}
                >
                  Close
                </button>
              </div>
            </Modal.Footer>
          )}
        </Modal.Dialog>
      </div>
    );
  }
}

export default ParametersWindow;
PropTypes.NewPluginWindow = {
  //onSelect: PropTypes.func,
  onCancel: PropTypes.func,
  onSave: PropTypes.func
};
