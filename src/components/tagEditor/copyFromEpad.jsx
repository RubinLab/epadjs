import React from "react";
import * as dcmjs from "dcmjs";
import ManualEditForm from "./manualEditForm";
import { getAllSubjects } from "../../services/subjectServices";
import SeriesBrowser from "./seriesBrowser";
import TagCopy from "./tagCopy";
import {
  getImageIds,
  getImageArrayBuffer,
} from "../../services/seriesServices";
import { extractTableData } from "../../Utils/aid";
import "./tagEditor.css";

class CopyFromEpad extends React.Component {
  state = {
    showReadTags: false,
    error: null,
    showSeriesBrowser: true,
  };

  handleSeriesBrowse = () => {
    this.setState(state => ({ showBrowser: !state.showBrowser }));
  };

  handleGetTags = async () => {
    const { project, subject, study, series } = this.state;
    const isFullPath = project && subject && study && series;
    if (!isFullPath) {
      if (!subject)
        this.setState({ error: "Please select subject, study, and series" });
      else if (!study)
        this.setState({ error: "Please select study and series" });
      else this.setState({ error: "Please select series" });
    } else {
      await this.getFirstImgOfSeries(project, subject, study, series);
      this.setState(state => ({
        showReadTags: !state.showReadTags,
        error: null,
        showSeriesBrowser: !state.showSeriesBrowser,
      }));
    }
  };

  getFirstImgOfSeries = async (project, subject, study, series) => {
    let rawData = [];
    const obj = {
      projectUID: project,
      subjectUID: subject,
      studyUID: study,
      seriesUID: series,
    };
    getImageIds(obj)
      .then(res => {
        const imgIDPromises = [];
        const imgIDs = res.data;
        imgIDs.forEach(item => {
          imgIDPromises.push(getImageArrayBuffer(item.lossyImage));
        });
        Promise.all(imgIDPromises)
          .then(buffers => {
            rawData = buffers.map(buffer => {
              return this.getDataset(buffer.data);
            });
            this.setState({ rawData });
            const treeData = extractTableData(
              rawData,
              this.props.requirementsObj
            );

            this.setState({ treeData });
            return treeData;
          })
          .catch();
      })
      .catch(err => {
        console.log(err);
      });
  };

  getDataset = arrayBuffer => {
    try {
      let DicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer);
      const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
        DicomDict.dict
      );
      return dataset;
    } catch (err) {
      console.log("Error in reading dicom dataset", err);
    }
  };

  getBrowseData = (name, value) => {
    this.setState({ [name]: value });
    if (name === "project") {
      this.setState({
        subject: null,
        study: null,
        series: null,
      });
    }
    const { project, subject, study, series } = this.state;
    const isFullPath = project && subject && study && series;
    if (isFullPath) this.setState({ error: null });
  };

  render = () => {
    const {
      requirements,
      treeData,
      handleTagInput,
      seriesIndex,
      tagValues,
      seriesArr,
    } = this.props;
    const seriesSelected = !isNaN(Number.parseInt(seriesIndex));
    const { showReadTags, showSeriesBrowser } = this.state;

    return (
      <div className="copyFromEpad">
        <ManualEditForm
          requirements={requirements}
          treeData={treeData}
          seriesIndex={seriesIndex}
          onTagInput={handleTagInput}
          tagValues={tagValues}
          seriesArr={seriesArr}
        />
        {seriesSelected && showSeriesBrowser && (
          <SeriesBrowser
            onGetTags={this.handleGetTags}
            onChange={this.getBrowseData}
            error={this.state.error}
          />
        )}
        {showReadTags && (
          <TagCopy
            onClose={this.handleGetTags}
            requirements={this.props.requirements}
            treeData={this.state.treeData}
            seriesIndex={this.props.seriesIndex}
            onTagInput={this.props.onTagInput}
          />
        )}
      </div>
    );
  };
}

export default CopyFromEpad;
