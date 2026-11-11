import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ReduxThunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
// import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.css";
import rootReducer from "./reducers";

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(ReduxThunk))
);

/* eslint-enable */
createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={`${process.env.REACT_APP_BASE_URL}`}>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
registerServiceWorker();
