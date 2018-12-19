import sortAlphaNum from './sortAlphaNum';

export default (markers, alignmentList, selectedAlignment = {}) => {

    let sourceKeyList = markers.source,
        targetKeyList = markers.target,
        filteredList = [];


    _.each(alignmentList, (alignment) => {

        let { source, target, count, score, links } = alignment;

        // add boolean to show or hide alignment
        alignment.hidden = false;

        // add boolean to highlight an alignment 
        alignment.highlight = false;

        if (source && target) {



            // if the alignment is from source to target we return the alignment directly 
            if ((sourceKeyList.indexOf(source) > -1) && (targetKeyList.indexOf(target) > -1)) {

                // mulitple single level checks
                if (selectedAlignment.source) {
                    if ((selectedAlignment.source == source && selectedAlignment.target == target) || (selectedAlignment.target == source && selectedAlignment.source == target)) {
                        if (selectedAlignment.score == score && selectedAlignment.count == count) {
                            if (links[0].source == selectedAlignment.links[0].source || links[0].target == selectedAlignment.links[0].source)
                                alignment.highlight = true;
                        }
                    }
                }

                filteredList.push(alignment);

            }
            // if the alignment is from target to source we flip the alignment  
            if ((sourceKeyList.indexOf(target) > -1) && (targetKeyList.indexOf(source) > -1)) {


                // mulitple single level checks
                if (selectedAlignment.source) {
                    if ((selectedAlignment.source == source && selectedAlignment.target == target) || (selectedAlignment.target == source && selectedAlignment.source == target)) {
                        if (selectedAlignment.score == score && selectedAlignment.count == count) {
                            if (links[0].source == selectedAlignment.links[0].source || links[0].target == selectedAlignment.links[0].source)
                                alignment.highlight = true;
                        }
                    }
                }



                let flippedAlignment = _.clone(alignment);

                flippedAlignment.source = alignment.target;
                flippedAlignment.target = alignment.source;
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