import React from "react";
import MenuIOButtons from "../common/MenuIOButtons.js";
import SegmentationMenuDeleteConfirmation from "./SegmentationMenuDeleteConfirmation.js";
import SegmentationMenuListBody from "./SegmentationMenuListBody.js";
import SegmentationMenuListHeader from "./SegmentationMenuListHeader.js";
import BrushSettings from "./BrushSettings.js";
import cornerstoneTools from "../../../cornerstone-tools";
import { editSegmentInput } from "../../util/brushMetadataIO.js";
import onIOCancel from "../common/helpers/onIOCancel.js";
import onImportButtonClick from "../common/helpers/onImportButtonClick.js";
import onExportButtonClick from "../common/helpers/onExportButtonClick.js";
import "./segmentationMenu.styl";

import getActiveViewportEnabledElement from "../../util/getActiveViewportEnabledElement.js";
import getSeriesInstanceUidFromEnabledElement from "../../util/getSeriesInstanceUidFromEnabledElement.js";

const brushModule = cornerstoneTools.store.modules.brush;

//

/**
 * @class SegmentationMenu - Renders a menu for importing, exporting, creating
 * and renaming Segments. As well as setting configuration settings for
 * the Brush tools.
 */
export default class SegmentationMenu extends React.Component {
  constructor(props = {}) {
    super(props);

    this.getSegmentList = this.getSegmentList.bind(this);

    const enabledElement = getActiveViewportEnabledElement(
      props.viewports,
      props.activeIndex
    );
    const seriesInstanceUid = getSeriesInstanceUidFromEnabledElement(
      enabledElement
    );

    let segments = [];
    let activeSegmentIndex = 1;
    const importMetadata = this.constructor._importMetadata(seriesInstanceUid);

    if (enabledElement) {
      const segmentList = this.getSegmentList(
        enabledElement,
        seriesInstanceUid
      );

      segments = segmentList.segments;
      activeSegmentIndex = segmentList.segments;
    }

    this.state = {
      importMetadata,
      segments,
      seriesInstanceUid,
      enabledElement,
      deleteConfirmationOpen: false,
      segmentToDelete: 1,
      activeSegmentIndex,
      importing: false,
      exporting: false
    };

    this.onSegmentChange = this.onSegmentChange.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.confirmDeleteOnDeleteClick = this.confirmDeleteOnDeleteClick.bind(
      this
    );
    this.onDeleteCancelClick = this.onDeleteCancelClick.bind(this);
    this.onDeleteConfirmClick = this.onDeleteConfirmClick.bind(this);
    this.onImportButtonClick = onImportButtonClick.bind(this);
    this.onExportButtonClick = onExportButtonClick.bind(this);
    this.onIOComplete = this.onIOComplete.bind(this);
    this.onIOCancel = onIOCancel.bind(this);
  }

  /**
   * getSegmentList - Grabs the segments from the brushStore and
   * populates state.
   *
   * @returns {null}
   */
  getSegmentList(enabledElement, seriesInstanceUid) {
    enabledElement = enabledElement || this.state.enabledElement;
    seriesInstanceUid = seriesInstanceUid || this.state.seriesInstanceUid;

    if (!enabledElement || !seriesInstanceUid) {
      return [];
    }

    const segments = this.constructor._segments(enabledElement);
    const activeSegmentIndex = brushModule.getters.activeSegmentIndex(
      enabledElement
    );

    return {
      segments,
      activeSegmentIndex
    };
  }

  /**
   * onIOComplete - A callback executed on succesful completion of an
   * IO opperation. Recalculates the Segmentation state.
   *
   * @returns {type}  description
   */
  onIOComplete() {
    const { seriesInstanceUid, enabledElement } = this.state.seriesInstanceUid;

    const importMetadata = this.constructor._importMetadata(seriesInstanceUid);
    const segments = this.constructor._segments(enabledElement);
    const activeSegmentIndex = brushModule.getters.activeSegmentIndex(
      enabledElement
    );

    this.setState({
      importMetadata,
      segments,
      activeSegmentIndex,
      importing: false,
      exporting: false
    });
  }

  /**
   * onSegmentChange - Callback that changes the active segment being drawn.
   *
   * @param  {Number} segmentIndex The index of the segment to set active.
   * @returns {null}
   */
  onSegmentChange(segmentIndex) {
    const enabledElement = this.state.element;

    brushModule.setters.activeSegmentIndex(enabledElement, segmentIndex);

    this.setState({ activeSegmentIndex: segmentIndex });
  }

  /**
   * onEditClick - A callback that triggers metadata input for a segment.
   *
   * @param  {Number} segmentIndex The index of the segment metadata to edit.
   * @param  {object}   metadata     The current metadata of the segment.
   * @returns {null}
   */
  onEditClick(segmentIndex, metadata) {
    editSegmentInput(segmentIndex, metadata);
  }

  /**
   * confirmDeleteOnDeleteClick - A callback that triggers confirmation of segment deletion.
   *
   * @param  {Number} segmentIndex The index of the segment being deleted.
   * @returns {null}
   */
  confirmDeleteOnDeleteClick(segmentIndex) {
    this.setState({
      deleteConfirmationOpen: true,
      segmentToDelete: segmentIndex
    });
  }

  /**
   * onDeleteConfirmClick - A callback that deletes a segment form the series.
   *
   * @returns {null}
   */
  onDeleteConfirmClick() {
    const { segmentToDelete, enabledElement } = this.state;

    brushModule.setters.deleteSegment(enabledElement, segmentToDelete);

    const segments = this.constructor._segments(enabledElement);

    this.setState({
      deleteConfirmationOpen: false,
      segments
    });
  }

  /**
   * onDeleteCancelClick - A callback that closes the delete confirmation window
   * and aborts deletion.
   *
   * @returns {null}
   */
  onDeleteCancelClick() {
    this.setState({
      deleteConfirmationOpen: false
    });
  }

  /**
   * _importMetadata - Returns the import metadata for the active series.
   *
   * @returns {object} The importMetadata.
   */
  static _importMetadata(seriesInstanceUid) {
    const importMetadata = brushModule.getters.importMetadata(
      seriesInstanceUid
    );

    if (importMetadata) {
      return {
        label: importMetadata.label,
        type: importMetadata.type,
        name: importMetadata.name,
        modified: importMetadata.modified ? "true" : " false"
      };
    }

    return {
      name: "New Segmentation Collection",
      label: ""
    };
  }

  /**
   * _segments - Returns an array of segment metadata for the active series.
   *
   * @returns {object[]} An array of segment metadata.
   */
  static _segments(element) {
    // TODO -> support for multiple labelmaps.
    const segmentMetadata = brushModule.getters.metadata(element);

    if (!segmentMetadata) {
      return [];
    }

    const segments = [];

    for (let i = 0; i < segmentMetadata.length; i++) {
      if (segmentMetadata[i]) {
        segments.push({
          index: i,
          metadata: segmentMetadata[i]
        });
      }
    }

    return segments;
  }

  render() {
    const {
      importMetadata,
      segments,
      deleteConfirmationOpen,
      segmentToDelete,
      activeSegmentIndex,
      enabledElement,
      importing,
      exporting
    } = this.state;

    const { ImportCallbackOrComponent, ExportCallbackOrComponent } = this.props;

    let component;

    if (importing) {
      component = (
        <ImportCallbackOrComponent
          onImportComplete={this.onIOComplete}
          onImportCancel={this.onIOCancel}
        />
      );
    } else if (exporting) {
      component = (
        <ExportCallbackOrComponent
          onExportComplete={this.onIOComplete}
          onExportCancel={this.onIOCancel}
        />
      );
    } else if (deleteConfirmationOpen) {
      const segmentLabel = segments.find(
        segment => segment.index === segmentToDelete
      ).metadata.SegmentLabel;

      component = (
        <SegmentationMenuDeleteConfirmation
          segmentLabel={segmentLabel}
          onDeleteConfirmClick={this.onDeleteConfirmClick}
          onDeleteCancelClick={this.onDeleteCancelClick}
        />
      );
    } else {
      component = (
        <div className="segmentation-menu-component">
          <div className="segmentation-menu-list">
            <div className="segmentation-menu-header">
              <h3>Segments</h3>
              <MenuIOButtons
                ImportCallbackOrComponent={ImportCallbackOrComponent}
                ExportCallbackOrComponent={ExportCallbackOrComponent}
                onImportButtonClick={this.onImportButtonClick}
                onExportButtonClick={this.onExportButtonClick}
              />
            </div>
            <table className="peppermint-table">
              <tbody>
                <SegmentationMenuListHeader importMetadata={importMetadata} />
                <SegmentationMenuListBody
                  segments={segments}
                  activeSegmentIndex={activeSegmentIndex}
                  onSegmentChange={this.onSegmentChange}
                  onEditClick={this.onEditClick}
                  onDeleteClick={this.confirmDeleteOnDeleteClick}
                  enabledElement={enabledElement}
                />
              </tbody>
            </table>
          </div>
          <BrushSettings />
        </div>
      );
    }

    return <React.Fragment>{component}</React.Fragment>;
  }
}
