import React, { Component } from 'react';
import { FileUpload, RadioButton } from '../components';
import getFile from '../utils/getFile';
import processFile from '../utils/processFile';
import toastr from '../utils/toastr';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  configureSourceID, setGenomicData, setPlotProps,
  setLoaderState, setTrackType, setMultiLevelType
} from '../redux/actions/actions';

class Configuration extends Component {

  constructor(props) {
    super(props);

    this.state = {
      processScaffolds: false,
      showAllScaffolds: false

    };
    this.onUpload = this.onUpload.bind(this);
    this.uploadRadioChange = this.uploadRadioChange.bind(this);
    this.radioChange = this.radioChange.bind(this);
    this.multiRadioChange = this.multiRadioChange.bind(this);
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



  radioChange(event) {
    const value = event.target.value;
    if (value.indexOf('level') > -1) {
      this.props.actions.setPlotProps('level', value == 'level-multi');
    }
    else if (value.indexOf('track') > -1) {
      this.props.actions.setTrackType(value);
    }
    else {
      this.props.actions.setPlotProps('type', value);
    }
  }
  multiRadioChange(event) {
    const value = event.target.value;
    this.props.actions.setMultiLevelType(value);
  }

  onUpload() {

    let datastore = {};
    const { actions, multiLevel } = this.props,
      { processScaffolds, showAllScaffolds } = this.state,
      { configureSourceID, setGenomicData, setLoaderState } = actions;

    // Turn on loader to indicate file uploading and processing 
    setLoaderState(true);
    configureSourceID('bn', multiLevel);
    const isTrackFileAvailable = document.getElementById('track-file').files.length > 0;


    // load the coordinate file
    getFile('coordinate-file')
      // process the file in a seperate thread
      .then((response) => { return processFile(response, 'gff', { processScaffolds }) })
      // store the data and then load the collinear file
      .then((data) => {
        datastore = Object.assign(datastore, { ...data });
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
        return isTrackFileAvailable ? getFile('track-file') : Promise.resolve('false');
      })
      // process trackfile data is present
      .then((data) => {
        return isTrackFileAvailable ? processFile(data, 'track') : Promise.resolve('false');
      })
      .then((trackData) => {
        if (isTrackFileAvailable) {
          datastore.trackData = trackData;
        }
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

    const { sourceID = '', multiLevel, multiLevelType = 'hive',
      plotType, trackType, loaderState = false } = this.props,
      { processScaffolds, showAllScaffolds } = this.state;

    return (
      <div className="configuration-container">
        <div className="container">

          <div className='upload-panel'>
            <h2 className='text-primary m-t-lg configuration-sub-title'>Upload Collinearity Files</h2>
            <FileUpload id='collinear-file' label='MCScanX Collinearity File' />
            <FileUpload id='coordinate-file' label='GFF File' />
            <FileUpload id='track-file' label='Track File (optional)' />
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

            <div className="">
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

            {loaderState && <h4 className='loading-text'>Loading data...</h4>}
            <button className="btn btn-primary-outline m-t" onClick={this.onUpload}> UPLOAD </button>
          </div>

          <div className='plot-type-panel'>
            <h2 className='text-primary m-t-lg configuration-sub-title'>Plot Characterisitics</h2>
            <RadioButton value={'level-multi'} id={'level-multi'} className='conf-radio' name='level-select'
              label={"Multi-Level Analysis"}
              onChange={this.radioChange}
              checked={multiLevel} />
            <RadioButton value={'level-single'} id={'level-single'} className='conf-radio' name='level-select'
              label={"Single Analysis"}
              onChange={this.radioChange}
              checked={!multiLevel} />

            {
              !multiLevel && <div>
                <RadioButton value={'dashboard'} id={'dashboard'} className='conf-radio' name='plot-select'
                  label={"Default Dashboard"}
                  onChange={this.radioChange}
                  checked={plotType == 'dashboard'} />
                <RadioButton value={'dotplot'} id={'dotplot'} className='conf-radio' name='plot-select'
                  label={"Dot Plot"}
                  onChange={this.radioChange}
                  checked={plotType == 'dotplot'} />
                <RadioButton value={'linearplot'} id={'linearplot'} className='conf-radio' name='plot-select'
                  label={"Linear PLot"}
                  onChange={this.radioChange}
                  checked={plotType == 'linearplot'} />
              </div>
            }

            {
              multiLevel && <div>
                <RadioButton value={'tree'} id={'tree'} className='conf-radio' name='multi-view-select'
                  label={"Tree View"}
                  onChange={this.multiRadioChange}
                  checked={multiLevelType == 'tree'} />
                <RadioButton value={'hive'} id={'hive'} className='conf-radio' name='multi-view-select'
                  label={"Hive View"}
                  onChange={this.multiRadioChange}
                  checked={multiLevelType == 'hive'} />
                <RadioButton value={'cube'} id={'cube'} className='conf-radio' name='multi-view-select'
                  label={"3D Cube View"}
                  onChange={this.multiRadioChange}
                  checked={multiLevelType == 'cube'} />
              </div>
            }


            {
              (plotType == 'linearplot' || plotType == 'dotplot') && (!multiLevel) && < div >
                <h4 className="sub-info">If a track file has been provided choose one of the following options to view tracks , this feature is only available for dotplots and linearplots -</h4>
                <RadioButton value={'track-heatmap'} id={'track-heatmap'} className='conf-radio' name='track-select'
                  label={"Heatmap"}
                  onChange={this.radioChange}
                  checked={trackType == 'track-heatmap'} />
                <RadioButton value={'track-histogram'} id={'track-histogram'} className='conf-radio' name='track-select'
                  label={"Histogram"}
                  onChange={this.radioChange}
                  checked={trackType == 'track-histogram'} />

                <RadioButton value={'track-line'} id={'track-line'} className='conf-radio' name='track-select'
                  label={"Line"}
                  onChange={this.radioChange}
                  checked={trackType == 'track-line'} />
                <RadioButton value={'track-scatter'} id={'track-scatter'} className='conf-radio' name='track-select'
                  label={"Scatter"}
                  onChange={this.radioChange}
                  checked={trackType == 'track-scatter'} />
              </div>
            }

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
    actions: bindActionCreators({ configureSourceID, setMultiLevelType, setGenomicData, setPlotProps, setLoaderState, setTrackType }, dispatch)
  };
}

function mapStateToProps(state) {
  return {
    sourceID: state.oracle.sourceID,
    multiLevel: state.oracle.multiLevel,
    multiLevelType: state.oracle.multiLevelType,
    plotType: state.oracle.plotType,
    loaderState: state.oracle.loaderState,
    trackType: state.oracle.trackType
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Configuration);

