import React from 'react';
import { render } from "react-dom";
import { Provider } from 'react-redux';
import { createStore, applyMiddleware} from 'redux';
import rootReducer from './reducers';
import thunk from 'redux-thunk';
import App from './app/app';

const store = createStore(rootReducer, applyMiddleware(thunk));

render(
	<Provider store={store}>
		<App /> 
	</Provider>,
 document.getElementById('index'));