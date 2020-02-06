import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import ManualEditForm from "./manualEditForm";
import CopyFromEpad from "./copyFromEpad";
import "../searchView/searchView.css";
import "react-tabs/style/react-tabs.css";

class TagEditor extends React.Component {
  state = { tagValues: {} };
  handleTagInput = (e, tagName, tagValue) => {
    let name, value;
    if (e) {
      name = e.target.name;
      value = e.target.value;
    }
    if (name || value) {
      // handle empty name case
    } else if (tagName && tagValue) {
      const tags = { ...this.state.tagValues };
      tags[tagName] = tagValue;
      this.setState({ tagValues: tags });
    }
  };
  saveTags = () => {
    console.log("save tags clicked");
  };

  render = () => {
    return (
      <Tabs>
        <TabList>
          <Tab>Manual Edit</Tab>
          <Tab>Copy from ePad</Tab>
        </TabList>
        <TabPanel>
          <ManualEditForm
            requirements={this.props.requirements}
            treeData={this.props.treeData}
            onTagInput={this.handleTagInput}
            seriesIndex={this.props.seriesIndex}
            onSave={this.saveTags}
          />
        </TabPanel>
        <TabPanel>
          <CopyFromEpad
            requirements={this.props.requirements}
            treeData={this.props.treeData}
            onTagInput={this.handleTagInput}
            seriesIndex={this.props.seriesIndex}
            onSave={this.saveTags}
            requirementsObj={this.props.requirementsObj}
          />
        </TabPanel>
      </Tabs>
    );
  };
}

export default TagEditor;
