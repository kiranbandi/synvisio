

export default function (fileContent) {
    return new Promise((resolve, reject) => {
        var { genomeLibrary, chromosomeMap } = processChromosomes(fileContent),
            { information, alignmentList } = processCollinearity(fileContent, chromosomeMap);
        resolve({ genomeLibrary, chromosomeMap, information, alignmentList, 'trackData': [false] });
    })
}


function processChromosomes(text) {

    let genomeEntry, genomeLibrary = new Map(),
        chromosomeMap = new Map();

    text.split('\n').forEach(function (line, lineIndex) {

        genomeEntry = line.split("\t");
        // 4 tab seperated entries , 
        // 1st in chromosome index , 
        // 2nd and 3rd are the start and end positions
        let chromosomeId = genomeEntry[0],
            speciesIdentifier = genomeEntry[0].slice(0, 2),
            geneStart = parseInt(genomeEntry[1]),
            geneEnd = parseInt(genomeEntry[2]),
            geneId = 'gene-' + lineIndex;

        // Taking in only non scafflod entries - unwanted entries end up being parsed as NaN and this filters them
        if (chromosomeId.length >= 2 && chromosomeId.length <= 4) {
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
    })
    // once all parsing is done set width of each chromosome
    chromosomeMap.forEach((chromosome) => {
        chromosome.width = chromosome.end - chromosome.start;
    });
    // For all ancestors add fake entries into genomeLibrary
    var ancestorKeys = [...chromosomeMap.keys()].filter((d) => d.slice(0, 2) == 'AN');
    _.map(ancestorKeys, (ancestor) => {
        genomeLibrary.set('gene-' + ancestor, {
            'start': chromosomeMap.get(ancestor).start,
            'end': chromosomeMap.get(ancestor).end,
            'chromosomeId': ancestor
        })
    });

    return {
        genomeLibrary,
        chromosomeMap
    };

}

// worker written in vanilla javascript 
export function processCollinearity(text, chromosomeMap) {
    var fileLines = text.split('\n'),
        alignmentList = [];

    // First get the chromosome map and get all the links marked with AN.
    // Then group them by colour
    var fileData = fileLines.map((d, i) => d.split('\t').map((t) => t.trim()).concat(i)),
        // get the ancestor group out
        groupedData = _.partition(fileData, (d) => d[0].slice(0, 2) == 'AN');
    // group ancestor by color map 
    var ancestorColorMap = _.groupBy(groupedData[0], (d) => d[3]);

    // Now loop over the rest of the data 
    // keep going line by line until the color is different or the source ID is different 

    var store = [],
        lineCount = groupedData[1].length, iterator = 0;

    while (iterator < lineCount) {
        var line = groupedData[1][iterator],
            nextLine = groupedData[1][iterator + 1] || [];
        var lineSource = line[0], lineColor = line[3],
            nextLineSource = nextLine[0], nextLineColor = nextLine[3];

        // Add the current line to buffer 
        store.push(line);

        // if the current line is different from next
        // then store all lines in buffer in alignment
        //  along with current line and start new buffer  
        if (lineSource != nextLineSource || lineColor != nextLineColor) {

            // get color and target from first line 
            var alignmentColor = store[0][3],
                source = ancestorColorMap[alignmentColor][0][0],
                target = store[0][0];

            var alignment = {
                'score': 10,
                'e_value': 0,
                'count': store.length,
                'type': 'regular',
                source,
                target,
                links: _.map(store, (l) => {
                    return {
                        'source': 'gene-' + source,
                        'target': 'gene-' + l[4],
                        'e_value': 0,
                        'score': 10
                    };
                })
            };
            alignmentList.push(alignment);
            // clear buffer
            store = [];
        }
        iterator = iterator + 1;
    }
    return { "information": false, "alignmentList": alignmentList };
};
