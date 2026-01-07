<<<<<<< HEAD
import { thunk } from 'redux-thunk';
import { combineReducers, legacy_createStore as createStore, applyMiddleware } from 'redux';
=======
import thunk from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware } from 'redux';
>>>>>>> 84067737b450f88a58d0e1ee144c5a089e5345d1
import * as reducers from './reducers';

export default createStore(
  combineReducers({
    ...reducers,
  }),
  applyMiddleware(thunk)
);
