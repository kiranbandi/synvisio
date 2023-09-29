import getPlotDimensions from '../../utils/getPlotDimensions';

const configuration = getPlotDimensions();

export default {
  oracle: {
    isDark: false,
    isModalVisible: false,
    isSnapShotAvailable: false,
    sourceID: 'bn',
    searchResult: [],
    multiLevel: false,
    multiLevelType: 'tree',
    plotType: 'linearplot',
    trackType: [{ 'type': 'track-scatter', 'color': 'red' },
    { 'type': 'track-scatter', 'color': 'red' },
    { 'type': 'track-scatter', 'color': 'red' },
    { 'type': 'track-scatter', 'color': 'red' },
    { 'type': 'track-scatter', 'color': 'red' },
    { 'type': 'track-scatter', 'color': 'red' },
    { 'type': 'track-scatter', 'color': 'red' }],
    loaderState: false,
    configuration: {
      ...configuration,
      showScale: true,
      markerEdge: 'rounded', // rounded or square
      alignmentColor: 'tenColor', // tenColor or orientation
      markerAlternateColor: true,
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
