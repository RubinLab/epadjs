import getActiveBrushToolsForElement from './util/getActiveBrushToolsForElement.js';
import getActiveViewportEnabledElement from './util/getActiveViewportEnabledElement.js';
import getActiveFreehandToolsForElement from './util/getActiveFreehandToolsForElement.js';
import { store } from 'cornerstone-tools';

const brushModule = store.modules.brush;

const actions = {
  nextSegmentForActiveViewport: ({ viewports }) => {
    const activeBrushTools = getActiveBrushToolsForElement(viewports);

    if (!activeBrushTools.length) {
      return;
    }

    const brushTool = activeBrushTools[0];

    brushTool.nextSegment();
  },
  previousSegmentForActiveViewport: ({ viewports }) => {
    const activeBrushTools = getActiveBrushToolsForElement(viewports);

    if (!activeBrushTools.length) {
      return;
    }

    const brushTool = activeBrushTools[0];

    brushTool.previousSegment();
  },
  increaseBrushSize: () => {
    const oldRadius = brushModule.state.radius;
    let newRadius = Math.floor(oldRadius * 1.2);

    // If e.g. only 2 pixels big. Math.floor(2*1.2) = 2.
    // Hence, have minimum increment of 1 pixel.
    if (newRadius === oldRadius) {
      newRadius += 1;
    }

    brushModule.setters.radius(newRadius);
  },
  decreaseBrushSize: () => {
    const oldRadius = brushModule.state.radius;
    const newRadius = Math.floor(oldRadius * 0.8);

    brushModule.setters.radius(newRadius);
  },
  cancelFreehandDrawing: ({ viewports }) => {
    const enabledElement = getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndex
    );

    const activeFreehandTools = getActiveFreehandToolsForElement(viewports);

    if (!activeFreehandTools.length) {
      return;
    }

    activeFreehandTools[0].cancelDrawing(enabledElement.element);
  }
};

const definitions = {
  nextSegmentForActiveViewport: {
    commandFn: actions.nextSegmentForActiveViewport,
    storeContexts: ['viewports']
  },
  previousSegmentForActiveViewport: {
    commandFn: actions.previousSegmentForActiveViewport,
    storeContexts: ['viewports']
  },
  increaseBrushSize: {
    commandFn: actions.increaseBrushSize
  },
  decreaseBrushSize: {
    commandFn: actions.decreaseBrushSize
  },
  cancelFreehandDrawing: {
    commandFn: actions.cancelFreehandDrawing,
    storeContexts: ['viewports']
  }
};

export default {
  actions,
  definitions,
  defaultContext: 'ACTIVE_VIEWPORT::CORNERSTONE'
};
