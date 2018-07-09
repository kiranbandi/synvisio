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


export function refineAlignmentList(filterLevel, alignmentList) {

    let updatedAlignmentList = _.map(alignmentList, (o) => {

        if (filterLevel.count != undefined && filterLevel.count.nominalValue > o.count) {
            o.hidden = true;
        }
        else if (filterLevel.score != undefined && filterLevel.score.nominalValue > o.score) {
            o.hidden = true;
        }
        else if (filterLevel.e_value != undefined && filterLevel.e_value.nominalValue > o.e_value && !filterLevel.e_value.adjustToZero) {
            o.hidden = true;
        }
        else if (filterLevel.source && filterLevel.source != o.source) {
            o.hidden = true;
        }
        else if (filterLevel.target && filterLevel.target != o.target) {
            o.hidden = true;
        }
        else {
            o.hidden = false;
        }
        return o;
    });

    return dispatch => {
        dispatch(setFilterLevel(filterLevel));
        dispatch(setALignmentList(updatedAlignmentList));
    };
}

export function filterData(sourceMarkers = [], targetMarkers = []) {
    const markers = { 'source': sourceMarkers, 'target': targetMarkers },
        alignmentList = window.synVisio.alignmentList,
        updatedAlignmentList = processAlignment(markers, alignmentList);
    return dispatch => {
        dispatch(setRootMarkers(markers));
        //reset filter level
        dispatch(setFilterLevel({}));
        dispatch(setALignmentList(updatedAlignmentList));
    };
}












