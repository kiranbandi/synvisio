import _ from 'lodash';

export default function(trackData) {

    let trackStore = {
            chromosomeMap: {},
            max: 0,
            min: 0
        },
        trackLine;

    trackData.split('\n').forEach(function(line, index) {
        trackLine = line.split("\t");
        const chromosomeId = trackLine[0],
            trackStart = +trackLine[1],
            trackEnd = +trackLine[2],
            trackValue = +trackLine[3];
        // ignore empty lines and scaffolds
        if (chromosomeId.length >= 3 && chromosomeId.length <= 4) {
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
            if (trackValue > trackStore.max) { trackStore.max = trackValue; }
            if (trackValue < trackStore.min) { trackStore.min = trackValue; }
        }
    });

    // sort track values for each chromosome
    _.each(trackStore.chromosomeMap, (value) => {
        value.sort(function(a, b) { return a.start - b.start })
    });

    return trackStore;
};