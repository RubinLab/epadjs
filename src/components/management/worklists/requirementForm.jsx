import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { FaCheck, FaTrashAlt } from "react-icons/fa";
import { getAllTemplates } from "../../../services/templateServices";

// accept only integers for aims field
class RequirementForm extends React.Component {
  state = {
    templates: {},
    error: null,
    level: null,
    numOfAims: null,
    template: null
  };

  componentDidMount = async () => {
    const { data } = await getAllTemplates();
    const templates = {};

    data.forEach((el, i) => {
      templates[el.TemplateContainer.Template[0].uid] =
        el.TemplateContainer.Template[0].codeValue;
    });
    this.setState({ templates });
  };

  renderOptions = (arr, field) => {
    const firstItem = <option key="first">{`--- Select ${field} ---`}</option>;
    const options = [firstItem];
    if (field === "Template") {
      options.push(<option key="any">{"Any"}</option>);
    }
    arr.forEach((el, i) => {
      options.push(<option key={`${el}-${i}`}>{el}</option>);
    });
    return options;
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    if (name === "numOfAims" && !isNaN(parseInt(value))) {
      this.setState({ error: null });
    }
    this.setState({ [name]: value });
  };

  handleAddRequirement = () => {
    const { level, numOfAims, template } = this.state;
    const unselectedLevel = !level || level === `--- Select Level ---`;
    const unSelectedTemplate =
      !template || template === "--- Select Template ---";
    if (unselectedLevel || unSelectedTemplate || numOfAims === null) {
      this.setState({ error: "Please fill all fields!" });
      return;
    }
    if (isNaN(parseInt(this.state.numOfAims))) {
      this.setState({ error: "No of aims should be a number!" });
      return;
    }
    this.setState({ error: null });

    const newRequirements = [...this.props.requirements];
    newRequirements.push({ level, numOfAims, template });
    this.props.onAddRequirement(newRequirements);
  };

  // setColumns = () => {
  //   return [
  //     {
  //       Header: "Level",
  //       width: 70,
  //       accessor: "level"
  //     },
  //     {
  //       Header: "Template",
  //       accessor: "template"
  //     },
  //     {
  //       Header: "Aims",
  //       width: 40,
  //       accessor: "numOfAims"
  //     },
  //     //   {
  //     //     Header: "Required",
  //     //     width: 70,
  //     //     Cell: row => <div>{row.original.required ? <FaCheck /> : null}</div>
  //     //   },
  //     {
  //       Header: "",
  //       width: 20,
  //       Cell: row => (
  //         <div
  //           className="menu-clickable"
  //           onClick={() => {
  //             this.props.deleteRequirement(row.index);
  //           }}
  //         >
  //           <FaTrashAlt />
  //         </div>
  //       )
  //     }
  //   ];
  // };

  render = () => {
    const { error } = this.state;
    const levels = ["Patient", "Study", "Series", "Image"];
    return (
      <>
        <div className="worklist-requirementForm">
          <div>
            <select
              className="__field"
              name="level"
              onChange={this.handleFormInput}
            >
              {this.renderOptions(levels, "Level")}
            </select>
          </div>
          <div>
            <select
              className="__field"
              name="template"
              onChange={this.handleFormInput}
            >
              {this.renderOptions(
                Object.values(this.state.templates),
                "Template"
              )}
            </select>
          </div>
          <div>
            <input
              className="__field"
              type="text"
              name="numOfAims"
              placeholder="No of aims"
              onMouseDown={e => e.stopPropagation()}
              onChange={this.handleFormInput}
            />
          </div>
          {/* <div>
            <button className="__field" onClick={this.handleAddRequirement}>
              Add Requirement
            </button>
          </div> */}
        </div>
        {error ? <div className="err-message __field">{error}</div> : null}

        {/* {this.props.requirements.length > 0 && (
          <ReactTable
            NoDataComponent={() => null}
            data={this.props.requirements}
            columns={this.setColumns()}
            pageSize={this.props.requirements.length}
            showPagination={false}
          />
        )} */}
      </>
    );
  };
}

export default RequirementForm;
