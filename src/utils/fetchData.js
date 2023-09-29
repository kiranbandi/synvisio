/*global $ */
import axios from 'axios';
import processFile from './processFile';
import toastr from './toastr';

var fetchData = {};

fetchData.getGenomicsData = function (collinearityFile = '', gffFile = '', trackFile = '', configFile) {
    return new Promise((resolve, reject) => {
        var datastore = {};
        // get the coordinate file
        axios.get(gffFile)
            // process the coordinate file 
            .then((response) => { return processFile(response.data, 'gff') })
            // get the collinear file
            .then((data) => {
                datastore = Object.assign(datastore, { ...data });
                return axios.get(collinearityFile);
            })
            // process the collinear file
            .then(((response) => {
                return processFile(response.data, 'collinear');
            }))
            // if there is an error in any of the above paths reject the promise and stop the promise chain below too
            .catch((err) => {
                toastr["error"]("Failed to fetch and parse required files for source - " + sourceID, "ERROR");
                reject();
                return Promise.reject(err);
            })
            // if everything above was successful try to load the track data
            .then((data) => {
                datastore = Object.assign({}, datastore, { ...data });
                console.log('Data loading and processing complete...');
                return axios.get(trackFile);
            })
            // if the data is not present resolve the promise without the track data
            .then((response) => { return processFile(response.data, 'track') })
            .then((trackData) => { resolve({ ...datastore, trackData: [trackData] }); })
            .catch(() => { resolve({ ...datastore, trackData: [false] }); })
    });
}

module.exports = fetchData;