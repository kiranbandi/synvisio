import getPlotDimensions from '../../utils/getPlotDimensions';

const configuration = getPlotDimensions();

export default {
  oracle: {
    sourceID: 'bn',
    multiLevel: false,
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
      'alignmentList': [],
      'filterLevel': {}
    }
  }
};
