import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import sortAlphaNum from '../utils/sortAlphaNum';
import {
    filterData, toggleTracks,
    setNormalizedState, setMarkerScale
} from '../redux/actions/actions';

class FilterPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hideUnalignedRegions: false
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.onToggleTrack = this.onToggleTrack.bind(this);
        this.toggleCheckboxChange = this.toggleCheckboxChange.bind(this);
    }

    toggleCheckboxChange(event) {
        const { hideUnalignedRegions } = this.state, { isNormalized = false, showScale } = this.props;

        if (event.target.id == 'markerNormalize') {
            this.props.setNormalizedState(!isNormalized);
        }
        else if (event.target.id == 'markerScale') {
            this.props.setMarkerScale(!showScale);
        }
        else {
            this.setState({ 'hideUnalignedRegions': !hideUnalignedRegions });
        }

    }

    componentDidMount() {
        const { markers = { 'source': [], 'target': [] } } = this.props;

        $('.sourceChromosomeSelect')
            .selectpicker({
                'actionsBox': true,
                'iconBase': 'icon',
                'tickIcon': 'icon-check',
                'selectedTextFormat': 'count > 2'
            })
            .selectpicker('val', markers.source);

        $('.targetChromosomeSelect')
            .selectpicker({
                'actionsBox': true,
                'iconBase': 'icon',
                'tickIcon': 'icon-check',
                'selectedTextFormat': 'count > 2'
            })
            .selectpicker('val', markers.target);
    }

    componentDidUpdate() {
        const { markers = { 'source': [], 'target': [] } } = this.props;
        $('.sourceChromosomeSelect').selectpicker('refresh').selectpicker('val', markers.source);
        $('.targetChromosomeSelect').selectpicker('refresh').selectpicker('val', markers.target);
    }

    componentWillUnmount() {
        $('.sourceChromosomeSelect').selectpicker('destroy');
        $('.targetChromosomeSelect').selectpicker('destroy');
    }
    onSubmit(e) {
        e.preventDefault();
        const sourceMarkers = $('.sourceChromosomeSelect').selectpicker('val'),
            targetMarkers = $('.targetChromosomeSelect').selectpicker('val'),
            { hideUnalignedRegions } = this.state;
        //  if markers lists are null set them to empty lists
        this.props.filterData(!!sourceMarkers ? sourceMarkers : [], !!targetMarkers ? targetMarkers : [], {}, hideUnalignedRegions);
    }

    onToggleTrack(e) {
        e.preventDefault();
        this.props.toggleTracks();
    }

    render() {

        let { chromosomeMap = {}, isNormalized = false, showScale = true } = this.props,
            { hideUnalignedRegions } = this.state,
            // sort chromosome map 
            // Zero is passed to the sorting function so that sorting happens based on the 0th value
            //  which is the actual chromosome identifier
            chromosomeMapList = [...chromosomeMap].sort(sortAlphaNum(0));

        // create list of options
        const options = chromosomeMapList.map((value, index) => {
            return <option key={index} value={value[0]}>{value[0]}</option>;
        });

        // see if track data is available
        const isTrackDataAvailable = _.reduce(window.synVisio.trackData, (acc, d) => (!!d || acc), false);

        return (
            <div id='filter-panel-root' className='container-fluid'>
                <form className="filter-panel-container">

                    <div className="col-sm-12">
                        <div className="checkbox custom-checkbox">
                            <label>
                                <input type="checkbox" id='hideUnalignedRegions' checked={hideUnalignedRegions} onChange={this.toggleCheckboxChange} />
                                {"Hide Unaligned Chromosomes/Scaffolds"}
                            </label>
                        </div>
                    </div>
                    <div className="col-sm-12">
                        <div className="checkbox custom-checkbox">
                            <label>
                                <input type="checkbox" id='markerNormalize' checked={isNormalized} onChange={this.toggleCheckboxChange} />
                                {"Normalize Chromosome Marker Lengths"}
                            </label>
                        </div>
                    </div>

                    <div className="col-sm-12">
                        <div className="checkbox custom-checkbox">
                            <label>
                                <input type="checkbox" id='markerScale' checked={showScale} onChange={this.toggleCheckboxChange} />
                                {"Show Marker Scales"}
                            </label>
                        </div>
                    </div>

                    <div className="col-sm-12">
                        <label htmlFor="sourceChromosomes">Source Chromosomes</label>
                        <select className="sourceChromosomeSelect" multiple title="Select Chromosomes...">
                            {options}
                        </select>

                    </div>
                    <div className="col-sm-12">
                        <label htmlFor="targetChromosomes">Target Chromosomes</label>
                        <select className="targetChromosomeSelect" multiple title="Select Chromosomes...">
                            {options}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary-outline" onClick={this.onSubmit}>
                        GO <span className="icon icon-cw"></span>
                    </button>

                    {isTrackDataAvailable && <button type="submit" id='track-btn' className="btn btn-primary-outline" onClick={this.onToggleTrack}>
                        Toggle Tracks
                    </button>}

                </form>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        filterData: bindActionCreators(filterData, dispatch),
        toggleTracks: bindActionCreators(toggleTracks, dispatch),
        setNormalizedState: bindActionCreators(setNormalizedState, dispatch),
        setMarkerScale: bindActionCreators(setMarkerScale, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        chromosomeMap: state.genome.chromosomeMap,
        markers: state.oracle.configuration.markers,
        isNormalized: state.oracle.configuration.isNormalized,
        showScale: state.oracle.configuration.showScale,
        plotType: state.oracle.plotType
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterPanel);

