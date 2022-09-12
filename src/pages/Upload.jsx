import React, { Component } from 'react';
import { FileUpload, RadioButton } from '../components';
import getFile from '../utils/getFile';
import processFile from '../utils/processFile';
import toastr from '../utils/toastr';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { configureSourceID, setGenomicData, setLoaderState } from '../redux/actions/actions';

class Upload extends Component {

  constructor(props) {
    super(props);

    this.state = {
      processScaffolds: false,
      showAllScaffolds: false

    };
    this.onUpload = this.onUpload.bind(this);
    this.uploadRadioChange = this.uploadRadioChange.bind(this);

  }

  uploadRadioChange(event) {
    let value = event.target.value, { processScaffolds, showAllScaffolds } = this.state;
    if (value.indexOf('scaffold') > -1) {
      processScaffolds = value.indexOf('no') > -1;
    }
    else {
      showAllScaffolds = value.indexOf('no') > -1;
    }
    this.setState({ processScaffolds, showAllScaffolds });
  }

  onUpload() {

    let datastore = { trackData: [], colorMap: {} };
    const { actions, multiLevel } = this.props,
      { processScaffolds, showAllScaffolds } = this.state,
      { configureSourceID, setGenomicData, setLoaderState } = actions;

    // Turn on loader to indicate file uploading and processing 
    setLoaderState(true);
    configureSourceID('bn', multiLevel);

    // check the number of tracks files that are available to process
    let trackFiles = _.map([0, 1, 2, 3, 4, 5, 6], (d) => document.getElementById('track-file-' + d).files.length > 0);

    // check if color palette is available 
    let isColorMapAvailable = document.getElementById('color-map-file').files.length > 0;

    // load the coordinate file
    getFile('coordinate-file')
      // process the file in a seperate thread
      .then((response) => { return processFile(response, 'gff', { processScaffolds }) })
      // store the data and then load the collinear file
      .then((data) => {
        datastore = Object.assign(datastore, { ...data });
        // If the user  wants to ignore scaffolds but no chromosomes were found, the flag would be overridden and scaffold filtering would be bypassed.
        if (data.scaffoldBypassed && !processScaffolds) {
          alert(`Automatic scaffold region filtering has been overridden, as no chromosomes were found in your gff file.\n\nThis might be due to mischaracterisation of actual chromosomes as scaffolds by SynVisio as they dont follow the two character naming convention.\n\nAll scaffolds will now be considered chromsomes instead so you should be able to choose them in the dashboard.`);
        }

        return getFile('collinear-file');
      })
      // process the collinear file
      .then(((response) => { return processFile(response, 'collinear') }))
      // store the collinear data and load the track file if one is provided
      .then((data) => {

        let { information, alignmentList, uniqueIDList } = data, { chromosomeMap } = datastore;

        if (!showAllScaffolds) {
          [...chromosomeMap].map((entry) => {
            if (uniqueIDList.indexOf(entry[0]) == -1) {
              chromosomeMap.delete(entry[0]);
              console.log('deleted entry', entry[0]);
            }
          });
        }
        datastore = Object.assign({}, datastore, { information, alignmentList, chromosomeMap });
        return isColorMapAvailable ? getFile('color-map-file') : Promise.resolve(false);
      })
      .then((colorData) => {
        if (colorData) {
          let colorMap = {};
          colorData.trim().split('\n').map((d) => d.split('\t')).map((e) => colorMap[e[0]] = e[1]);
          datastore.colorMap = colorMap;
        }
        return trackFiles[0] ? getFile('track-file-0') : Promise.resolve(false);
      })
      // process 1st trackfile data if present
      .then((data) => {
        return trackFiles[0] ? processFile(data, 'track', { processScaffolds }) : Promise.resolve(false);
      })
      .then((trackData) => {
        datastore.trackData.push(trackData);
        return trackFiles[1] ? getFile('track-file-1') : Promise.resolve(false);
      })
      // process 2st trackfile data if present
      .then((data) => {
        return trackFiles[1] ? processFile(data, 'track', { processScaffolds }) : Promise.resolve(false);
      })
      .then((trackData) => {
        datastore.trackData.push(trackData);
        return trackFiles[2] ? getFile('track-file-2') : Promise.resolve(false);
      })
      // process 3rd trackfile data if present
      .then((data) => {
        return trackFiles[2] ? processFile(data, 'track', { processScaffolds }) : Promise.resolve(false);
      })
      .then((trackData) => {
        datastore.trackData.push(trackData);
        return trackFiles[3] ? getFile('track-file-3') : Promise.resolve(false);
      })
      // process 4th trackfile data if present
      .then((data) => {
        return trackFiles[3] ? processFile(data, 'track', { processScaffolds }) : Promise.resolve(false);
      })
      .then((trackData) => {
        datastore.trackData.push(trackData);
        return trackFiles[4] ? getFile('track-file-4') : Promise.resolve(false);
      })
      // process 3rd trackfile data if present
      .then((data) => {
        return trackFiles[4] ? processFile(data, 'track', { processScaffolds }) : Promise.resolve(false);
      })
      .then((trackData) => {
        datastore.trackData.push(trackData);
        return trackFiles[5] ? getFile('track-file-5') : Promise.resolve(false);
      })
      // process 3rd trackfile data if present
      .then((data) => {
        return trackFiles[5] ? processFile(data, 'track', { processScaffolds }) : Promise.resolve(false);
      })
      .then((trackData) => {
        datastore.trackData.push(trackData);
        return trackFiles[6] ? getFile('track-file-6') : Promise.resolve(false);
      })
      // process 3rd trackfile data if present
      .then((data) => {
        return trackFiles[6] ? processFile(data, 'track', { processScaffolds }) : Promise.resolve(false);
      })
      .then((trackData) => {
        datastore.trackData.push(trackData);
        // update the sourceID set in the state with the new sourceID
        configureSourceID('uploaded-source', multiLevel);
        // set the genomic data
        setGenomicData(datastore);
      })
      .catch(() => {
        toastr["error"]("Failed to upload the files , Please try again.", "ERROR");
      })
      .finally(() => { setLoaderState(false); });

  }

  render() {

    const { sourceID = '', loaderState = false } = this.props,
      { processScaffolds, showAllScaffolds } = this.state;

    return (
      <div className="configuration-container">
        <div className="container">
          <div className='upload-panel'>
            <h2 className='text-primary m-t-lg configuration-sub-title'>Upload Collinearity Files</h2>
            <FileUpload id='collinear-file' label='MCScanX Collinearity File' />
            <FileUpload id='coordinate-file' label='GFF File' />
            <h4 className='text-primary m-t' style={{ 'lineHeight': '25px' }}>
              You can upload upto 4 track files, these however are only visible in some charts
              and not all.Tracks are also scaled automatically based on the minimum and maximum
              values in the file, however if you want to set a custom scale such as (0,100) or (0,1),
              please set the values in the first line of the track file being uploaded in the
              format "<b>min=0,max=100</b>".
            </h4>
            <FileUpload id='track-file-0' label='Track File 1 (optional)' />
            <FileUpload id='track-file-1' label='Track File 2 (optional)' />
            <FileUpload id='track-file-2' label='Track File 3 (optional)' />
            <FileUpload id='track-file-3' label='Track File 4 (optional)' />
            <FileUpload id='track-file-4' label='Track File 5 (optional)' />
            <FileUpload id='track-file-5' label='Track File 6 (optional)' />
            <FileUpload id='track-file-6' label='Track File 7 (optional)' />
            <div className="m-t-md">
              <h4 className="sub-info">Would you like to ignore Scaffold regions ?</h4>
              <RadioButton value={'scaffold-yes'} id={'scaffold-yes'} className='conf-radio' name='scaffold-select'
                label={"Yes"}
                onChange={this.uploadRadioChange}
                checked={!processScaffolds} />
              <RadioButton value={'scaffold-no'} id={'scaffold-no'} className='conf-radio' name='scaffold-select'
                label={"No"}
                onChange={this.uploadRadioChange}
                checked={processScaffolds} />
            </div>

            <div>
              <h4 className="sub-info">Would you like to ignore chromosomes and scaffolds without any alignments in them ? </h4>
              <h4 className="sub-info">(This will reduce the number of options to filter through while picking the source and target chromosomes or scaffolds in the dashboard)</h4>

              <RadioButton value={'showAllScaffold-yes'} id={'showAllScaffold-yes'} className='conf-radio' name='showAllScaffold-select'
                label={"Yes"}
                onChange={this.uploadRadioChange}
                checked={!showAllScaffolds} />
              <RadioButton value={'showAllScaffold-no'} id={'showAllScaffold-no'} className='conf-radio' name='showAllScaffold-select'
                label={"No"}
                onChange={this.uploadRadioChange}
                checked={showAllScaffolds} />
            </div>

            <div className='m-t m-b experimental-banner'>
              <h4 className="sub-info"> (New Experimental Feature) Upload a color template file to have your custom color scheme for the chromosomes instead of the default color palette provided by SynVisio. Refer to the <a target='_blank' href='./assets/files/sample_color_template.txt'>sample file</a> for the format (tab seperated with chromosome ids and color hex codes).</h4>
              <FileUpload id='color-map-file' label='Color Template File' />
            </div>

            {loaderState && <h4 className='loading-text'>Loading data...</h4>}
            <button className="btn btn-primary-outline m-t" onClick={this.onUpload}> UPLOAD </button>
          </div>

          {sourceID == 'uploaded-source' && <div className="alert alert-success m-t m-b">
            <strong>Upload Complete !</strong> Your files have been processed . Head over to the <strong>dashboard</strong> to view the results.
          </div>}

        </div>
      </div>
    )
  }
};


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ configureSourceID, setGenomicData, setLoaderState }, dispatch)
  };
}

function mapStateToProps(state) {
  return {
    sourceID: state.oracle.sourceID,
    multiLevel: state.oracle.multiLevel,
    multiLevelType: state.oracle.multiLevelType,
    plotType: state.oracle.plotType,
    loaderState: state.oracle.loaderState
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Upload);

