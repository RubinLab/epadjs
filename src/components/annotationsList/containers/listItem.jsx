import React from "react";
import { connect } from "react-redux";
// import Collapse from "react-bootstrap/Collapse";
import { FaMinus, FaPlus } from "react-icons/fa";
import Annotations from "./annotations";
import { updateAnnotation } from "../action";

//single serie will be passed
class ListItem extends React.Component {
  state = { isOpen: false };

  componentDidMount = () => {
    console.log("serie?", this.props.serie);
    this.setState({ isOpen: this.props.serie.isDisplayed });
  };

  handleCollapse = () => {
    this.setState(state => ({ isOpen: !state.isOpen }));
  };

  handleCheckboxClick = e => {
    const { seriesUID } = this.props.serie;
    const { value, checked } = e.target;
    console.log(value, checked);
    updateAnnotation(seriesUID);
  };

  render = () => {
    const { seriesDescription } = this.props.serie;
    return (
      <div className="-serieButton__container">
        <button className="annList-serieButton">
          {this.state.isOpen ? (
            <FaMinus
              className="-serieButton__icon"
              onClick={this.handleCollapse}
            />
          ) : (
            <FaPlus
              className="-serieButton__icon"
              onClick={this.handleCollapse}
            />
          )}
          <span className="-serieButton__value">{seriesDescription}</span>
        </button>
        {this.state.isOpen && (
          <Annotations
            annotations={this.props.serie.annotations}
            handleCheck={this.handleCheckboxClick}
          />
        )}
      </div>
    );
  };
}

export default connect()(ListItem);
