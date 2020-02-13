import getPlotDimensions from '../../utils/getPlotDimensions';

const configuration = getPlotDimensions();

export default {
  oracle: {
    isDark: true,
    sourceID: 'bn',
    searchResult: [],
    multiLevel: false,
    multiLevelType: 'tree',
    plotType: 'dashboard',
    trackType: 'track-heatmap',
    loaderState: false,
    snapshotList: [],
    configuration: {
      ...configuration,
      isChromosomeModeON: false,
      showTracks: false,
      isBlockModeON: false,
      'markers': { 'source': [], 'target': [] }, // default preset markers are loaded from the sampleSourceMapper
      'reversedMarkers': { 'source': [], 'target': [] },//same structure but array contains the marker that is reversed
      'alignmentList': [],
      'filterLevel': {}
    }
  }
};
