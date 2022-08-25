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

                let genomeEntry, genomeLibrary = new Map(), chromosomeMap = new Map();

                response.trim().split('\n').map((line) => {

                    genomeEntry = line.split("\t");
                    // 4 tab seperated entries , 1st in chromosome index , 2nd is unique gene id ,3rd and 4th are the start and end positions
                    let chromosomeId = genomeEntry[0],
                        speciesIdentifier = genomeEntry[0].slice(0, 2),
                        geneStart = parseInt(genomeEntry[2]),
                        geneEnd = parseInt(genomeEntry[3]),
                        geneId = genomeEntry[1];

                    if (chromosomeId.length >= 2 && (chromosomeId.length <= 25)) {
                        genomeLibrary.set(geneId, {
                            'start': geneStart,
                            'end': geneEnd,
                            // the first 2 characters are the genome name and can be removed
                            'chromosomeId': chromosomeId
                        })
                        // To create a list of the start and end of all chromosomes
                        if (!chromosomeMap.has(chromosomeId)) {
                            chromosomeMap.set(chromosomeId, {
                                start: geneStart,
                                end: geneEnd,
                                'speciesIdentifier': speciesIdentifier
                            });
                        } else {
                            var entry = chromosomeMap.get(chromosomeId);
                            if (geneStart < entry.start) {
                                entry.start = geneStart;
                            }
                            if (geneEnd > entry.end) {
                                entry.end = geneEnd;
                            }
                            chromosomeMap.set(chromosomeId, entry);
                        }
                    }
                });

                let windowStore = {}, windowSize = 1000000;
                chromosomeMap.forEach((chromosome, key) => {
                    let maxWindowCount = Math.ceil(chromosome.end / 1000000);
                    if (!windowStore[key]) {
                        windowStore[key] = [];
                    }
                    for (let i = 0; i < maxWindowCount; i++) {
                        windowStore[key].push({ 'chromosome': key, 'start': (i * windowSize) + (i == 0 ? 0 : 1), 'end': (i + 1) * windowSize, 'count': 0 });
                    }
                });

                genomeLibrary.forEach((gene, key) => {
                    let windowList = windowStore[gene.chromosomeId];
                    windowList[Math.floor(gene.start / windowSize)].count += 1;
                });

                return Promise.resolve(_.flatMap(windowStore));
            })
            // Process the pyadhore file and create a collinearity file
            .then((trackData) => {
                datastore = Object.assign(datastore, { trackData });
                return getFile('blast-file');
            })
            // process the pyadhore file
            .then((response) => {

                let blast_data = response.trim().split("\n")
                    .map(e => e.split('\t'))
                    .map(f => {
                        return {
                            'source': f[0].split(":")[0],
                            'target': {
                                'chromosome': f[1],
                                'start': f[2],
                                'end': f[3]
                            }
                        }
                    });

                const groupedBySource = _.groupBy(blast_data, e => e.source);

                let maxCount = 0, minCount = 0, textDownloadStore = {};

                _.map(_.keys(groupedBySource), sourceKey => {

                    const blast_data_grouped_by_target_chromosome = _.groupBy(groupedBySource[sourceKey], e => e.target.chromosome);

                    const updated_track = _.map(datastore.trackData, window_e => {

                        let count = 0;

                        _.map(blast_data_grouped_by_target_chromosome[window_e.chromosome], f => {
                            let start = +f.target.start,
                                end = +f.target.end;

                            // if end and start and flipped, invert them around
                            if (end < start) {
                                let copy = end;
                                end = start;
                                start = copy;
                            }

                            if (start >= +window_e.start && end <= +window_e.end) {
                                count += 1;
                            }
                        });

                        // check for new min and max
                        maxCount = count > maxCount ? count : maxCount;
                        minCount = count < minCount ? count : minCount;

                        return { ...window_e, count };
                    });

                    let remapped_track = _.map(updated_track, e => [e.chromosome, e.start, e.end, e.count].join("\t"));
                    textDownloadStore["track_data" + "_" + sourceKey + ".txt"] = remapped_track;
                });

                _.map(textDownloadStore, (text, fileName) => {
                    let blob = new Blob([["min=" + minCount + ",max=" + maxCount, ...text].join('\n')], { type: 'text/plain;charset=utf-8' });
                    FileSaver.saveAs(blob, fileName);
                });

            })
            .catch(() => { toastr["error"]("Failed to process the files , Please try again.", "ERROR") })
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