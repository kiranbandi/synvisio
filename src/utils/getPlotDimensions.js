export default (plotType = 'dashboard') => {

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
                'width': 523
            },
            'hiveView': {
                'width': 500,
                'height': 500
            },
            'treeView': {
                'width': 750,
                'height': 500
            },
            'cubeView': {
                'height': 500,
                'width': 500
            },
            'panelView': {
                'height': 350,
                'width': 750
            },
            'blockView': {
                'verticalPositions': {
                    'source': 50,
                    'target': 300
                },
                'height': 350,
                'width': 750
            }
        }
    } else if (plotType == 'linearplot' || plotType == 'dotplot') {
        configuration = {
            'genomeView': {
                'height': 350,
                'width': width,
                'verticalPositions': {
                    'source': 45,
                    'target': 305
                }
            },
            'dotView': {
                'width': 523
            },
            'blockView': {
                'verticalPositions': {
                    'source': 50,
                    'target': 300
                },
                'height': 350,
                'width': width
            }
        }
    } else {

        configuration = {
            'genomeView': {
                'height': 0.45 * height,
                'width': width,
                'verticalPositions': {
                    'source': 45,
                    'target': (0.45 * height) - 45
                }
            },
            'dotView': {
                'width': 0.55 * height
            },
            'panelView': {
                'height': 0.55 * height,
                'width': width - (0.55 * height)
            },
            'blockView': {
                'verticalPositions': {
                    'source': 50,
                    'target': (0.40 * height) - 50
                },
                'height': 0.40 * height,
                'width': width
            },
            'hiveView': {
                'width': width * 0.75,
                'height': height * 0.90
            },
            'treeView': {
                'height': height,
                'width': width
            },
            'cubeView': {
                'height': width * 0.75,
                'width': height * 0.90
            }
        }
    }

    return configuration;
}