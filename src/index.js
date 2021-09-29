import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import ReduxThunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
// import registerServiceWorker from "./registerServiceWorker";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import "font-awesome/css/font-awesome.css";
import rootReducer from "./reducers";
import reportWebVitals from './reportWebVitals';


const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(ReduxThunk))
);

/* eslint-enable */
render(
  <BrowserRouter basename={`${process.env.REACT_APP_BASE_URL}`}>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById("root")
);
// registerServiceWorker();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
