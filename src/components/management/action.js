import { MNG_ITEM_SELECTED } from "./types";

export const managementItemSelected = selection => {
  return {
    type: MNG_ITEM_SELECTED,
    selection
  };
};
