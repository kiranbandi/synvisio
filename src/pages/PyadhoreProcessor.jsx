import React, { Component } from 'react';
import { FileUpload } from '../components';
import getFile from '../utils/getFile';
import toastr from '../utils/toastr';
import FileSaver from 'file-saver';

export default class PyadhoreProcessor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isProcessing: false
        }
    }

    onUpload = () => {

        this.setState({ isProcessing: true });

        // load the coordinate file
        getFile('genelist-file')
            // process the file in the main thread
            .then((response) => {
                var dataLines = response.split('\n').slice(1).map((d) => d.split(',')),
                    modifiedLines = _.map(_.filter(dataLines, (e) => e.length > 2), (d) => {
                        d[1] = d[4].slice(0, 2) + d[1];
                        return d;
                    }),
                    groupedByChromosome = _.groupBy(modifiedLines, (d) => d[1]);

                var gffFileList = [];
                _.map(groupedByChromosome, (cGroup) => {
                    gffFileList.push([cGroup[0], cGroup[1], cGroup[5], cGroup[6]].join('\t'));
                });
                var gffFileContent = gffFileList.join('\n');



            })
            // // store the data and then load the collinear file
            // .then((data) => {
            //     datastore = Object.assign(datastore, { ...data });
            //     return getFile('collinear-file');
            // })
            // // process the collinear file
            // .then(((response) => { return processFile(response, 'collinear') }))
            // // store the collinear data and load the track file if one is provided
            // .then((data) => {

            //     let { information, alignmentList, uniqueIDList } = data, { chromosomeMap } = datastore;

            //     if (!showAllScaffolds) {
            //         [...chromosomeMap].map((entry) => {
            //             if (uniqueIDList.indexOf(entry[0]) == -1) {
            //                 chromosomeMap.delete(entry[0]);
            //                 console.log('deleted entry', entry[0]);
            //             }
            //         });
            //     }

            //     datastore = Object.assign({}, datastore, { information, alignmentList, chromosomeMap });
            //     console.log(datastore);

            //     return trackFiles[0] ? getFile('track-file-0') : Promise.resolve(false);
            // })
            .catch(() => {
                toastr["error"]("Failed to process the files , Please try again.", "ERROR");
            })
            .finally(() => { this.setState({ isProcessing: false }) });

    }

    render() {

        const { isProcessing = false } = this.state;

        return (
            <div className="configuration-container">
                <div className="container">
                    <div className='upload-panel'>
                        <h2 className='text-primary m-t-lg configuration-sub-title'>Upload Pyadhore Files</h2>
                        <FileUpload id='genelist-file' label='Genelist File (CSV)' />
                        <FileUpload id='pyadhore-file' label='Pyadhore Output File (CSV)' />
                        {isProcessing && <h4 className='loading-text'>Processing data...</h4>}
                        <button className="btn btn-primary-outline m-t" onClick={this.onUpload}> UPLOAD </button>
                    </div>
                </div>
            </div>
        )
    }
};

