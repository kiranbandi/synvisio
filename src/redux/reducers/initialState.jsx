const width = 0.975 * window.innerWidth,
  height = 0.90 * window.innerHeight;
let configuration;

// If the width is less than 95% of 540 pixels = 513 pixels , bootstrap gird small screen is 540 
// Then each plot takes the maximum available width and default values 
if (width < 513 || (width < height)) {
  configuration = {
    'genomeView': {
      'height': 350,
      'width': 750,
      'verticalPositions': {
        'source': 25,
        'target': 325
      }
    },
    'dotView': {
      'width': width
    },
    'panelView': {
      'height': 350,
      'width': width
    }
  }
}

else {

  configuration = {
    'genomeView': {
      'height': 0.40 * height,
      'width': width,
      'verticalPositions': {
        'source': 25,
        'target': (0.40 * height) - 25
      }
    },
    'dotView': {
      'width': 0.60 * height
    },
    'panelView': {
      'height': 0.60 * height,
      'width': width - (0.60 * height)
    }
  }

}



export default {
  oracle: {
    sourceID: 'bn',
    loaderState: false,
    snapshotList: [],
    configuration: {
      ...configuration,
      'markers': { 'source': [], 'target': [] }, // default preset markers are loaded from the sampleSourceMapper
      'alignmentList': [],
      'chromosomeView': {
        'verticalPositions': {
          'source': 50,
          'target': 375
        },
        'markers': {},
        'height': 425,
        'width': 0.95 * window.innerWidth
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
