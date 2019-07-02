import { BrushTool, store } from 'cornerstone-tools';
import generateBrushMetadata from '../util/generateBrushMetadata.js';

const brushModule = store.modules.brush;

export default class Brush3DTool extends BrushTool {
  constructor(configuration = {}) {
    const defaultConfig = {};
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;
  }

  /**
   * Initialise painting with baseBrushTool
   *
   * @override @protected
   * @event
   * @param {Object} evt - The event.
   */
  _startPainting(evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    const { labelmap3D, currentImageIdIndex, activeLabelmapIndex } = brushModule.getters.getAndCacheLabelmap2D(element);

    const shouldErase = this._isCtrlDown(eventData) || this.configuration.alwaysEraseOnClick;

    this.paintEventData = {
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
      shouldErase
    };

    const segmentIndex = labelmap3D.activeSegmentIndex;
    let metadata = labelmap3D.metadata[segmentIndex];

    if (!metadata) {
      metadata = generateBrushMetadata('Unnamed Segment');

      brushModule.setters.metadata(element, activeLabelmapIndex, segmentIndex, metadata);
    }

    // Metadata assigned, start drawing.
    if (eventData.currentPoints) {
      this._paint(evt);
    }
    this._drawing = true;
    this._startListeningForMouseUp(element);
  }
}
