import { MNG_ITEM_SELECTED, CLOSE_MODAL } from "./types";

const initialState = {
  selection: null
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case MNG_ITEM_SELECTED:
      return { ...state, selection: action.selection };
    case CLOSE_MODAL:
      return { ...state, selection: null };

    default:
      return state;
  }
};

export default reducer;
