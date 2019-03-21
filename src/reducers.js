import { combineReducers } from "redux";
import searchViewReducer from "./components/searchView/reducer";
import annotationsListReducer from "./components/annotationList/reducer";

export default combineReducers({
  searchViewReducer,
  annotationsListReducer
});
