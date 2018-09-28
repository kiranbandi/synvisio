/*global $ */
import axios from 'axios';
import processGFF from './processGFF';
import processCollinear from './processCollinear';
import processTrackFile from './processTrackFile';
import toastr from './toastr';

var fetchData = {};

fetchData.getGenomicsData = function(sourceID) {

    return new Promise((resolve, reject) => {

        var datastore = {};

        axios.get('assets/files/' + sourceID + '_coordinate.gff')
            .catch(() => { errorCallback(defer, sourceID) })
            .then((response) => { return processGFF(response.data) })
            .then((data) => {
                datastore = Object.assign(datastore, {...data });
                return axios.get('assets/files/' + sourceID + '_collinear.collinearity')
            })
            .catch(() => { errorCallback(defer, sourceID) })
            .then(((response) => { return processCollinear(response.data) }))
            .then((data) => {
                datastore = Object.assign({}, datastore, {...data });

            })


    });

    return $.Deferred(function(defer) {
        // Loading the gff file  - Will Eventually be moved into the file loader container
        axios.get('assets/files/' + sourceID + '_coordinate.gff').then((coordinateFile) => {
            let { genomeLibrary, chromosomeMap } = processGFF(coordinateFile.data);
            axios.get('assets/files/' + sourceID + '_collinear.collinearity').then((collinearFile) => {
                processCollinear(collinearFile.data).then((data) => {
                    let { information, alignmentList } = data;
                    console.log('Data loading and processing complete...');
                    // optional load gene count , if load fails simply continue with other files
                    axios.get('assets/files/' + sourceID + '_gene_count.txt').then((trackFile) => {
                        let trackData = processTrackFile(trackFile.data);
                        defer.resolve({ genomeLibrary, chromosomeMap, information, alignmentList, trackData });
                    }).catch(() => { defer.resolve({ genomeLibrary, chromosomeMap, information, alignmentList, trackData: false }); });
                })

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

function errorCallback(defer, sourceID) {
    defer.reject();
    toastr["error"]("Failed to fetch the required files for source - " + sourceID, "ERROR");
}


module.exports = fetchData;