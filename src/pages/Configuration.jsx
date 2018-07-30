import React, { Component } from 'react';
import { FileUpload, RadioButton } from '../components';
import getFile from '../utils/getFile';
import processGFF from '../utils/processGFF';
import processCollinear from '../utils/processCollinear';
import toastr from '../utils/toastr';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { configureSourceID, setGenomicData, setPlotProps } from '../redux/actions/actions';

class Configuration extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this.onUpload = this.onUpload.bind(this);
    this.radioChange = this.radioChange.bind(this);
  }

  radioChange(event) {
    const value = event.target.value;
    if (value.indexOf('level') > -1) {
      this.props.actions.setPlotProps('level', value == 'level-multi');
    }
    else {
      this.props.actions.setPlotProps('type', value);
    }
  }

  onUpload() {

    let dataStore = {};
    const { actions, multiLevel } = this.props,
      { configureSourceID, setGenomicData } = actions;

    // Turn on loader to indicate file uploading and processing 
    this.setState({ loading: true });

    getFile('coordinate-file').then((data) => {
      const { genomeLibrary, chromosomeMap } = processGFF(data);
      dataStore = { genomeLibrary, chromosomeMap };
      return getFile('collinear-file');
    }).then((data) => {
      const { information, alignmentList } = processCollinear(data);
      dataStore = { ...dataStore, information, alignmentList }
    }).fail(() => {
      toastr["error"]("Failed to upload the files , Please try again.", "ERROR");
    }).done(() => {
      // update the sourceID set in the state with the new sourceID
      configureSourceID('uploaded-source', multiLevel);
      // set the genomic data
      setGenomicData(dataStore);
    }).always(() => {
      // turn off loader
      this.setState({ loading: false });
    });
  }

  render() {

    const { sourceID = '', multiLevel, plotType } = this.props;
    return (
      <div className="configuration-container">
        <div className="container">

          <div className='upload-panel'>
            <h2 className='text-primary m-t-lg configuration-sub-title'>Upload Collinearity Files</h2>
            <FileUpload id='collinear-file' label='MCScanX Collinearity File' />
            <FileUpload id='coordinate-file' label='GFF File' />
            {this.state.loading ? <h4 className='loading-text'>Loading data...</h4> : <button className="btn btn-primary-outline m-t" onClick={this.onUpload}> UPLOAD </button>}
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
                  label={"Default"}
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
    actions: bindActionCreators({ configureSourceID, setGenomicData, setPlotProps }, dispatch)
  };
}

function mapStateToProps(state) {
  return {
    sourceID: state.oracle.sourceID,
    multiLevel: state.oracle.multiLevel,
    plotType: state.oracle.plotType
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Configuration);

