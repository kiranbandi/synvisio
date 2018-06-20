/*global $ */
import axios from 'axios';
import processGFF from './processGFF';
import processCollinear from './processCollinear';
import toastr from './toastr';

var fetchData = {};

fetchData.getGenomicsData = function(sourceID) {

    return $.Deferred(function(defer) {
        // Loading the gff file  - Will Eventually be moved into the file loader container
        axios.get('assets/files/' + sourceID + '_coordinate.gff').then((coordinateFile) => {
            let { genomeLibrary, chromosomeMap } = processGFF(coordinateFile.data);
            axios.get('assets/files/' + sourceID + '_collinear.collinearity').then((collinearFile) => {
                let { information, alignmentList } = processCollinear(collinearFile.data);
                console.log('Data loading and processing complete...');
                defer.resolve({ genomeLibrary, chromosomeMap, information, alignmentList });
            }).catch(() => {
                defer.reject();
                toastr["error"]("Failed to fetch the collinearity file for source - " + sourceID, "ERROR");
            });
        }).catch(() => {
            defer.reject();
            toastr["error"]("Failed to fetch the coordinate files for source - " + sourceID, "ERROR");
        });
    }).promise();

}

module.exports = fetchData;