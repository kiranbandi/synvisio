import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ParseSVG from '../../utils/ParseSVG';
import { saveAs } from 'file-saver';
import toastr from '../../utils/toastr';
import uniqid from 'uniqid';
import _ from 'lodash';
import svgSaver from '../../utils/saveSVGasPNG';
import { toggleModalVisbility } from '../../redux/actions/actions';


class DownloadSvg extends Component {

    constructor(props) {
        super(props);
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

