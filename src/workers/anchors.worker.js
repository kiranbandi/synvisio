// Worker for parsing JCVI MCScan anchors files
// Format: blocks separated by '###', each line: gene1\tgene2\tscore
// Chromosome info is inferred from the genomeLibrary built from the GFF file

export function process(anchorsData, additionalParams = {}) {

    const { genomeLibrary } = additionalParams;

    // Split on ### delimiters (may appear as '###\n' or '###' at end of file)
    const rawBlocks = anchorsData.split(/^###\s*$/m).filter(b => b.trim().length > 0);

    let alignmentList = [];
    let alignmentID = 0;

    rawBlocks.forEach(function (block) {
        const lines = block.split('\n').filter(l => l.trim().length > 0);
        if (lines.length === 0) return;

        const links = [];
        let source = null, target = null;

        lines.forEach(function (line) {
            // Skip comment lines
            if (line.startsWith('#')) return;

            const parts = line.split('\t');
            if (parts.length < 2) return;

            const gene1 = parts[0].trim();
            const gene2 = parts[1].trim();
            const score = parts[2] ? parts[2].trim() : '0';

            links.push({ source: gene1, target: gene2, e_value: score });

            // Infer chromosome IDs from genomeLibrary on first successful lookup
            if (!source && genomeLibrary && genomeLibrary.has(gene1)) {
                source = genomeLibrary.get(gene1).chromosomeId;
            }
            if (!target && genomeLibrary && genomeLibrary.has(gene2)) {
                target = genomeLibrary.get(gene2).chromosomeId;
            }
        });

        if (source && target && links.length > 0) {
            alignmentList.push({
                score: 0,
                e_value: 0,
                count: links.length,
                type: detectOrientation(links, genomeLibrary),
                source: source,
                target: target,
                sourceKey: 0,
                targetKey: 0,
                alignmentID: alignmentID++,
                links: links
            });
        }
    });

    let uniqueIDList = [];
    alignmentList.forEach(function (d) { uniqueIDList.push(d.source, d.target); });

    const information = {
        parameters: [],
        stats: {
            no_of_collinear_genes: alignmentList.reduce(function (acc, a) { return acc + a.links.length; }, 0),
            percentage: 0,
            no_of_all_genes: 0
        }
    };

    return {
        information: information,
        alignmentList: alignmentList,
        uniqueIDList: uniqueIDList.filter(onlyUnique)
    };
}

// Detect block orientation by comparing the direction of genomic positions
// between the first and last gene pair in the block.
// regular  = source and target progress in the same direction
// flipped  = source and target progress in opposite directions
function detectOrientation(links, genomeLibrary) {
    if (!genomeLibrary || links.length < 2) return 'regular';

    const first = links[0];
    const last = links[links.length - 1];

    const firstSrc = genomeLibrary.get(first.source);
    const lastSrc = genomeLibrary.get(last.source);
    const firstTgt = genomeLibrary.get(first.target);
    const lastTgt = genomeLibrary.get(last.target);

    if (!firstSrc || !lastSrc || !firstTgt || !lastTgt) return 'regular';

    const sourceDir = lastSrc.start - firstSrc.start;
    const targetDir = lastTgt.start - firstTgt.start;

    // Same sign → same direction → regular; opposite sign → flipped
    return (sourceDir * targetDir >= 0) ? 'regular' : 'flipped';
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
