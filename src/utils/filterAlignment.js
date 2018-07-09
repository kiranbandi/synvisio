import sortAlphaNum from './sortAlphaNum';

export default (markers, alignmentList) => {

    let sourceKeyList = markers.source,
        targetKeyList = markers.target,
        filteredList = [];

    _.each(alignmentList, (alignment) => {

        let { source, target } = alignment;

        // add boolean to show or hide alignment
        alignment.hidden = false;

        if (source && target) {
            // if the alignment is from source to target we return the alignment directly 
            if ((sourceKeyList.indexOf(source) > -1) && (targetKeyList.indexOf(target) > -1)) {
                filteredList.push(alignment);
            }
            // if the alignment is from target to source we flip the alignment  
            if ((sourceKeyList.indexOf(target) > -1) && (targetKeyList.indexOf(source) > -1)) {

                let flippedAlignment = _.clone(alignment);

                flippedAlignment.source = alignment.target;
                flippedAlignment.target = alignment.source;
                flippedAlignment.sourceKey = alignment.targetKey;
                flippedAlignment.targetKey = alignment.sourceKey;
                flippedAlignment.links = _.map(alignment.links, (link) => {
                    return {
                        'source': link.target,
                        'target': link.source,
                        'e_value': link.e_value
                    };
                });
                filteredList.push(flippedAlignment);
            }
        }
    });
    return filteredList.sort(sortAlphaNum('source'));
}