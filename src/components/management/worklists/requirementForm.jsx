import React from 'react';
import { getTemplatesUniversal } from '../../../services/templateServices';

class RequirementForm extends React.Component {
  state = {
    templates: {},
    error: null,
    level: null,
    numOfAims: null,
    template: null
  };

  componentDidMount = async () => {
    try {
      const { data } = await getTemplatesUniversal();
      const templates = {};
      data.forEach((el, i) => {
        templates[el.Template[0].templateUID] =
          el.Template[0].templateCodeValue;
      });
      this.setState({ templates });
    } catch (err) {
      console.log(err);
    }
  };

  renderOptions = (arr, field) => {
    const firstItem = <option key="first">{`--- Select ${field} ---`}</option>;
    const options = [firstItem];
    if (field === 'Template') {
      options.push(<option key="any">{'Any'}</option>);
    }
    arr.forEach((el, i) => {
      options.push(<option key={`${el}-${i}`}>{el}</option>);
    });
    return options;
  };

  render = () => {
    const { error } = this.state;
    const levels = ['Patient', 'Study', 'Series', 'Image'];
    return (
      <>
        <div className="worklist-requirementForm">
          <div>
            <select
              onMouseDown={e => e.stopPropagation()}
              className="__field"
              name="level"
              onChange={this.props.onNewReqInfo}
            >
              {this.renderOptions(levels, 'Level')}
            </select>
          </div>
          <div>
            <select
              onMouseDown={e => e.stopPropagation()}
              className="__field"
              name="template"
              onChange={this.props.onNewReqInfo}
            >
              {this.renderOptions(
                Object.values(this.state.templates),
                'Template'
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
              onChange={this.props.onNewReqInfo}
            />
          </div>
          {/* <div>
            <button className="__field" onClick={this.handleAddRequirement}>
              Add Requirement
            </button>
          </div> */}
        </div>
      </>
    );
  };
}

export default RequirementForm;
