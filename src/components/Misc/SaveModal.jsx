/*global $*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toggleModalVisbility } from '../../redux/actions/actions';
import Loading from 'react-loading';
import ParseSVG from '../../utils/ParseSVG';
import toastr from '../../utils/toastr';
import svgSaver from '../../utils/saveSVGasPNG';
import { saveAs } from 'file-saver';

const ROBOTO_URL = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
const FONT_FAMILY_RULE = 'text, tspan { font-family: "Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif; }';

// Module-level cache — fetched once per page session
let embeddedFontCSS = null;

async function buildEmbeddedFontCSS() {
    if (embeddedFontCSS) return embeddedFontCSS;

    try {
        const cssResp = await fetch(ROBOTO_URL);
        let css = await cssResp.text();

        // Extract all font file URLs from @font-face blocks
        const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1].replaceAll(/['"]/g, ''));

        // Fetch each file and replace URL with base64 data URI
        for (const url of urls) {
            const fontResp = await fetch(url);
            const buffer = await fontResp.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            bytes.forEach(b => { binary += String.fromCodePoint(b); });
            const b64 = btoa(binary);
            const mime = url.includes('woff2') ? 'font/woff2' : 'font/woff';
            css = css.replaceAll(url, `data:${mime};base64,${b64}`);
        }

        embeddedFontCSS = css + '\n' + FONT_FAMILY_RULE;
        return embeddedFontCSS;
    } catch (e) {
        console.warn('Could not embed Roboto font, falling back to system fonts:', e);
        // Fallback: no embedded font, but still set font-family so vector editors use the stack
        return FONT_FAMILY_RULE;
    }
}

function injectFontStyle(svgEl, cssText) {
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = cssText;
    svgEl.insertBefore(style, svgEl.firstChild);
}

// sample Modal than can be used when needed but is not in use currently

class Modal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: 0,
            selectedType: 'PNG',
            loaderON: false,
            exportScale: 2,
            backgroundColor: 'auto',
            exportFilename: ''
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

        this.setState({ loaderON: true });

        const { selectedIndex, selectedType, exportScale, backgroundColor, exportFilename } = this.state;
        const { isDark } = this.props;

        let resolvedBg = null;
        if (backgroundColor === 'auto') resolvedBg = isDark ? '#1a1c22' : '#ffffff';
        else if (backgroundColor === 'white') resolvedBg = '#ffffff';
        else if (backgroundColor === 'dark') resolvedBg = '#1a1c22';
        // else 'transparent' → resolvedBg stays null

        let svgSelector = document.getElementsByClassName('exportable-svg')[selectedIndex];
        const svgId = svgSelector ? svgSelector.id : 'image';
        const baseName = exportFilename.trim() || ('synvisio-' + svgId.replace(/[^a-z0-9]/gi, '-'));
        const fileName = baseName + (selectedType === 'SVG' ? '.svg' : '.png');

        toastr["info"]("Thanks for using SynVisio, Please consider citing our work if you are using the images in a publication. The citation can be found on the home page. Please wait for the download to begin...", "Export");

        // Fetch and embed Roboto (cached after first call), then export
        buildEmbeddedFontCSS().then(fontCSS => {
            return ParseSVG(svgSelector).then((svgEl) => {

                // 1. Embed font (must be first child so it applies to everything below)
                injectFontStyle(svgEl, fontCSS);

                if (selectedType === 'SVG') {
                    // 2a. Ensure viewBox for proper scaling in vector editors
                    if (!svgEl.getAttribute('viewBox')) {
                        const w = svgEl.getAttribute('width') || svgEl.getBoundingClientRect().width;
                        const h = svgEl.getAttribute('height') || svgEl.getBoundingClientRect().height;
                        svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
                    }
                    // 2b. Inject background rect if a color is requested
                    if (resolvedBg) {
                        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        rect.setAttribute('width', '100%');
                        rect.setAttribute('height', '100%');
                        rect.setAttribute('fill', resolvedBg);
                        svgEl.insertBefore(rect, svgEl.firstChild);
                    }
                    let xmlStr = new XMLSerializer().serializeToString(svgEl);
                    xmlStr = xmlStr.split('xmlns="http://www.w3.org/1999/xhtml"').join('');
                    saveAs(new Blob([xmlStr], { type: 'image/svg+xml' }), fileName);
                } else {
                    svgSaver.saveSvgAsPng(svgEl, fileName, {
                        scale: exportScale,
                        backgroundColor: resolvedBg || undefined
                    });
                }
            });
        }).finally(() => this.setState({ loaderON: false }));

    }


    render() {

        const { selectedIndex, selectedType, exportScale, backgroundColor, exportFilename, loaderON } = this.state,
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
                                    <p className='select-label'>Select Graphic</p>
                                    <select onChange={this.selectChange} id={'selectedIndex'} value={selectedIndex} className='plot-options form-control'>
                                        {_.map(exportable_elements, (elementId, elementIndex) =>
                                            <option key={'option-' + elementIndex} value={elementIndex}>{elementId.split('-').join(' ').toLocaleUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className='select-wrapper'>
                                    <p className='select-label'>Export Format</p>
                                    <select onChange={this.selectChange} id={'selectedType'} value={selectedType} className='type-options form-control'>
                                        <option value='PNG'>PNG (raster)</option>
                                        <option value='SVG'>SVG (vector)</option>
                                    </select>
                                </div>
                                {selectedType === 'PNG' && <div className='select-wrapper'>
                                    <p className='select-label'>Resolution scale</p>
                                    <select onChange={this.selectChange} id={'exportScale'} value={exportScale} className='type-options form-control'>
                                        <option value='1'>1× — screen</option>
                                        <option value='2'>2× — print draft</option>
                                        <option value='4'>4× — print quality</option>
                                        <option value='8'>8× — high resolution</option>
                                    </select>
                                </div>}
                                <div className='select-wrapper'>
                                    <p className='select-label'>Background colour</p>
                                    <select onChange={this.selectChange} id={'backgroundColor'} value={backgroundColor} className='type-options form-control'>
                                        <option value='auto'>Auto (follow theme)</option>
                                        <option value='white'>White</option>
                                        <option value='dark'>Dark (#1a1c22)</option>
                                        <option value='transparent'>Transparent</option>
                                    </select>
                                </div>
                                <div className='select-wrapper'>
                                    <p className='select-label'>File name <span style={{ fontWeight: 'normal', fontSize: '11px' }}>(optional, no extension)</span></p>
                                    <input
                                        type='text'
                                        id={'exportFilename'}
                                        value={exportFilename}
                                        onChange={this.selectChange}
                                        placeholder='synvisio-export'
                                        className='form-control'
                                    />
                                </div>

                                <p className='text-warning text-left info-p'>Please consider citing our work if you are using the images in a publication. The citation can be found on the home page.</p>

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

function mapStateToProps(state) {
    return { isDark: state.oracle.isDark };
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal);






