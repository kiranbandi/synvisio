export function process(trackData, additionalParams = {}) {
    let { processScaffolds = false } = additionalParams;

    let overrideValues = [false, [0, 0]];

    function parseTrack(scaffoldFlag) {
        let store = { chromosomeMap: {}, max: 0, min: 0 };

        trackData.split('\n').forEach(function (line) {
            if (line.indexOf('min=') > -1) {
                overrideValues[0] = true;
                overrideValues[1] = line.trim().split(',').map((d) => d.trim().slice(4));
            } else {
                const trackLine = line.split("\t");
                const chromosomeId = trackLine[0],
                    trackStart = +trackLine[1],
                    trackEnd = +trackLine[2],
                    trackValue = +trackLine[3];

                if (chromosomeId && chromosomeId.length >= 2 && (chromosomeId.length <= (scaffoldFlag ? 25 : 4))) {
                    if (store.chromosomeMap.hasOwnProperty(chromosomeId)) {
                        store.chromosomeMap[chromosomeId].push({ value: trackValue, end: trackEnd, start: trackStart });
                    } else {
                        store.chromosomeMap[chromosomeId] = [{ value: trackValue, end: trackEnd, start: trackStart }];
                    }
                    if (trackValue > store.max) store.max = trackValue;
                    if (trackValue < store.min) store.min = trackValue;
                }
            }
        });
        return store;
    }

    let trackStore = parseTrack(processScaffolds);

    // If nothing was parsed with the strict filter, retry without scaffold filtering
    // (same bypass logic as gff.worker.js — handles chromosome names longer than 4 chars like "chr01")
    if (Object.keys(trackStore.chromosomeMap).length === 0) {
        trackStore = parseTrack(true);
    }

    // sort track values for each chromosome
    Object.keys(trackStore.chromosomeMap).forEach(function (key) {
        trackStore.chromosomeMap[key].sort(function (a, b) { return a.start - b.start; });
    });

    if (overrideValues[0]) {
        trackStore.min = overrideValues[1][0];
        trackStore.max = overrideValues[1][1];
    }

    return trackStore;
};