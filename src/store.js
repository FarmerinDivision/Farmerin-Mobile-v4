import thunk from 'redux-thunk';
import {combineReducers, createStore,applyMiddleware} from 'redux';
import * as reducers from './reducers';


export default createStore(combineReducers(
    {
      ...reducers,
    }
  ),applyMiddleware(thunk))