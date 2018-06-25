export default {
  oracle: {
    sourceID: 'bn',
    loaderState: false,
    configuration: {
      'markers': { 'source': [], 'target': [] }, // default preset markers are loaded from the sampleSourceMapper
      'alignmentList': [],
      'dotView': {
        'width': window.innerWidth
      },
      'genomeView': {
        'verticalPositions': {
          'source': 25,
          'target': 300
        },
        'height': 325,
        'width': window.innerWidth
      },
      'chromosomeView': {
        'verticalPositions': {
          'source': 50,
          'target': 375
        },
        'markers': {},
        'height': 425,
        'width': window.innerWidth
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
