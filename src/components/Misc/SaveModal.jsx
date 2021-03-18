/*global $*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toggleModalVisbility } from '../../redux/actions/actions';
import Loading from 'react-loading';
import uniqid from 'uniqid';
import ParseSVG from '../../utils/ParseSVG';
import toastr from '../../utils/toastr';
import svgSaver from '../../utils/saveSVGasPNG';
import { saveAs } from 'file-saver';

// sample Modal than can be used when needed but is not in use currently

class Modal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: 0,
            selectedType: 'PNG',
            loaderON: false,
            exportScale: 1
        };
        this.closeModal = this.closeModal.bind(this);
        this.selectChange = this.selectChange.bind(this);
        this.downloadImage = this.downloadImage.bind(this);
    }

    selectChange(event) {
        this.setState({ [event.target.id]: event.target.value })
    }

    closeModal(event) {
        event.preventDefault();
        this.props.actions.toggleModalVisbility();
    }

    downloadImage() {

        // toggle loader ON
        this.setState({ loaderON: true });

        const { selectedIndex, selectedType, exportScale = 1 } = this.state;

        let svgSelector = document.getElementsByClassName('exportable-svg')[selectedIndex];

        toastr["info"]("Thanks for using SynVisio, Please consider citing our work if you are using the images in a publication. The citation can be found on the home page. Please wait for the download to begin...", "Export");

        ParseSVG(svgSelector).then((svgEl) => {
            const fileName = "synvisio-export-" + selectedType + "-" + uniqid() + (selectedType == "SVG" ? '.svg' : '.png');
            if (selectedType == 'SVG') {
                let xmls = new XMLSerializer();
                var xmlStr = xmls.serializeToString(svgEl);
                xmlStr = xmlStr.split("xmlns=\"http://www.w3.org/1999/xhtml\"").join("");
                var blob = new Blob([xmlStr], { type: "image/svg+xml" });
                saveAs(blob, fileName);
            }
            else {
                svgSaver.saveSvgAsPng(svgEl, fileName, { 'scale': exportScale });
            }
        }).finally(() => this.setState({ 'loaderON': false }))

    }


    render() {

        const { selectedIndex, selectedType, exportScale, loaderON } = this.state,
            exportable_elements = _.map(document.getElementsByClassName('exportable-svg'), (element) => element.id);

        return (
            <div className='cc-modal-root'>
                <div className='modal-main'>
                    <button type="button" className="close" onClick={this.closeModal}>
                        <span>×</span>
                    </button>
                    <h3 className='text-center'>Download Image Panel</h3>
                    <div className='info-panel-inner text-center'>
                        {exportable_elements.length > 0 ?
                            <div className='m-a'>
                                <div className='select-wrapper'>
                                    <p className='select-label'> Select Graphic</p>
                                    <select onChange={this.selectChange} id={'selectedIndex'} value={selectedIndex} className='plot-options form-control'>
                                        {_.map(exportable_elements, (elementId, elementIndex) =>
                                            <option key={'option-' + elementIndex} value={elementIndex}>{elementId.split('-').join(" ").toLocaleUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className='select-wrapper'>
                                    <p className='select-label'>Select Export Type</p>
                                    <select onChange={this.selectChange} id={'selectedType'} value={selectedType} className='type-options form-control'>
                                        <option value='PNG'>PNG</option>
                                        <option value='SVG'>SVG</option>
                                    </select>
                                </div>
                                <p className='text-warning text-left info-p'> Select a higher scale if you want a high resolution image</p>
                                <div className='select-wrapper'>
                                    <p className='select-label'>Select Export Scale</p>
                                    <select onChange={this.selectChange} id={'exportScale'} value={exportScale} className='type-options form-control'>
                                        <option value='1'>1 - Regular</option>
                                        <option value='2'>2x</option>
                                        <option value='10'>10x</option>
                                    </select>
                                </div>

                                <p className='text-warning text-left info-p'> If you prefer a white background for your exported images,</p>
                                <p className='text-warning text-left info-p m-t-0'>switch it using the theme toggler present at the top of the page.</p>
                                <p className='text-warning text-left info-p'>Please consider citing our work if you are using the images in a publication.</p>
                                <p className='text-warning text-left info-p m-t-0'>The citation can be found on the home page.</p>

                                <div>
                                    <button className="btn btn-primary-outline" onClick={this.downloadImage}>
                                        DOWNLOAD
                                        {loaderON && <Loading type='spin' className='download-loader' height='25px' width='25px' color='#d6e5ff' delay={-1} />}
                                    </button>
                                </div>
                            </div>
                            : <h3 className='text-warning'>No Images present to download, Please generate an image first.</h3>}
                    </div>

                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ toggleModalVisbility }, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(Modal);






