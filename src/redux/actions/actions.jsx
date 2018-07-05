import * as types from './actionTypes';
import sampleSourceMapper from '../../utils/sampleSourceMapper';
import processAlignment from '../../utils/filterAlignment';

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

export function setFilterLevel(filterLevel) {
    return { type: types.SET_FILTER_LEVEL, filterLevel };
};

export function setGenomicData(data) {
    const { genomeLibrary, alignmentList, ...otherData } = data;
    //  Treading Dangerous Territory here by polluting the global name space 
    //  But this reduces the load placed on the redux and react global store
    window.synVisio = { genomeLibrary, alignmentList };
    return { type: types.SET_GENOME_DATA, data: otherData };
}

export function setRootMarkers(markers) {
    return { type: types.SET_ROOT_MARKERS, markers };
}

export function setALignmentList(alignmentList) {
    return { type: types.SET_ALIGNMENT_LIST, alignmentList };
}

export function refineAlignmentList(alignmentList) {

    // return dispatch => {
    //     dispatch(setALignmentList(alignmentList));
    // };
}

export function filterData(sourceMarkers = [], targetMarkers = []) {
    const markers = { 'source': sourceMarkers, 'target': targetMarkers },
        alignmentList = window.synVisio.alignmentList,
        updatedAlignmentList = processAlignment(markers, alignmentList);
    return dispatch => {
        dispatch(setRootMarkers(markers));
        dispatch(setALignmentList(updatedAlignmentList));
    };
}












