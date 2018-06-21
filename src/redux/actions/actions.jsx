import * as types from './actionTypes';
import sampleSourceMapper from '../../utils/sampleSourceMapper';

export function setLoaderState(loaderState) {
    return { type: types.SET_LOADER_STATE, loaderState };
}

export function configureSourceID(sourceID) {
    return dispatch => {
        dispatch(setSourceID(sourceID));
        const sampleDataMarkers = sampleSourceMapper[sourceID];
        if (sampleDataMarkers) {
            dispatch(setRootMarkers(sampleDataMarkers));
        }
    }
}
export function setSourceID(sourceID) {
    return { type: types.SET_SOURCEID, sourceID };
}

export function setGenomicData(data) {
    return { type: types.SET_GENOME_DATA, data };
}

export function setRootMarkers(markers) {
    return { type: types.SET_ROOT_MARKERS, markers };
}











