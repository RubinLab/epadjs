import { combineReducers } from "redux";
import searchViewReducer from "./components/searchView/reducer";
import annotationsListReducer from "./components/annotationsList/reducer";

export default combineReducers({
  searchViewReducer,
  annotationsListReducer
});
