import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import sortAlphaNum from '../../utils/sortAlphaNum';
import { hiveFilterData, setRootMarkers, setNormalizedState, setChromosomeLabelsState } from '../../redux/actions/actions';
import _ from 'lodash';

class HiveFilterPanel extends Component {

    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.onAddSource = this.onAddSource.bind(this);
        this.onRemoveSource = this.onRemoveSource.bind(this);
        this.toggleCheckboxChange = this.toggleCheckboxChange.bind(this);
    }

    initialiseMarkers(markers) {
        _.each(markers, (value, keyIndex) => {
            $(".hive-select-" + keyIndex)
                .selectpicker({
                    'actionsBox': true,
                    'iconBase': 'icon',
                    'tickIcon': 'icon-check',
                    'selectedTextFormat': 'count > 2'
                })
                .selectpicker('val', value);
        })
    }

    componentDidMount() {
        const { markers = {} } = this.props.configuration;
        this.initialiseMarkers(markers);

    }

    componentDidUpdate() {
        const { markers = {} } = this.props.configuration;
        this.initialiseMarkers(markers);
    }

    componentWillUnmount() {
        const { markers = {} } = this.props.configuration;
        _.each(markers, (value, keyIndex) => { $(".hive-select-" + keyIndex).selectpicker('destroy'); })
    }

    onSubmit(e) {
        e.preventDefault();
        let { markers = {} } = this.props.configuration;
        _.each(markers, (value, keyIndex) => {
            markers[keyIndex] = $(".hive-select-" + keyIndex).selectpicker('val') || [];
        });
        this.props.actions.hiveFilterData(markers);
    }

    onAddSource(e) {
        e.preventDefault();
        const { setRootMarkers } = this.props.actions;
        let { markers = {} } = this.props.configuration,
            markerId = Object.keys(markers).length;
        markers[markerId] = [];
        setRootMarkers(markers);
    }

    toggleCheckboxChange(e) {
        const { isNormalized = false, chromosomeLabelsON = false } = this.props.configuration;
        if (e.target.id == 'isNormalized') {
            this.props.actions.setNormalizedState(!isNormalized);
        }
        else {
            this.props.actions.setChromosomeLabelsState(!chromosomeLabelsON);
        }
    }

    onRemoveSource(e) {
        e.preventDefault();
        const { setRootMarkers } = this.props.actions;
        let { markers = {} } = this.props.configuration,
            markerId = Object.keys(markers).length - 1;
        if (markerId != -1) {
            delete markers[markerId];
            setRootMarkers(markers);
        }
    }

    render() {

        let { chromosomeMap = {}, configuration } = this.props,
            // sort chromosome map 
            // Zero is passed to the sorting function so that sorting happens based on the 0th value
            //  which is the actual chromosome identifier
            chromosomeMapList = [...chromosomeMap].sort(sortAlphaNum(0));

        // create list of options
        const options = chromosomeMapList.map((value, index) => {
            return <option key={index} value={value[0]}>{value[0]}</option>;
        }),
            { markers = {}, isNormalized = false, chromosomeLabelsON = false } = configuration;

        let markerFilterElements = _.map(markers, (value, keyIndex) => {
            return (
                <div className="filter-row" key={"hive-select-" + keyIndex}>
                    <label>{"Chromosome Source " + (Number(keyIndex) + 1)}</label>
                    <select className={"hive-select-" + keyIndex} multiple title="Select Chromosomes...">
                        {options}
                    </select>
                </div>);
        })

        return (
            <form className="filter-panel-hive">
                {markerFilterElements}
                <div className="checkbox">
                    <label>
                        <input type="checkbox" id='isNormalized' checked={isNormalized} onChange={this.toggleCheckboxChange} />
                        {"Normalized Length"}
                    </label>
                </div>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" id='chromosomeLabelsON' checked={chromosomeLabelsON} onChange={this.toggleCheckboxChange} />
                        {"Chromosome Labels"}
                    </label>
                </div>
                <button className="btn btn-primary-outline add-source" onClick={this.onAddSource}>
                    <span className="icon icon-circle-with-plus"></span>
                </button>
                <button className="btn btn-primary-outline add-source" onClick={this.onRemoveSource}>
                    <span className="icon icon-circle-with-minus"></span>
                </button>
                <button type="submit" className="btn btn-primary-outline" onClick={this.onSubmit}>
                    GO <span className="icon icon-cw"></span>
                </button>
            </form>
        );

    }
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators({ hiveFilterData, setRootMarkers, setNormalizedState, setChromosomeLabelsState }, dispatch) };
}

export default connect(null, mapDispatchToProps)(HiveFilterPanel);
