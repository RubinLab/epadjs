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
  render = () => {
    console.log(this.props);
    return (
      <Tabs>
        <TabList>
          <Tab>Manual Edit</Tab>
          <Tab>ePad</Tab>
        </TabList>
        <TabPanel>
          <ManualEditForm
            requirements={this.props.requirements}
            treeData={this.props.treeData}
            path={this.props.path}
            onTagInput={this.handleTagInput}
          />
        </TabPanel>
        <TabPanel>
          <CopyFromEpad
            requirements={this.props.requirements}
            treeData={this.props.treeData}
            path={this.props.path}
            onTagInput={this.handleTagInput}
          />
        </TabPanel>
      </Tabs>
    );
  };
}

export default TagEditor;
