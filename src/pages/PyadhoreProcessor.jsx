import React, { Component } from 'react';
import { FileUpload } from '../components';
import getFile from '../utils/getFile';
import toastr from '../utils/toastr';
import FileSaver from 'file-saver';


var header = "############### Parameters ###############" + "\n" +
    "# MATCH_SCORE: 0" + "\n" +
    "# MATCH_SIZE: 0" + "\n" +
    "# GAP_PENALTY: 0" + "\n" +
    "# OVERLAP_WINDOW: 0" + "\n" +
    "# E_VALUE: 0" + "\n" +
    "# MAX GAPS: 0" + "\n" +
    "############### Statistics ###############" + "\n" +
    "# Number of collinear genes: 0, Percentage: 0" + "\n" +
    "# Number of all genes: 0" + "\n" +
    "##########################################" + "\n";

export default class PyadhoreProcessor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isProcessing: false
        }
    }

    onUpload = () => {

        this.setState({ isProcessing: true });

        var datastore = {};

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
                    _.map(cGroup, (geneEntry) => {
                        gffFileList.push([geneEntry[1], geneEntry[0], geneEntry[5], geneEntry[6]]);
                    })
                });
                saveFile(_.map(gffFileList, (d) => d.join('\t')).join('\n'), 'example.gff');
                return Promise.resolve(gffFileList);
            })
            // Process the pyadhore file and create a collinearity file
            .then((data) => {
                datastore = Object.assign(datastore, { 'gffFileList': data });
                return getFile('pyadhore-file');
            })
            // process the pyadhore file
            .then((adhoreResponse) => {
                var adhoreLines = adhoreResponse.split('\n').slice(1).map((d) => d.split(',')),
                    // filter out multiplicons of order 2 or above
                    modifiedLines = _.map(_.filter(adhoreLines, (e) => e.length > 2), (d) => {
                        d[10] = d[2].slice(0, 2) + d[3];
                        return d;
                    }),
                    groupedByBlock = _.groupBy(modifiedLines, (d) => d[1]);

                const alignmentText = [];

                // filter only multiplicons of level 2
                _.map(_.filter(groupedByBlock, (d) => d.length == 2), (alignment, aindex) => {
                    const alignmentTitle = '## ' + 'Alignment '
                        + aindex + ": " + "score=100 e_value=0 N=2 "
                        + alignment[0][10] + '&' + alignment[1][10] + " plus";
                    const alignmentContent1 = [aindex, alignment[0][4], alignment[1][4], '0'].join('\t');
                    const alignmentContent2 = [aindex, alignment[0][5], alignment[1][5], '0'].join('\t');
                    alignmentText.push([alignmentTitle, alignmentContent1, alignmentContent2].join('\n'));
                });

                saveFile(header + alignmentText.join('\n'), 'example.collinearity');
            })
            .catch(() => {
                debugger;

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


function saveFile(fileData, filename) {
    var blob = new Blob([fileData], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, filename);
}