import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FilterPanel, PieChart } from './';

class Information extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { information = { parameters: [] } } = this.props,
            informationList = information.parameters.map((val, ind) => <h4 key={ind} className='sub-info'>{val.join(" : ")}</h4>);

        return (
            <div id='information-root' className='row m-a-0'>
                <div className='info-container col-sm-12 col-md-4 text-xs-center'>
                    <h2 className='text-primary text-xs-center'>MCScanX Parameters</h2>
                    {informationList}
                </div>
                <div className='graphic-container col-sm-12 col-md-4 text-xs-center' >
                    <h2 className='text-primary text-xs-center'>Share of Collinear Genes</h2>
                    <PieChart
                        information={this.props.information}
                        parentClassName={".graphic-container"} />
                </div>
                <div className='graphic-container col-sm-12 col-md-4 text-xs-center'>
                    <h2 className='text-primary text-xs-center'>Filter Panel</h2>
                    <FilterPanel />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return { information: state.genome.information };
}

export default connect(mapStateToProps)(Information);
