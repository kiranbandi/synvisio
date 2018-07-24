import getPlotDimensions from '../../utils/getPlotDimensions';

const configuration = getPlotDimensions();

export default {
  oracle: {
    sourceID: 'bn',
    multiLevel: true,
    plotType: 'dashboard',
    loaderState: false,
    snapshotList: [],
    configuration: {
      ...configuration,
      isChromosomeModeON: false,
      isBlockModeON: false,
      'markers': { 'source': [], 'target': [] }, // default preset markers are loaded from the sampleSourceMapper
      'alignmentList': [],
      'filterLevel': {}
    }
  }
};
