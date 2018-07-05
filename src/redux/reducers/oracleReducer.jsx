import * as types from '../actions/actionTypes';
import initialState from './initialState';

// Perils of having a nested tree strucutre in the Redux State

export default function oracleReducer(state = initialState.oracle, action) {
  switch (action.type) {
    case types.SET_LOADER_STATE:
      return Object.assign({}, state, { loaderState: action.loaderState })
    case types.SET_SOURCEID:
      return Object.assign({}, state, { sourceID: action.sourceID })
    case types.SET_ROOT_MARKERS:
      return Object.assign({}, state, { configuration: { ...state.configuration, markers: action.markers } })
    case types.SET_ALIGNMENT_LIST:
      return Object.assign({}, state, { configuration: { ...state.configuration, alignmentList: action.alignmentList } })
    case types.SET_FILTER_LEVEL:
      return Object.assign({}, state, { configuration: { ...state.configuration, panelView: { ...state.configuration.panelView, filterLevel: action.filterLevel } } })
    default:
      return state;
  }
}