import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ParseSVG from '../utils/ParseSVG';
import { saveAs } from 'file-saver';
import toastr from '../utils/toastr';
import uniqid from 'uniqid';
import _ from 'lodash';
import svgSaver from '../utils/saveSVGasPNG';
import { toggleModalVisbility } from '../redux/actions/actions';


class DownloadSvg extends Component {

    constructor(props) {
        super(props);
    }

    SVGExport() {
        // let svgExports = _.map(document.getElementsByTagName('svg'), (g) =>  svgSaver.saveSvgAsPng(g,'diagram.png'));

        // svgSaver.saveSvgAsPng(svgExports,'diagram.png');

        ParseSVG(document.getElementsByClassName('genomeViewSVG')[0]).then((svgElement) => {

            svgSaver.saveSvgAsPng(svgElement, 'diagram.png', { 'scale': 4 });
        })

        // let svgElement = ParseSVG(document.getElementsByClassName('genomeViewSVG')[0]);

        // // computedStyleToInlineStyle(svgElement, { recursive: true });

        // svgSaver.saveSvgAsPng(svgElement, 'diagram.png', { 'scale': 4 });


        // if (svgExports.length > 0) {
        //     toastr["info"](svgExports.length + " SVG(s) will be downloaded", "SVG Export");
        //     Promise.all(svgExports).then((svgDocs) => {
        //         let xmls = new XMLSerializer();
        //         _.map(svgDocs, (svgElement, index) => {
        //             var xmlStr = xmls.serializeToString(svgElement);
        //             xmlStr = xmlStr.split("xmlns=\"http://www.w3.org/1999/xhtml\"").join("");
        //             var blob = new Blob([xmlStr], { type: "image/svg+xml" });
        //             saveAs(blob, "synvisio-export-" + index + "-" + uniqid() + ".svg");
        //         })
        //     });
        // } else {
        //     toastr["error"]("No SVGs were found on the page,Please try again", "SVG Export");
        // }

    }

    render() {
        return (
            <div className='download-SVG' onClick={() => { this.props.actions.toggleModalVisbility() }}>
                <span className='icon-label'>Download Images</span> <span className="icon icon-download"></span>
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ toggleModalVisbility }, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(DownloadSvg);

