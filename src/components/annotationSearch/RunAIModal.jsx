import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { getPluginsForProject, triggerPlugin } from "../../services/pluginServices";
import { isSupportedModality } from "Utils/aid.js";

class RunAIModal extends Component {
  state = {
    selectedModel: "",
    aiModels: [],
    selectedAISeries: [],
    running: false,
  };

  componentDidMount() {
    this.fetchAIModels();
  }

  fetchAIModels = async () => {
    const projectID = this.props.decrArgs?.projectID;
    if (!projectID) return;
    try {
      const { data: projectPlugins } = await getPluginsForProject(projectID);
      const models = (projectPlugins?.projectplugin || []).map((p) => ({
        id: p.plugin_id,
        name: p.name,
      }));
      if (models.length > 0) this.setState({ aiModels: models });
    } catch (err) {
      console.error("[RunAI] fetchAIModels failed:", err);
    }
  };

  getSeriesOptions = () => {
    const { seriesPassed } = this.props;
    const allSeries = Array.isArray(seriesPassed)
      ? seriesPassed.flat()
      : Object.values(seriesPassed).flat();
    return allSeries
      .filter(isSupportedModality)
      .map((s) => {
        const modality = s.examType || s.modality;
        const desc = s.seriesDescription || "Unnamed Series";
        const label = `${s.seriesNo || ""} - ${desc}${modality ? ` [${modality.toUpperCase()}]` : ""}`;
        return { uid: s.seriesUID, label };
      });
  };

  addAISeries = (uid) => {
    if (!uid) return;
    const options = this.getSeriesOptions();
    const series = options.find((s) => s.uid === uid);
    if (!series) return;
    if (this.state.selectedAISeries.find((s) => s.uid === uid)) return;
    this.setState((prev) => ({ selectedAISeries: [...prev.selectedAISeries, series] }));
  };

  removeAISeries = (uid) => {
    this.setState((prev) => ({
      selectedAISeries: prev.selectedAISeries.filter((s) => s.uid !== uid),
    }));
  };

  runAI = async () => {
    const { selectedModel, selectedAISeries } = this.state;
    if (!selectedModel) {
      toast.warn("Please select an AI model.", { position: "top-right" });
      return;
    }
    if (selectedAISeries.length === 0) {
      toast.warn("Please select at least one series for AI.", { position: "top-right" });
      return;
    }
    const { projectID, patientID, studyUID } = this.props.decrArgs;
    const seriesUIDs = selectedAISeries.map((s) => s.uid);
    this.setState({ running: true });
    try {
      await triggerPlugin({ projectID, subjectID: patientID, studyUID, pluginID: selectedModel, seriesUIDs });
      toast.success("AI model triggered successfully.", { position: "top-right", autoClose: 3000 });
      this.props.onClose();
    } catch (err) {
      console.error("[RunAI] triggerPlugin failed:", err);
      toast.error("Failed to trigger AI model.", { position: "top-right", autoClose: 4000 });
    } finally {
      this.setState({ running: false });
    }
  };

  render() {
    const { onClose } = this.props;
    const { selectedModel, aiModels, selectedAISeries, running } = this.state;
    const seriesOptions = this.getSeriesOptions();

    return (
      <Modal.Dialog id="modal-fix" className="series-modal">
        <Modal.Header className="select-serie-header">
          <Modal.Title className="select-serie-title">Run AI Model</Modal.Title>
        </Modal.Header>
        <Modal.Body className="select-serie-body">
          <div className="tf-ai-panel" style={{ border: "none" }}>
            <div className="tf-ai-panel-body">
              <label className="tf-label">Select Model</label>
              <select
                className="tf-model-select"
                value={selectedModel}
                onChange={(e) => this.setState({ selectedModel: e.target.value })}
              >
                <option value="">-- Select --</option>
                {aiModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <label className="tf-label" style={{ marginTop: "0.4rem" }}>Select Series for AI</label>
              <select
                className="tf-model-select"
                value=""
                onChange={(e) => this.addAISeries(e.target.value)}
              >
                <option value="">-- Add series --</option>
                {seriesOptions
                  .filter((s) => !selectedAISeries.find((sel) => sel.uid === s.uid))
                  .map((s) => (
                    <option key={s.uid} value={s.uid}>{s.label}</option>
                  ))}
              </select>
              {selectedAISeries.length > 0 && (
                <div className="tf-ai-series-list">
                  {selectedAISeries.map((s) => (
                    <div key={s.uid} className="tf-ai-series-tag">
                      <span className="tf-ai-series-tag-label">{s.label}</span>
                      <button
                        className="tf-ai-series-tag-remove"
                        onClick={() => this.removeAISeries(s.uid)}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="select-serie-footer">
          <Button
            style={{"margin":"0.7rem 0.3rem"}}
            className="modal-button"
            variant="secondary"
            size="sm"
            onClick={this.runAI}
            disabled={!selectedModel || selectedAISeries.length === 0 || running}
          >
            {running ? "Running…" : "Run AI"}
          </Button>
          <Button
            style={{"margin":"0.7rem 0.3rem"}}
            className="modal-button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}

export default RunAIModal;
