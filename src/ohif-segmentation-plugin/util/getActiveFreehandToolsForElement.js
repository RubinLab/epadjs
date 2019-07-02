import { store } from 'cornerstone-tools';
import getActiveViewportEnabledElement from './getActiveViewportEnabledElement.js';
import Freehand3DRoiTool from '../tools/FreehandRoi3DTool.js';

export default function (viewports) {
  const enabledElement = getActiveViewportEnabledElement(viewports.viewportSpecificData, viewports.activeViewportIndex);

  const element = enabledElement.element;

  let tools = store.state.tools;

  tools = tools.filter(tool => tool.element === element && tool.mode === 'active');

  return tools.filter(tool => tool instanceof Freehand3DRoiTool);
}
