import * as types from './actionTypes';
import sampleSourceMapper from '../../utils/sampleSourceMapper';
import processAlignment from '../../utils/filterAlignment';
import getPlotDimensions from '../../utils/getPlotDimensions';
import _ from 'lodash';

export function setLoaderState(loaderState) {
    return { type: types.SET_LOADER_STATE, loaderState };
}

export function configureSourceID(sourceID, multiLevel = false) {
    return dispatch => {
        dispatch(setSourceID(sourceID));
        //reset configuration and snapshot store
        dispatch(setFilterLevel({}));
        dispatch(setchromosomeMode(false));
        dispatch(setBlockMode(false));
        dispatch(setSnapshotList([]));
        if (sampleSourceMapper[sourceID]) {
            const sampleDataMarkers = { ...sampleSourceMapper[sourceID] };
            if (multiLevel) {
                sampleDataMarkers[0] = sampleDataMarkers.source;
                sampleDataMarkers[1] = sampleDataMarkers.target;
                delete sampleDataMarkers.source;
                delete sampleDataMarkers.target;
            }
            dispatch(setRootMarkers(sampleDataMarkers));
        }
        else {
            dispatch(setRootMarkers(multiLevel ? {} : { 'source': [], 'target': [] }));
        }
    }
}

export function setchromosomeMode(isChromosomeModeON) {
    return { type: types.SET_CHROMOSOME_MODE, isChromosomeModeON };
}

export function setBlockMode(isBlockModeON) {
    return { type: types.SET_BLOCK_MODE, isBlockModeON };
}

export function setSourceID(sourceID) {
    return { type: types.SET_SOURCEID, sourceID };
}

export function setConfiguration(configuration) {
    return { type: types.SET_CONFIGURATION, configuration };
}

export function recreateSnapshot(configuration) {
    return dispatch => {
        dispatch(setConfiguration(configuration));
        dispatch(refineAlignmentList(configuration.filterLevel, configuration.alignmentList));
    };
}

export function setFilterLevel(filterLevel) {
    return { type: types.SET_FILTER_LEVEL, filterLevel };
};

export function setGenomicData(data) {
    const { genomeLibrary, alignmentList, snapshotStore = {}, trackData = false, ...otherData } = data;
    //  Treading Dangerous Territory here by polluting the global name space 
    //  But this reduces the load placed on the redux and react global store
    window.synVisio = { genomeLibrary, alignmentList, snapshotStore, trackData };
    return { type: types.SET_GENOME_DATA, data: otherData };
}

export function setRootMarkers(markers) {
    return { type: types.SET_ROOT_MARKERS, markers };
}

export function setALignmentList(alignmentList) {
    return { type: types.SET_ALIGNMENT_LIST, alignmentList };
}

export function toggleTracks() {
    return { type: types.TOGGLE_TRACKS };
}

export function setSnapshotList(snapshotList) {
    return { type: types.SET_SNAPSHOT_LIST, snapshotList };
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
        else if (filterLevel.alignment && !_.isEqual(o, filterLevel.alignment)) {
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
        dispatch(setchromosomeMode(!!(filterLevel.source && filterLevel.target)));
        dispatch(setBlockMode(!!(filterLevel.alignment)));
    };
}

export function filterData(sourceMarkers = [], targetMarkers = []) {
    const markers = { 'source': sourceMarkers, 'target': targetMarkers },
        alignmentList = window.synVisio.alignmentList,
        updatedAlignmentList = processAlignment(markers, alignmentList);

    return dispatch => {
        let filterLevel = {}, isChromosomeModeON = false;
        // when only one marker is selected in source and target , directly enter chromosome mode
        if (markers.source.length == 1 && markers.target.length == 1) {
            filterLevel = { source: markers.source[0], target: markers.target[0] };
            isChromosomeModeON = true;
        };
        dispatch(setRootMarkers(markers));
        dispatch(setFilterLevel(filterLevel));
        dispatch(setchromosomeMode(isChromosomeModeON));
        dispatch(setBlockMode(false));
        dispatch(setALignmentList(updatedAlignmentList));
    };
}

export function hiveFilterData(markers) {

    let alignmentList = window.synVisio.alignmentList,
        updatedAlignmentList = [],
        noOfMarkers = Object.keys(markers).length;

    // if there are more than 2 markers go round calling alignments 
    // in sets of two with each with the one after it except for the last one which loops back to the first
    if (noOfMarkers > 2) {
        _.each(markers, (value, keyIndex) => {
            const nextIndex = ((noOfMarkers - 1) == keyIndex) ? 0 : (Number(keyIndex) + 1),
                tempMarkers = { 'source': markers[keyIndex], 'target': markers[nextIndex] };
            updatedAlignmentList.push({ source: keyIndex, target: nextIndex, 'alignmentList': processAlignment(tempMarkers, alignmentList) });
        });
    }
    else if (noOfMarkers == 2) {
        const tempMarkers = { 'source': markers[0], 'target': markers[1] };
        updatedAlignmentList.push({ source: 0, target: 1, 'alignmentList': processAlignment(tempMarkers, alignmentList) });
    }
    return dispatch => {
        dispatch(setRootMarkers(markers));
        dispatch(setHiveViewSelectedMarker(-1));
        dispatch(setALignmentList(updatedAlignmentList));
    };
}

export function setPlotProps(levelOrType, value) {
    const isLevel = (levelOrType == 'level');
    return dispatch => {
        let configurationStore = getPlotDimensions(value),
            markers = (isLevel && value) ? {} : { 'source': [], 'target': [] };
        const configuration = {
            ...configurationStore,
            filterLevel: {},
            isChromosomeModeON: false,
            isBlockModeON: false,
            markers,
            'alignmentList': [],
            'filterLevel': {}
        }
        dispatch(setSnapshotList([]));
        dispatch(setConfiguration(configuration));
        if (isLevel) {
            dispatch({ type: types.SET_PLOT_LEVEL, value });
        }
        else {
            dispatch({ type: types.SET_PLOT_TYPE, value });
        }
    };
}

export function setTrackType(trackType){
    return { type: types.SET_TRACK_TYPE, trackType };
}

export function setNormalizedState(isNormalized = false) {
    return { type: types.SET_NORMALIZED, isNormalized };
}

export function setChromosomeLabelsState(chromosomeLabelsON = false) {
    return { type: types.SET_CHROMOSOME_LABELS_STATE, chromosomeLabelsON };
}

export function setHiveViewSelectedMarker(markerID) {
    return { type: types.SET_HIVE_VIEW_SELECTED, markerID };
}












