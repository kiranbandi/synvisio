import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function oracleReducer(state = initialState.oracle, action) {
  switch (action.type) {
    case types.SET_LOADER_STATE:
      return Object.assign({}, state, { loaderState: action.loaderState })
    case types.SET_SOURCEID:
      return Object.assign({}, state, { sourceID: action.sourceID })
    default:
      return state;
  }
}