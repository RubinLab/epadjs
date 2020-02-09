import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { getAllTemplates } from "../../../services/templateServices";

// accept only integers for aims field
class RequirementEditTable extends React.Component {
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
      templates[el.Template[0].templateUID] = el.Template[0].templateCodeValue;
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

  setColumns = () => {
    return [
      {
        Header: "Level",
        width: 70,
        accessor: "level"
      },
      {
        Header: "Template",
        accessor: "template"
      },
      {
        Header: "Aims",
        width: 40,
        accessor: "numOfAims"
      },
      //   {
      //     Header: "Required",
      //     width: 70,
      //     Cell: row => <div>{row.original.required ? <FaCheck /> : null}</div>
      //   },
      {
        Header: "",
        width: 20,
        Cell: row => (
          <div className="menu-clickable" onClick={() => {}}>
            <FaEdit />
          </div>
        )
      },
      {
        Header: "",
        width: 20,
        Cell: row => (
          <div
            className="menu-clickable"
            onClick={() => {
              this.props.deleteRequirement(row.index);
            }}
          >
            <FaTrashAlt />
          </div>
        )
      }
    ];
  };

  render = () => {
    const { error } = this.state;
    return (
      <>
        {this.props.requirements.length > 0 && (
          <ReactTable
            NoDataComponent={() => null}
            data={this.props.requirements}
            columns={this.setColumns()}
            pageSize={this.props.requirements.length}
            showPagination={false}
          />
        )}
      </>
    );
  };
}

export default RequirementEditTable;
