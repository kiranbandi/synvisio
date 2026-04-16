import * as types from '../actions/actionTypes';

export default function genomeDataReducer(state = {}, action) {
    switch (action.type) {
        case types.SET_GENOME_DATA:
            return Object.assign({}, state, { ...action.data })
        case types.SET_COLOR_MAP:
            return Object.assign({}, state, { colorMap: action.colorMap })
        default:
            return state;
    }
}