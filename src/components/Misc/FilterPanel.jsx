import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import sortAlphaNum from '../../utils/sortAlphaNum';
import { schemeCategory10 } from 'd3';
import {
    filterData, toggleTracks,
    setNormalizedState, setMarkerScale, setColorMap
} from '../../redux/actions/actions';

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

        let { chromosomeMap = {}, sourceChromosomes = [], targetChromosomes = [], markers = { source: [], target: [] }, isNormalized = false, showScale = true, plotType, colorMap = {} } = this.props,
            { hideUnalignedRegions } = this.state,
            chromosomeMapList = [...chromosomeMap].sort(sortAlphaNum(0));

        // If chromosome role lists are available, use them to split source/target options.
        // Fall back to the full list when not available (e.g. pre-loaded sample data).
        const makeOptions = (filterSet) => {
            const list = filterSet.length > 0
                ? chromosomeMapList.filter(([id]) => filterSet.indexOf(id) > -1)
                : chromosomeMapList;
            return list.map(([id]) => <option key={id} value={id}>{id}</option>);
        };

        const sourceOptions = makeOptions(sourceChromosomes);
        const targetOptions = makeOptions(targetChromosomes);

        // Build color picker rows for source chromosomes only.
        // Default colors mirror the exact same logic used by GenomeView/Markers and Links:
        // schemeCategory10[markers.source.indexOf(chromId) % 10]
        const sourceMarkerList = (markers && markers.source) ? markers.source : [];
        const colorPickerRows = sourceMarkerList.map((chromId) => {
            const sourceIdx = sourceMarkerList.indexOf(chromId);
            const defaultColor = schemeCategory10[sourceIdx % 10];
            const currentColor = colorMap[chromId] || defaultColor;
            return (
                <div key={chromId} className='color-picker-row'>
                    <span className='color-picker-label'>{chromId}</span>
                    <input
                        type='color'
                        value={currentColor}
                        onChange={(e) => {
                            // Pre-fill every source chromosome with its default color so that
                            // isColorMapAvailable=true doesn't collapse others to #1f77b4
                            const newColorMap = {};
                            sourceMarkerList.forEach((id, i) => {
                                newColorMap[id] = colorMap[id] || schemeCategory10[i % 10];
                            });
                            newColorMap[chromId] = e.target.value;
                            this.props.setColorMap(newColorMap);
                        }}
                    />
                </div>
            );
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

                    {plotType != 'dotplot' && <div className="col-sm-12">
                        <div className="checkbox custom-checkbox">
                            <label>
                                <input type="checkbox" id='markerNormalize' checked={isNormalized} onChange={this.toggleCheckboxChange} />
                                {"Normalize Chromosome Marker Lengths"}
                            </label>
                        </div>
                    </div>}


                    {plotType != 'dotplot' && <div className="col-sm-12">
                        <div className="checkbox custom-checkbox">
                            <label>
                                <input type="checkbox" id='markerScale' checked={showScale} onChange={this.toggleCheckboxChange} />
                                {"Show Marker Scales"}
                            </label>
                        </div>
                    </div>}

                    <div className="col-sm-12">
                        <label htmlFor="sourceChromosomes">Source Chromosomes</label>
                        <select className="sourceChromosomeSelect" multiple title="Select Chromosomes...">
                            {sourceOptions}
                        </select>

                    </div>
                    <div className="col-sm-12">
                        <label htmlFor="targetChromosomes">Target Chromosomes</label>
                        <select className="targetChromosomeSelect" multiple title="Select Chromosomes...">
                            {targetOptions}
                        </select>
                    </div>

                    {colorPickerRows.length > 0 && <div className="col-sm-12">
                        <p className='color-picker-heading'>Chromosome Colours</p>
                        <div className='color-picker-list'>
                            {colorPickerRows}
                        </div>
                    </div>}

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
        setMarkerScale: bindActionCreators(setMarkerScale, dispatch),
        setColorMap: bindActionCreators(setColorMap, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        chromosomeMap: state.genome.chromosomeMap,
        sourceChromosomes: state.genome.sourceChromosomes || [],
        targetChromosomes: state.genome.targetChromosomes || [],
        markers: state.oracle.configuration.markers,
        isNormalized: state.oracle.configuration.isNormalized,
        showScale: state.oracle.configuration.showScale,
        plotType: state.oracle.plotType,
        colorMap: state.genome.colorMap || {}
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterPanel);

