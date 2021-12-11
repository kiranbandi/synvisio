import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import sortAlphaNum from '../../utils/sortAlphaNum';
import { filterMultiGenomeData } from '../../redux/actions/actions';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import _ from 'lodash';

const style = { width: 400, margin: 50 };

function log(value) {
    console.log(value); //eslint-disable-line
}

class MultiGenomeFilter extends Component {
    constructor(props) {
        super(props);

        const allMarkers = _.reverse([...this.props.chromosomeMap.keys()]
            .sort(sortAlphaNum(0))),
            markerGroups = _.map(_.groupBy(allMarkers, (d) => d.slice(0, 2)));

        this.state = {
            source: markerGroups,
            target: markerGroups,
            allMarkers
        };
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();

        const { plotType, filterMultiGenomeData } = this.props, { allMarkers } = this.state;

        if (plotType == 'multi-genome' && allMarkers.indexOf('lm7D') > -1) {
            filterMultiGenomeData(_.filter(allMarkers, (d) => d[3] == 'D'), plotType);
        }
        else {
            filterMultiGenomeData(allMarkers, plotType);
        }



    }


    render() {

        const { source, target } = this.state;

        return (
            <div id='filter-panel-root' className='container-fluid'>

                {/* <div className='col-sm-12'>
                    <div className='col-xs-6'>
                        <h3 className='text-center m-b'>Source</h3>
                        {_.map(source, (ms, msIndex) => {
                            return <div key={'multi-slider-source-' + msIndex} className='filter-slider-multi'>
                                <p className='text-center multi-slider-label'>{ms[0].slice(0, 2).toLocaleUpperCase()} </p>
                                <Range step={1} min={0} max={ms.length - 1} defaultValue={[0, ms.length - 1]} onBeforeChange={log} />
                            </div>
                        })}
                    </div>
                    <div className='col-xs-6'>
                        <h3 className='text-center m-b'>Target</h3>
                        {_.map(target, (ms, msIndex) => {
                            return <div key={'multi-slider-target-' + msIndex} className='filter-slider-multi'>
                                <p className='text-center multi-slider-label'>{ms[0].slice(0, 2).toLocaleUpperCase()} </p>
                                <Range step={1} min={0} max={ms.length - 1} defaultValue={[0, ms.length - 1]} onBeforeChange={log} />
                            </div>
                        })}
                    </div>
                </div> */}

                <form className="filter-panel-container text-center">
                    <button type="submit" className="btn btn-primary-outline m-t m-b-lg" onClick={this.onSubmit}>
                        GO <span className="icon icon-cw"></span>
                    </button>
                </form>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        filterMultiGenomeData: bindActionCreators(filterMultiGenomeData, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        chromosomeMap: state.genome.chromosomeMap
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiGenomeFilter);

