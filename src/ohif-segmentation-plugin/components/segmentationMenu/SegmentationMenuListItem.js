import React from 'react';
import cornerstoneTools from 'cornerstone-tools';

import './segmentationMenu.styl';

const brushModule = cornerstoneTools.store.modules.brush;

/**
 * @class SegmentationMenuListItem - Renders metadata for a single segment.
 */
export default class SegmentationMenuListItem extends React.Component {
  constructor(props = {}) {
    super(props);
  }

  /**
   * _getTypeWithModifier - Returns the segment type with its modifier as a string.
   *
   * @returns {string}
   */
  _getTypeWithModifier() {
    const { metadata } = this.props;

    let typeWithModifier = metadata.SegmentedPropertyTypeCodeSequence.CodeMeaning;

    const modifier = metadata.SegmentedPropertyTypeCodeSequence.SegmentedPropertyTypeModifierCodeSequence;

    if (modifier) {
      typeWithModifier += ` (${modifier.CodeMeaning})`;
    }

    return typeWithModifier;
  }

  render() {
    const { metadata, segmentIndex, onSegmentChange, onEditClick, onDeleteClick, checked, enabledElement } = this.props;

    const segmentLabel = metadata.SegmentLabel;
    const colormap = brushModule.getters.activeCornerstoneColorMap(enabledElement);
    const color = colormap.getColor(segmentIndex);
    const segmentColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1.0 )`;

    const segmentCategory = metadata.SegmentedPropertyCategoryCodeSequence.CodeMeaning;
    const typeWithModifier = this._getTypeWithModifier();

    return (
      <tr>
        <td className="centered-cell">
          <i className="fa fa-square" style={{ color: segmentColor }} />{' '}
          <input
            type="radio"
            checked={checked}
            onChange={() => {
              onSegmentChange(segmentIndex);
            }}
          />
        </td>
        <td className="left-aligned-cell">
          <a
            className="segmentation-menu-name-link"
            onClick={() => {
              onEditClick(segmentIndex, metadata);
            }}
          >
            {segmentLabel}
          </a>
        </td>
        <td>
          <a
            className="segmentation-menu-name-link"
            onClick={() => {
              onEditClick(segmentIndex, metadata);
            }}
          >
            {typeWithModifier}
            {' - '}
            {segmentCategory}
          </a>
        </td>
        <td className="centered-cell">
          <a
            className="btn btn-sm btn-secondary"
            onClick={() => {
              onDeleteClick(segmentIndex);
            }}
          >
            <i className="fa fa-times" />
          </a>
        </td>
      </tr>
    );
  }
}
