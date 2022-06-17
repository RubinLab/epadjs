import React, { Component } from "react";
import Draggable from "react-draggable";
import { getAimsOfSubject } from "../../services/subjectServices";
import { prepAimForParseClass } from "./Helpers";
import "./RecistTable.css";

class RecistTable extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  componentDidMount = async () => {
    const { projectId, subjectId } = this.props;
    const { data } = await getAimsOfSubject(projectId, subjectId);
    const targets = [];
    const nonTargets = [];
    Object.entries(data).forEach(([key, value]) => {
      if (value?.type?.toLowerCase().includes("non-target"))
        nonTargets.push({ name: key, json: value.aim });
      else if (value?.type?.toLowerCase().includes("target"))
        targets.push({ name: key, json: value.aim });
    });
    this.setState({ loading: false, targets, nonTargets });
  };

  handleClick = (aimJson, index) => {
    this.setState({ aimJson, selected: index });
  };

  handleSelect = () => {
    const { semanticAnswers } = this.props;
    const aim = this.state.aimJson;
    const parseClassAim = prepAimForParseClass(aim);
    semanticAnswers.loadAimJson(parseClassAim, true);
    this.props.onSelect(aim);
    this.props.onClose();
  };

  render() {
    const { loading, targets, nonTargets } = this.state;
    if (loading)
      return (
        <Draggable>
          <div>Loading</div>
        </Draggable>
      );
    else {
      // we need a linear index for the selected but we have two arrays for target and non-target
      // So we linearize the index by adding target array length to non-target index
      const indexOffset = targets.length;
      return (
        <Draggable>
          <div className="Table">
            <div className="close-recist-menu" onClick={this.props.onClose}>
              <a className="close-recist-menu" href="#">
                X
              </a>
            </div>
            <div className="Title">
              <p>Lesions</p>
            </div>
            <div className="Heading">
              <div className="Cell">
                <p>Target</p>
              </div>
              <div className="Cell">
                <p>Non Target</p>
              </div>
            </div>
            <div className="recist-row">
              <div className="Cell">
                {targets &&
                  targets.map((target, index) => (
                    <div
                      className={
                        this.state.selected === index
                          ? "target-selected"
                          : "target"
                      }
                      key={index}
                      onClick={() => this.handleClick(target.json, index)}
                    >
                      <p>{target.name}</p>
                    </div>
                  ))}
              </div>
              <div className="Cell">
                {nonTargets &&
                  nonTargets.map((nonTarget, index) => (
                    <div
                      className={
                        this.state.selected === index + indexOffset
                          ? "non-target-selected"
                          : "non-target"
                      }
                      key={index + indexOffset}
                      onClick={() =>
                        this.handleClick(nonTarget.json, index + indexOffset)
                      }
                    >
                      <p>{nonTarget.name}</p>
                    </div>
                  ))}
              </div>
            </div>
            <div className="recist-row">
              <div className="Cell">
                <button className="brush-presets" onClick={this.handleSelect}>
                  Select
                </button>
              </div>
              <div className="Cell">
                <button className="brush-presets" onClick={this.props.onClose}>
                  Cancel
                </button>

              </div>
            </div>
          </div>
        </Draggable>
      );
    }
  }
}

export default RecistTable;
