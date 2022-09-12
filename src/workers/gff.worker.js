export function process(gffData, additionalParams = {}) {

    let { processScaffolds = false } = additionalParams;

    let scaffoldBypassed = false;

    let classifyGenome = function (processScaffoldFlag) {

        let genomeEntry,
            genomeLibrary = new Map(),
            chromosomeMap = new Map();

        gffData.split('\n').forEach(function (line) {

            genomeEntry = line.split("\t");
            // 4 tab seperated entries , 1st in chromosome index , 2nd is unique gene id ,3rd and 4th are the start and end positions
            let chromosomeId = genomeEntry[0],
                speciesIdentifier = genomeEntry[0].slice(0, 2),
                geneStart = parseInt(genomeEntry[2]),
                geneEnd = parseInt(genomeEntry[3]),
                geneId = genomeEntry[1];

            // Taking in only non scafflod entries - unwanted entries end up being parsed as NaN and this filters them
            if (chromosomeId.length >= 2 && (chromosomeId.length <= (processScaffoldFlag ? 25 : 4))) {
                genomeLibrary.set(geneId, {
                    'start': geneStart,
                    'end': geneEnd,
                    // the first 2 characters are the genome name and can be removed
                    'chromosomeId': chromosomeId
                })
                // To create a list of the start and end of all chromosomes
                if (!chromosomeMap.has(chromosomeId)) {
                    chromosomeMap.set(chromosomeId, {
                        start: geneStart,
                        end: geneEnd,
                        'speciesIdentifier': speciesIdentifier
                    });
                } else {
                    var entry = chromosomeMap.get(chromosomeId);
                    if (geneStart < entry.start) {
                        entry.start = geneStart;
                    }
                    if (geneEnd > entry.end) {
                        entry.end = geneEnd;
                    }
                    chromosomeMap.set(chromosomeId, entry);
                }
            }
        });

        return {
            genomeLibrary,
            chromosomeMap
        };
    }

        // classify the genomes based on the passed in scaffold filter flag
        let { chromosomeMap, genomeLibrary } = classifyGenome(processScaffolds);

        if ([...chromosomeMap.keys()].length == 0 && !scaffoldBypassed) {
            // if no chromosome keys were found in the chromosome map then rerun the classification without any scaffold filtering
            let classifiedResult = classifyGenome(true);
            scaffoldBypassed = true;
            //overwrite the previous values
            chromosomeMap = classifiedResult.chromosomeMap;
            genomeLibrary = classifiedResult.genomeLibrary;

          
        }

        // once all parsing is done set width of each chromosome
        chromosomeMap.forEach((chromosome) => {
            chromosome.width = chromosome.end - chromosome.start;
        })
        return {
            genomeLibrary,
            chromosomeMap,
            scaffoldBypassed
        };
    

};