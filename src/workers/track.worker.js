export function process(trackData, additionalParams = {}) {
    let trackStore = {
            chromosomeMap: {},
            max: 0,
            min: 0
        },
        trackLine, {
            processScaffolds = false
        } = additionalParams;

    // first flag is to indicate if we should override values and the second values
    // are min and max values respectively
    let overrideValues = [false, [0, 0]];

    trackData.split('\n').forEach(function (line, index) {
        if (line.indexOf('min=') > -1) {
            overrideValues[0] = true;
            overrideValues[1] = line.trim().split(',').map((d) => d.trim().slice(4));
        } else {
            trackLine = line.split("\t");
            const chromosomeId = trackLine[0],
                trackStart = +trackLine[1],
                trackEnd = +trackLine[2],
                trackValue = +trackLine[3];
            // ignore empty lines and scaffolds
            if (chromosomeId.length >= 3 && (chromosomeId.length <= (processScaffolds ? 25 : 4))) {
                // if there is an entry for the chromosome simply add to it , if not create a new one
                if (trackStore.chromosomeMap.hasOwnProperty(chromosomeId)) {
                    trackStore.chromosomeMap[chromosomeId].push({
                        'value': trackValue,
                        'end': trackEnd,
                        'start': trackStart
                    });
                } else {
                    trackStore.chromosomeMap[chromosomeId] = [{
                        'value': trackValue,
                        'end': trackEnd,
                        'start': trackStart
                    }];
                };
                //  push max and min values to the store
                if (trackValue > trackStore.max) {
                    trackStore.max = trackValue;
                }
                if (trackValue < trackStore.min) {
                    trackStore.min = trackValue;
                }
            }
        }
    });
    // sort track values for each chromosome
    Object.keys(trackStore.chromosomeMap).map((key) => {
        // inplace sorting thus modifying the original dataset :-D
        trackStore.chromosomeMap[key].sort(function (a, b) {
            return a.start - b.start
        });
    });
    // of override values are provided in the files, reset them using those values
    if (overrideValues[0]) {
        trackStore.min = overrideValues[1][0];
        trackStore.max = overrideValues[1][1];
    }
    return trackStore;
};