// worker written in vanilla javascript 
export function process(orthologueData) {
    var FileLines = orthologueData.split('\n'),
        alignmentList = [],
        alignmentBuffer = {};
    // process file line by line
    FileLines.forEach(function(line, index) {
            if (line.indexOf('Alignment') > -1) {
                // store the previous alignment in list , 
                // and skip for the first iteration since buffer is empty
                if (alignmentBuffer.links) {
                    alignmentList.push(alignmentBuffer);
                }
                alignmentBuffer = parseAlignmentDetails(line);
                alignmentBuffer.links = [];
            } else if (line.trim().length > 1) {
                // condition to skip empty lines
                alignmentBuffer.links.push(parseLink(line));
            }
        })
        // push the last alignment still in the buffer
    alignmentList.push(alignmentBuffer);

    return { "information": false, "alignmentList": alignmentList };
};


function parseAlignmentDetails(alignmentDetails) {

    let alignmentDetailsList = alignmentDetails.split(' ');
    const isReverse = (alignmentDetails.indexOf('reverse') > -1);

    return {
        'score': Number(alignmentDetailsList[isReverse ? 11 : 10].trim()),
        'e_value': isReverse ? 0 : Number('1e-50'),
        'count': Number(alignmentDetailsList[isReverse ? 15 : 14].slice(0, -2).trim()),
        'type': isReverse ? 'flipped' : 'regular',
        'source': alignmentDetailsList[2].trim(),
        'target': alignmentDetailsList[4].trim(),
    };
}

function parseLink(link) {
    let linkInfo = link.split("\t");
    return {
        'source': linkInfo[1].trim(),
        'target': linkInfo[5].trim(),
        'e_value': link.split('\t')[8].trim(),
        'score': link.split('\t')[9].trim()
    };
}