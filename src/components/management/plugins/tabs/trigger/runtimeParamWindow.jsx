import React from "react";
import { Modal } from "react-bootstrap";
import { getDefaultParameter } from "../../../../../services/pluginServices";
import "../../css/plugin.css";
class RunTimeParamWindow extends React.Component {
  state = {
    defaultParams: [],
    paramsValueByParantArryaIndice: new Map(),
  };
  componentDidMount = async () => {
    const tempDefaultParams = await getDefaultParameter(
      this.props.selectedPluginDbId
    );
    console.log("default params ", tempDefaultParams);
    this.setState({ defaultParams: tempDefaultParams.data });
  };

  handleInputChange = (e) => {
    const targetSelectObjValue = e.target.value;

    console.log("target.id ", e.target.id);
    console.log("target array index ", e.target.name);
    console.log("new input value", e.target.value);
    this.state.paramsValueByParantArryaIndice.set(
      e.target.name,
      e.target.value
    );
  };
  saveParams = () => {
    console.log("save clicked");
    const tempParamsList = this.state.defaultParams;
    this.state.paramsValueByParantArryaIndice.forEach(function (value, key) {
      console.log(key + " = " + value);
      tempParamsList[key].default_value = value;
      console.log(
        "this one will be updated in parent parameter list ",
        tempParamsList[key]
      );
    });
    this.props.onSave(tempParamsList);
  };
  showParams = () => {
    const html = [];

    const tempDefaultParams = this.state.defaultParams;
    console.log("tempdefaultPrms ", tempDefaultParams);

    let cnt = 0;
    for (let i = 0; i < tempDefaultParams.length; i++) {
      for (let [key, value] of Object.entries(tempDefaultParams[i])) {
        cnt = cnt + 1;
        if (key === "name" || key === "format" || key === "default_value") {
          html.push(
            <tr className="trRunTimeParams tdleft" key={cnt}>
              <td className="tdtrRunTimeParamsleft tdleft">{key}</td>
              <td className="trRunTimeParams tdleft"> {value}</td>
            </tr>
          );
        }
      }
      html.push(
        <tr key={cnt}>
          <td className="tdleft">new value</td>
          <td className="tdleft">
            <input
              className="paramsInput"
              id={tempDefaultParams[i].paramid}
              name={i}
              type="text"
              onChange={this.handleInputChange}
            />
          </td>
        </tr>
      );
      cnt = cnt + 1;
      html.push(
        <tr key={cnt} className="trseperator">
          <td className="trseperator" colSpan="2"></td>
        </tr>
      );
    }

    return html;
  };
  render() {
    return (
      <div className="plugin_runtime_params_window_container" id="template">
        <div className="plugin_runtime_params_modal">
          <div className="plugin_runtime_params_header">
            <div className="tableHeaderRunTimeParams">
              Set Parameters For Runtime
            </div>
          </div>
          <div className="plugin_runtime_params_modal_body">
            <table className="tableRunTimeParams">
              <tbody>{this.showParams()}</tbody>
            </table>
          </div>

          <div className="plugin_runtime_params_modal_footer">
            <div className="create-user__modal--buttons">
              <button
                variant="primary"
                className="btn btn-sm btn-outline-light"
                onClick={this.saveParams}
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
      </div>
    );
  }
}

export default RunTimeParamWindow;
