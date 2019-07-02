import { importInternalModule, store } from 'cornerstone-tools';
import getActiveViewportEnabledElement from './getActiveViewportEnabledElement.js';

const BaseBrushTool = importInternalModule('base/BaseBrushTool');

export default function (viewports) {
  const enabledElement = getActiveViewportEnabledElement(viewports.viewportSpecificData, viewports.activeViewportIndex);

  const element = enabledElement.element;

  let tools = store.state.tools;

  tools = tools.filter(tool => tool.element === element && tool.mode === 'active');

  return tools.filter(tool => tool instanceof BaseBrushTool);
}
