import { MNG_ITEM_SELECTED } from "./types";

const initialState = {
  selection: null
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case MNG_ITEM_SELECTED:
      return { ...state, selection: action.selection };
    default:
      return state;
  }
};

export default reducer;
