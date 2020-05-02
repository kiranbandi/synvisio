import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSnapshotList } from '../redux/actions/actions';
import toastr from '../utils/toastr';
import ParseSVG from '../utils/ParseSVG';
import svgSaver from '../utils/saveSVGasPNG';
import uniqid from 'uniqid';

class SnapshotCapture extends Component {

    constructor(props) {
        super(props);
        this.storeSnapshot = this.storeSnapshot.bind(this);
    }

    storeSnapshot() {
        let { snapshotList, configuration, setSnapshotList } = this.props, uniqueCode = uniqid();

        // Get the SVG element
        let svgElements = document.getElementsByClassName('exportable-svg');
        // check if there is a visual snapshot is available to be stored
        if (svgElements.length > 0) {
            ParseSVG(svgElements[0]).then((svgEl) => {
                svgSaver.svgAsPngUri(svgEl, { 'scale': '0.5' })
                    .then(uri => {
                        //  Treading Dangerous Territory here by polluting the global name space 
                        //  But this reduces the load placed on the redux and react global store
                        window.synVisio.snapshotStore[uniqueCode] = { 'configuration': _.cloneDeep(configuration), 'imgURI': uri };;
                        setSnapshotList([...snapshotList, uniqueCode]);
                        toastr["info"]("Current state of visualization stored as a local snapshot", "SNAPSHOT STORED");
                    });
            });
        }
        else {
            toastr["warning"]("No visualization available to store as a snapshot, generate one first", "SNAPSHOT ERROR");
        }
    }

    render() {
        return (
            <div className='snapshot-capture' onClick={this.storeSnapshot}>
                <span className="icon icon-camera"></span>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return { snapshotList: state.oracle.snapshotList, configuration: state.oracle.configuration };
}

function mapDispatchToProps(dispatch) {
    return { setSnapshotList: bindActionCreators(setSnapshotList, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(SnapshotCapture);
