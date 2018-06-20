import * as types from '../actions/actionTypes';

export default function genomeDataReducer(state = {}, action) {
    switch (action.type) {
        case types.SET_GENOME_DATA:
            return Object.assign({}, state, { ...action.data })
        default:
            return state;
    }
}