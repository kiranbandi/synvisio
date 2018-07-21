/*global $ */
import React, { Component } from 'react';
import { FileUpload, Loader } from '../components';
import getFile from '../utils/getFile';
import processGFF from '../utils/processGFF';
import processCollinear from '../utils/processCollinear';
import toastr from '../utils/toastr';
import { configureSourceID, setGenomicData, setALignmentList } from '../redux/actions/actions';

export default class Configuration extends Component {

  constructor(props) {
    super(props);
    this.onUpload = this.onUpload.bind(this);
    this.state = {
      loading: false
    };
  }

  onUpload() {

    let dataStore = {};
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

    }).always(() => {
      // turn off loader
      this.setState({ loading: false });
    });

  }




  render() {
    return (
      <div className="configuration-container">
        <div className="container">

          <div className='upload-panel'>
            <h2 className='text-primary m-t-lg'>Upload Collinearity Files</h2>
            <FileUpload id='collinear-file' label='MCScanX Collinearity File' />
            <FileUpload id='coordinate-file' label='GFF File' />
            {this.state.loading ? <Loader /> : <button className="btn btn-primary-outline m-t-md" onClick={this.onUpload}> UPLOAD </button>}
          </div>

        </div>
      </div>
    )
  }
};



