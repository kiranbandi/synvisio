import * as types from '../actions/actionTypes';
import initialState from './initialState';

// Perils of having a nested tree strucutre in the Redux State XD XD XD 
export default function oracleReducer(state = initialState.oracle, action) {
  switch (action.type) {
    case types.SET_LOADER_STATE:
      return Object.assign({}, state, { loaderState: action.loaderState })
    case types.TOGGLE_DARK_THEME:
      return Object.assign({}, state, { isDark: !state.isDark })
    case types.SET_SEARCH_RESULT:
      return Object.assign({}, state, { searchResult: action.searchResult })
    case types.SET_PLOT_LEVEL:
      return Object.assign({}, state, { multiLevel: action.value })
    case types.SET_MULTI_TYPE:
      return Object.assign({}, state, { multiLevelType: action.value })
    case types.SET_PLOT_TYPE:
      return Object.assign({}, state, { plotType: action.value })
    case types.SET_TRACK_TYPE:
      return Object.assign({}, state, { trackType: action.trackType })
    case types.TOGGLE_MODAL:
      return Object.assign({}, state, { isModalVisible: !state.isModalVisible })
    case types.TOGGLE_TRACKS:
      return Object.assign({}, state, { configuration: { ...state.configuration, showTracks: !state.configuration.showTracks } })
    case types.SET_CHROMOSOME_LABELS_STATE:
      return Object.assign({}, state, { configuration: { ...state.configuration, chromosomeLabelsON: action.chromosomeLabelsON } })
    case types.SET_MULTI_DUAL_FILTER:
      return Object.assign({}, state, { configuration: { ...state.configuration, multiDualFilter: action.multiDualFilter } })
    case types.SET_NORMALIZED:
      return Object.assign({}, state, { configuration: { ...state.configuration, isNormalized: action.isNormalized } })
    case types.SET_MARKER_SCALE:
      return Object.assign({}, state, { configuration: { ...state.configuration, showScale: action.showScale } })
    case types.SET_BLOCK_MODE:
      return Object.assign({}, state, { configuration: { ...state.configuration, isBlockModeON: action.isBlockModeON } })
    case types.SET_CHROMOSOME_MODE:
      return Object.assign({}, state, { configuration: { ...state.configuration, isChromosomeModeON: action.isChromosomeModeON } })
    case types.SET_MARKER_EDGE:
      return Object.assign({}, state, { configuration: { ...state.configuration, markerEdge: action.value } })
    case types.SET_ALIGNMENT_COLOR:
      return Object.assign({}, state, { configuration: { ...state.configuration, alignmentColor: action.value } })
    case types.SET_SOURCEID:
      return Object.assign({}, state, { sourceID: action.sourceID })
    case types.SET_CONFIGURATION:
      return Object.assign({}, state, { configuration: action.configuration })
    case types.SET_ROOT_MARKERS:
      return Object.assign({}, state, { configuration: { ...state.configuration, markers: action.markers, reversedMarkers: action.reversedMarkers } })
    case types.SET_ALIGNMENT_LIST:
      return Object.assign({}, state, { configuration: { ...state.configuration, alignmentList: action.alignmentList } })
    case types.SET_FILTER_LEVEL:
      return Object.assign({}, state, { configuration: { ...state.configuration, filterLevel: action.filterLevel } })
    case types.SET_HIVE_VIEW_SELECTED:
      return Object.assign({}, state, { configuration: { ...state.configuration, hiveView: { ...state.configuration.hiveView, selectedMarker: action.markerID } } })
    default:
      return state;
  }
}