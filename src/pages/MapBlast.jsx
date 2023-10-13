import React, { Component } from 'react';
import { FileUpload } from '../components';
import getFile from '../utils/getFile';
import toastr from '../utils/toastr';
import FileSaver from 'file-saver';
import _ from 'lodash';


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
        getFile('gff-file')
            // process the file in the main thread
            .then((response) => {


                let blastArrayHolder = [];

                response.trim().split('\n').map((line) => {

                    let genomeEntry = line.split("\r").join('').split(",");

                    let AGenes = genomeEntry.slice(1, 4);
                    let BGenes = genomeEntry.slice(4);

                    AGenes.map((AGene, AGeneIndex) => {
                        BGenes.map((BGene, BGeneIndex) => {
                            if (AGene !== 'x' && BGene !== 'x') {
                                let blastEntry = [AGene, BGene, '97.600', '625', '15', '0', '2', '626', '272', '896', '0.0', '1072']
                                blastArrayHolder.push(blastEntry.join('\t'));
                            }
                        });
                    });
                });

                let blob = new Blob([blastArrayHolder.join('\n')], { type: 'text/plain;charset=utf-8' });
                FileSaver.saveAs(blob, 'topas.blast');

            })
            .catch(() => { debugger})
            .finally(() => { this.setState({ isProcessing: false }) });

    }

    render() {

        const { isProcessing = false } = this.state;

        return (
            <div className="configuration-container">
                <div className="container">
                    <div className='upload-panel'>
                        <h2 className='text-primary m-t-lg configuration-sub-title'>Upload Blast and Reference GFF File</h2>
                        <FileUpload id='gff-file' label='GFF File' />
                        <FileUpload id='blast-file' label='Blast File' />
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