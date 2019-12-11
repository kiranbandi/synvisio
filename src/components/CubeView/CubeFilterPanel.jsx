import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import sortAlphaNum from '../../utils/sortAlphaNum';
import { hiveFilterData, setRootMarkers } from '../../redux/actions/actions';
import _ from 'lodash';

class CubeFilterPanel extends Component {

    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
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
        const { markers = { 1: [], 2: [], 3: [] } } = this.props.configuration;
        this.initialiseMarkers(markers);
    }

    componentDidUpdate() {
        const { markers = { 1: [], 2: [], 3: [] } } = this.props.configuration;
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
            { markers = {} } = configuration;

        let markerFilterElements = _.map(markers, (value, keyIndex) => {
            return (
                <div className="filter-row" key={"hive-select-" + keyIndex}>
                    <label>{"Chromosome Source " + (keyIndex == 0 ? 'X' : keyIndex == 1 ? 'Y' : 'Z')}</label>
                    <select className={"hive-select-" + keyIndex} multiple title="Select Chromosomes...">
                        {options}
                    </select>
                </div>);
        })

        return (
            <form className="filter-panel-hive">
                {markerFilterElements}
                <button type="submit" className="btn btn-primary-outline m-l" onClick={this.onSubmit}>
                    GO <span className="icon icon-cw"></span>
                </button>
            </form>
        );

    }
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators({ hiveFilterData, setRootMarkers }, dispatch) };
}

export default connect(null, mapDispatchToProps)(CubeFilterPanel);
