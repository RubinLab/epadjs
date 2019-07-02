import React from 'react';
import SegmentationMenuListItem from './SegmentationMenuListItem.js';
import { newSegment } from '../../util/brushMetadataIO.js';

import './segmentationMenu.styl';

/**
 * @class SegmentationMenuListBody - Renders a list of SegmentationMenuListItems,
 * displaying the metadata of segments.
 */
export default class SegmentationMenuListBody extends React.Component {
  constructor(props = {}) {
    super(props);
  }

  render() {
    const { segments, activeSegmentIndex, onSegmentChange, onEditClick, onDeleteClick, enabledElement } = this.props;

    return (
      <React.Fragment>
        {segments.map(segment => (
          <SegmentationMenuListItem
            key={`${segment.metadata.SegmentLabel}_${segment.index}`}
            segmentIndex={segment.index}
            metadata={segment.metadata}
            onSegmentChange={onSegmentChange}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            checked={segment.index === activeSegmentIndex}
            enabledElement={enabledElement}
          />
        ))}
        <tr>
          <th />
          <th>
            <a className="segmentation-menu-new-button btn btn-sm btn-primary" onClick={newSegment}>
              <i className="fa fa-plus-circle" /> Segment
            </a>
          </th>
        </tr>
      </React.Fragment>
    );
  }
}
