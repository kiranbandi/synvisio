import React, { Component } from 'react';
import ParseSVG from '../utils/ParseSVG';
import { saveAs } from 'file-saver';
import toastr from '../utils/toastr';
import uniqid from 'uniqid';
import _ from 'lodash';


export default class SnapshotCapture extends Component {

    constructor(props) {
        super(props);
    }

    SVGExport() {
        let svgExports = _.map(document.getElementsByTagName('svg'), (g) => ParseSVG(g));
        if (svgExports.length > 0) {
            toastr["info"](svgExports.length + " SVG(s) will be downloaded", "SVG Export");
            Promise.all(svgExports).then((svgDocs) => {
                let xmls = new XMLSerializer();
                _.map(svgDocs, (svgElement, index) => {
                    var xmlStr = xmls.serializeToString(svgElement);
                    xmlStr = xmlStr.split("xmlns=\"http://www.w3.org/1999/xhtml\"").join("");
                    var blob = new Blob([xmlStr], { type: "image/svg+xml" });
                    saveAs(blob, "synvisio-export-" + index + "-" + uniqid() + ".svg");
                })
            });
        } else {
            toastr["error"]("No SVGs were found on the page,Please try again", "SVG Export");
        }

    }

    render() {
        return (
            <div className='download-SVG' onClick={this.SVGExport}>
                <span className="icon icon-download"></span>
            </div>
        );
    }
}

