export function process(gffData, additionalParams = {}) {

    let genomeEntry,
        genomeLibrary = new Map(),
        chromosomeMap = new Map();

    gffData.split('\n').forEach(function (line) {

        genomeEntry = line.split("\t");
        // 4 tab-separated entries: chromosome id, gene id, start, end
        let chromosomeId = genomeEntry[0],
            speciesIdentifier = genomeEntry[0] ? genomeEntry[0].slice(0, 2) : '',
            geneStart = parseInt(genomeEntry[2]),
            geneEnd = parseInt(genomeEntry[3]),
            geneId = genomeEntry[1];

        // Skip empty lines, comment lines, and lines with invalid coordinates
        if (!chromosomeId || !geneId || isNaN(geneStart) || isNaN(geneEnd)) return;

        genomeLibrary.set(geneId, {
            'start': geneStart,
            'end': geneEnd,
            'chromosomeId': chromosomeId
        });

        if (!chromosomeMap.has(chromosomeId)) {
            chromosomeMap.set(chromosomeId, {
                start: geneStart,
                end: geneEnd,
                'speciesIdentifier': speciesIdentifier
            });
        } else {
            var entry = chromosomeMap.get(chromosomeId);
            if (geneStart < entry.start) entry.start = geneStart;
            if (geneEnd > entry.end) entry.end = geneEnd;
            chromosomeMap.set(chromosomeId, entry);
        }
    });

    // set width of each chromosome
    chromosomeMap.forEach((chromosome) => {
        chromosome.width = chromosome.end - chromosome.start;
    });

    return {
        genomeLibrary,
        chromosomeMap,
        scaffoldBypassed: false
    };

};