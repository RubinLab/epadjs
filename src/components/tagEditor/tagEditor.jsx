import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import ManualEditForm from "./manualEditForm";
import CopyFromEpad from "./copyFromEpad";
import "../searchView/searchView.css";
import "react-tabs/style/react-tabs.css";

class TagEditor extends React.Component {
  state = { tagValues: {}, error: "" };
  handleTagInput = (e, tagName, tagValue) => {
    let name, value;
    if (e) {
      name = e.target.name;
      value = e.target.value;
      if (name || value) {
        if (!value) this.setState({ error: `Please fill the ${name}` });
        else {
          this.setState({ error: "" });
          this.storeTagValuePair(name, value);
        }
      }
    } else if (tagName && tagValue) {
      this.storeTagValuePair(tagName, tagValue);
    }
  };
  saveTags = () => {
    console.log("save tags clicked");
  };

  storeTagValuePair = (tagName, tagValue) => {
    const tags = { ...this.state.tagValues };
    tags[tagName] = tagValue;
    this.setState({ tagValues: tags });
  };

  render = () => {
    const { requirements, treeData, seriesIndex, requirementsObj } = this.props;
    
    return (
      <Tabs>
        <TabList>
          <Tab>Manual Edit</Tab>
          <Tab>Copy from ePad</Tab>
        </TabList>
        <TabPanel>
          <ManualEditForm
            requirements={requirements}
            treeData={treeData}
            onTagInput={this.handleTagInput}
            seriesIndex={seriesIndex}
            onSave={this.saveTags}
            tagValues={this.state.tagValues}
          />
        </TabPanel>
        <TabPanel>
          <CopyFromEpad
            requirements={requirements}
            treeData={treeData}
            onTagInput={this.handleTagInput}
            seriesIndex={seriesIndex}
            onSave={this.saveTags}
            requirementsObj={requirementsObj}
            tagValues={this.state.tagValues}
          />
        </TabPanel>
      </Tabs>
    );
  };
}

export default TagEditor;
