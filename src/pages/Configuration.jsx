import React, { Component } from 'react';
import { FileUpload, RadioButton } from '../components';
import getFile from '../utils/getFile';
import processGFF from '../utils/processGFF';
import processCollinear from '../utils/processCollinear';
import processTrackFile from '../utils/processTrackFile';
import toastr from '../utils/toastr';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { configureSourceID, setGenomicData, setPlotProps, setLoaderState, setTrackType } from '../redux/actions/actions';
import { setTimeout } from 'timers';

class Configuration extends Component {

  constructor(props) {
    super(props);
    this.onUpload = this.onUpload.bind(this);
    this.radioChange = this.radioChange.bind(this);
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

  onUpload() {

    let dataStore = {};
    const { actions, multiLevel } = this.props,
      { configureSourceID, setGenomicData, setLoaderState } = actions;

    // Turn on loader to indicate file uploading and processing 
    setLoaderState(true);
    configureSourceID('bn', multiLevel);

    // Trigger loading after 1 second delay to - Temp Bug Fix
    setTimeout(() => {
      getFile('coordinate-file').then((data) => {
        // coordinate file
        const { genomeLibrary, chromosomeMap } = processGFF(data);
        dataStore = { genomeLibrary, chromosomeMap };
        return getFile('collinear-file');
      }).then((data) => {
        // collinear file
        const { information, alignmentList } = processCollinear(data);
        dataStore = { ...dataStore, information, alignmentList };
        // If track file is provided load it up too
        if (document.getElementById('track-file').files.length > 0) {
          return getFile('track-file');
        }
        else {
          return $.Deferred(function (defer) { defer.resolve(false); }).promise();
        }
      }).then((data) => {
        // track file if provided 
        if (data) {
          dataStore.trackData = processTrackFile(data);
        }
      })
        .fail(() => {
          toastr["error"]("Failed to upload the files , Please try again.", "ERROR");
        }).done(() => {
          // update the sourceID set in the state with the new sourceID
          configureSourceID('uploaded-source', multiLevel);
          // set the genomic data
          setGenomicData(dataStore);
        }).always(() => {
          // turn off loader
          setLoaderState(false);
        });
    }, 1000);


  }

  render() {

    const { sourceID = '', multiLevel, plotType, trackType, loaderState = false } = this.props;
    return (
      <div className="configuration-container">
        <div className="container">

          <div className='upload-panel'>
            <h2 className='text-primary m-t-lg configuration-sub-title'>Upload Collinearity Files</h2>
            <FileUpload id='collinear-file' label='MCScanX Collinearity File' />
            <FileUpload id='coordinate-file' label='GFF File' />
            <FileUpload id='track-file' label='Track File (optional)' />
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
    actions: bindActionCreators({ configureSourceID, setGenomicData, setPlotProps, setLoaderState, setTrackType }, dispatch)
  };
}

function mapStateToProps(state) {
  return {
    sourceID: state.oracle.sourceID,
    multiLevel: state.oracle.multiLevel,
    plotType: state.oracle.plotType,
    loaderState: state.oracle.loaderState,
    trackType: state.oracle.trackType
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Configuration);

