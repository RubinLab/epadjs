const initialState = {
  series: [],
  viewports: [],
  selectedStudies: {}
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
    //New reducer
    case "CHECK_STUDY":
      const newSelStudies = { ...state.selectedStudies };
      newSelStudies[action.study.studyUID]
        ? delete newSelStudies[action.study.studyUID]
        : (newSelStudies[action.study.studyUID] = action.study);
      return { ...state, selectedStudies: newSelStudies };
    default:
      return state;
  }
}
