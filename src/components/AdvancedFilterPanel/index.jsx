import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setRootMarkers } from '../../redux/actions/actions';

import Example from './example'
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'


class AdvancedFilterPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
        this.onTabClick = this.onTabClick.bind(this);
    }


    onTabClick(event) {
        const { isOpen } = this.state;
        this.setState({ isOpen: !isOpen });
    }

    render() {
        const { isOpen = false } = this.state;

        return (
            <div className='advanced-filter'>
                <div className={'text-xs-left advanced-filter-head' + (isOpen ? ' bottom-line ' : ' ')} onClick={this.onTabClick}>
                    {isOpen ? <span className="icon icon-chevron-down"></span> : <span className="icon icon-chevron-right"></span>}
                    <span className='epa-label' >Advanced Chromosome Layout Editor</span>
                    <span className={"icon icon-funnel"}></span>
                </div>
                <div className={'advanced-filter-content ' + (isOpen ? 'show-row' : 'hide-row')}>
                    <DndProvider backend={Backend}>
                        <Example />
                    </DndProvider>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { markers: state.oracle.configuration.markers };
}

function mapDispatchToProps(dispatch) {
    return {
        setRootMarkers: bindActionCreators(setRootMarkers, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedFilterPanel);


