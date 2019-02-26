const initialState = {
  series: [],
  viewports: []
};

export default function searchViewReducer(state = initialState, action) {
  switch (action.type) {
    case "SELECT_SERIES":
      return {
        ...state,
        series: state.series.concat(action.payload)
      };
    case "INIT_CORNER":
      return {
        ...state,
        cornerstone: action.payload.cs,
        cornerstoneTools: action.payload.csT
      };
    case "SELECT_VIEWPORT":
      return {
        ...state,
        activeVP: action.payload
      };
    case "VL_CLICK":
      state.viewers.map(viewer =>
        state.cornerstoneTools.wwwc.activate(viewer, 1)
      );
      state.cornerstoneTools.wwwc.activate();
      return state;
    default:
      return state;
  }
}
