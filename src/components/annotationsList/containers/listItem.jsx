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
    this.setState({ isOpen: this.props.serie.isDisplayed });
  };

  handleCollapse = () => {
    this.setState(state => ({ isOpen: !state.isOpen }));
  };

  handleCheckboxClick = e => {
    const { seriesUID, studyUID } = this.props.serie;
    const { value, checked } = e.target;
    this.props.dispatch(updateAnnotation(seriesUID, studyUID, value, checked));
  };

  render = () => {
    const { seriesDescription, seriesUID, studyUID } = this.props.serie;
    console.log();
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
          <Annotations handleCheck={this.handleCheckboxClick} />
        )}
      </div>
    );
  };
}

export default connect()(ListItem);
