import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FilterPanel, PieChart } from '../';

class Information extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { information = { parameters: [] } } = this.props,
            informationList = information && (information.parameters.map((val, ind) => <h4 key={ind} className='sub-info'>{val.join(" : ")}</h4>));

        const classList = (!!information) ? 'col-sm-12 col-md-6' : 'col-sm-12';

        return (
            <div id='information-root' className='row m-a-0'>
                {information && <div className='info-container col-sm-12 col-md-6 text-xs-center'>
                    <h3 className='text-primary text-xs-center'>MCScanX Parameters</h3>
                    {informationList}
                </div>}

                <div className={"graphic-container " + classList + " text-xs-center"}>
                    <h3 className='text-primary text-xs-center'>Filter Panel</h3>
                    <FilterPanel />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { information: state.genome.information };
}

export default connect(mapStateToProps)(Information);
