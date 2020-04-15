import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import ManualEditForm from "./manualEditForm";
import CopyFromEpad from "./copyFromEpad";
import TagEditorButton from "./tagEditorButton";
import "../searchView/searchView.css";
import "react-tabs/style/react-tabs.css";

const tagEditor = ({
  requirements,
  treeData,
  seriesIndex,
  requirementsObj,
  seriesArr,
  buttonClick,
  tagValues,
  handleTagInput,
}) => {
  return (
    <>
      <Tabs>
        <TabList>
          <Tab>Manual Edit</Tab>
          <Tab>Copy from ePad</Tab>
        </TabList>
        <TabPanel>
          <ManualEditForm
            requirements={requirements}
            treeData={treeData}
            onTagInput={handleTagInput}
            seriesIndex={seriesIndex}
            tagValues={tagValues}
            seriesArr={seriesArr}
          />
        </TabPanel>
        <TabPanel>
          <CopyFromEpad
            requirements={requirements}
            treeData={treeData}
            onTagInput={handleTagInput}
            seriesIndex={seriesIndex}
            requirementsObj={requirementsObj}
            tagValues={tagValues}
            seriesArr={seriesArr}
          />
        </TabPanel>
      </Tabs>
      <div align="right" className="tagEditForm-btnGroup">
        <TagEditorButton
          name="back"
          onClick={buttonClick}
          disabled={seriesIndex === 0}
          value="Previous series"
        />
        <TagEditorButton
          name="next"
          onClick={buttonClick}
          disabled={seriesIndex === seriesArr.length - 1}
          value="Next series"
        />

        <TagEditorButton
          name="save"
          onClick={buttonClick}
          disabled={Object.keys(tagValues).length === 0}
          value="Save Tags"
        />
      </div>
    </>
  );
};

export default tagEditor;
