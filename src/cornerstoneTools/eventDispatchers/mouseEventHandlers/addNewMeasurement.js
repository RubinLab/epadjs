import EVENTS from '../../events.js';
import external from '../../externalModules.js';
import { addToolState } from '../../stateManagement/toolState.js';
import { moveHandle, moveNewHandle } from '../../manipulators/index.js';
import { getLogger } from '../../util/logger.js';
import triggerEvent from '../../util/triggerEvent.js';

const logger = getLogger('eventDispatchers:mouseEventHandlers');

export default function(evt, tool) {
  logger.log('addNewMeasurement');

  evt.preventDefault();
  evt.stopPropagation();
  const eventData = evt.detail;
  const element = eventData.element;
  const measurementData = tool.createNewMeasurement(eventData);

  if (!measurementData) {
    return;
  }

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, tool.name, measurementData);

  external.cornerstone.updateImage(element);

  const options = Object.assign(
    {
      doneMovingCallback: () => {
        const eventType = EVENTS.MEASUREMENT_COMPLETED;
        const eventData = {
          toolName: tool.name,
          element,
          measurementData,
        };

        triggerEvent(element, eventType, eventData);
      },
    },
    tool.options
  );

  const handleMover =
    Object.keys(measurementData.handles).length === 1
      ? moveHandle
      : moveNewHandle;

  handleMover(
    eventData,
    tool.name,
    measurementData,
    measurementData.handles.end,
    options,
    'mouse'
  );
}
