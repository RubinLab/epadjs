import React from "react";
import { connect } from "react-redux";
// import Collapse from "react-bootstrap/Collapse";
import Annotations from "./annotations";
import { updateAnnotation, toggleAllAnnotations } from "../action";

//single serie will be passed
class ListItem extends React.Component {
  state = { isOpen: false, collapseAnnList: false, showAnnotations: true };

  componentDidMount = () => {
    this.setState({
      isOpen: this.props.serie.isDisplayed,
      collapseAnnList: this.props.serie.isDisplayed
    });
  };

  handleCollapse = () => {
    this.setState(state => ({ collapseAnnList: !state.collapseAnnList }));
  };

  handleAnnotationClick = e => {
    const { seriesUID, studyUID } = this.props.serie;
    const { value, checked } = e.target;
    this.props.dispatch(updateAnnotation(seriesUID, studyUID, value, checked));
  };

  handleToggleSerie = e => {
    const { seriesUID, studyUID } = this.props.serie;
    //if isOpen
    if (this.state.isOpen) {
      this.props.dispatch(
        toggleAllAnnotations(seriesUID, studyUID, e.target.checked)
      );
      this.setState(state => ({ showAnnotations: !state.showAnnotations }));
    } else {
    }
    //dispatch yap ve o serie icin viewport ac openSeriese ekle
  };

  render = () => {
    const { seriesDescription, seriesUID, studyUID } = this.props.serie;
    console.log();
    return (
      <div className="-serieButton__container">
        <div className="annList-serieButton">
          <div className="-serieButton__checkbox-container">
            <input
              className="-serieButton__checkbox"
              type="checkbox"
              name="serieButton"
              value={seriesUID}
              onChange={this.handleToggleSerie}
              checked={this.state.showAnnotations}
            />
          </div>
          <div className="-serieButton__value" onClick={this.handleCollapse}>
            {seriesDescription}
          </div>
        </div>
        {this.state.collapseAnnList && (
          <Annotations handleCheck={this.handleAnnotationClick} />
        )}
      </div>
    );
  };
}

export default connect()(ListItem);
