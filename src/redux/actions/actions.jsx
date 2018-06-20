import * as types from './actionTypes';

export function setLoaderState(loaderState) {
    return { type: types.SET_LOADER_STATE, loaderState };
}

export function setSourceID(sourceID) {
    return { type: types.SET_SOURCEID, sourceID };
}

export function setGenomicData(data) {
    return { type: types.SET_GENOME_DATA, data };
}












