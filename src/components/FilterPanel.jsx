import React, { Component } from 'react';
import { connect } from 'react-redux';

class FilterPanel extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $('.sourceChromosomeSelect').selectpicker({
            'actionsBox': true,
            'iconBase': 'icon',
            'tickIcon': 'icon-check',
            'selectedTextFormat': 'count > 2'
        });
        $('.targetChromosomeSelect').selectpicker({
            'actionsBox': true,
            'iconBase': 'icon',
            'tickIcon': 'icon-check',
            'selectedTextFormat': 'count > 2'
        });
    }

    componentDidUpdate() {
        $('.sourceChromosomeSelect').selectpicker('refresh');
        $('.targetChromosomeSelect').selectpicker('refresh');
    }

    componentWillUnmount() {
        $('.sourceChromosomeSelect').selectpicker('destroy');
        $('.targetChromosomeSelect').selectpicker('destroy');
    }

    render() {

        let { chromosomeMap = {} } = this.props,
            // sort chromosome map 
            chromosomeMapList = [...chromosomeMap].sort(sortAlphaNum);
        // create list of options
        const options = chromosomeMapList.map((value, index) => {
            return <option key={index} value={value[0]}>{value[0]}</option>;
        });

        return (
            <div id='filter-panel-root' className='container-fluid'>
                <form className="filter-panel-container">
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
                    <button type="submit" className="btn btn-primary-outline">
                        GO <span className="icon icon-cw"></span>
                    </button>
                </form>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return { chromosomeMap: state.genome.chromosomeMap };
}

export default connect(mapStateToProps)(FilterPanel);


function sortAlphaNum(a, b) {
    let reA = /[^a-zA-Z]/g;
    let reN = /[^0-9]/g;
    let aA = a[0].replace(reA, "");
    let bA = b[0].replace(reA, "");
    if (aA === bA) {
        let aN = parseInt(a[0].replace(reN, ""), 10);
        let bN = parseInt(b[0].replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
}