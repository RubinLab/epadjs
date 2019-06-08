import { MNG_ITEM_SELECTED, CLOSE_MODAL } from "./types";

export const managementItemSelected = selection => {
  return {
    type: MNG_ITEM_SELECTED,
    selection
  };
};
