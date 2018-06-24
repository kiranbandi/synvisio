export default {
  oracle: {
    sourceID: 'bn',
    loaderState: false,
    configuration: {
      'markers': { 'source': [], 'target': [] }, // default preset markers are loaded from the sampleSourceMapper
      'alignmentList': [],
      'dotView': {
        'width': '500'
      },
      'genomeView': {
        'verticalPositions': {
          'source': 25,
          'target': 300
        },
        'height': 325,
        'width': '500'
      },
      'chromosomeView': {
        'verticalPositions': {
          'source': 50,
          'target': 375
        },
        'markers': {},
        'height': 425,
        'width': '500'
      },
      'blockView': {
        'verticalPositions': {
          'source': 50,
          'target': 275
        },
        'height': 325,
        'width': '500'
      }
    }
  }
};
