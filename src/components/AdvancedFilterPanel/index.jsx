import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setRootMarkers } from '../../redux/actions/actions';
import DragContainer from './DragContainer'
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'


class AdvancedFilterPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            ownUpdate: true,
            markers: props.markers,
            reversedMarkers: props.reversedMarkers
        };
        this.onTabClick = this.onTabClick.bind(this);
        this.updateMarkerList = this.updateMarkerList.bind(this);
        this.resetMarkers = this.resetMarkers.bind(this);
        this.setMarkerListRedux = this.setMarkerListRedux.bind(this);
        this.updatedReversedMarkers = this.updatedReversedMarkers.bind(this);
    }


    updatedReversedMarkers(marker, markerId) {
        let reversedMarkers = _.cloneDeep(this.state.reversedMarkers);

        // if marker is present in the list remove it
        if (_.findIndex(reversedMarkers[markerId], (d) => d == marker) > -1) {
            reversedMarkers[markerId] = _.filter(reversedMarkers[markerId], (d) => d != marker);
        }
        // add the reversed marker to its list
        else {
            reversedMarkers[markerId].push(marker);
        }

        this.setState({ ownUpdate: true, reversedMarkers });
    }

    resetMarkers() {
        this.setState({ ownUpdate: false });
    }

    setMarkerListRedux() {
        const { markers, reversedMarkers } = this.state;
        this.props.setRootMarkers(markers, reversedMarkers);
    }

    onTabClick(event) {
        event.preventDefault();
        const { isOpen } = this.state;
        this.setState({ isOpen: !isOpen, ownUpdate: true });
    }

    updateMarkerList(markerList, markerId) {
        const { markers } = this.state;
        this.setState({ ownUpdate: true, markers: { ...markers, [markerId]: markerList } });
    }

    static getDerivedStateFromProps(props, current_state) {
        if (current_state.ownUpdate) {
            return { ...current_state, ownUpdate: false };
        }
        else {
            return {
                ownUpdate: false,
                markers: _.clone(props.markers),
                reversedMarkers: _.clone(props.reversedMarkers)
            };
        }

    }

    render() {
        const { isOpen = false, markers = {}, reversedMarkers = {} } = this.state, { width } = this.props;
        return (
            <div className='advanced-filter'>
                <div className={'text-xs-left advanced-filter-head' + (isOpen ? ' bottom-line ' : ' ')} onClick={this.onTabClick}>
                    {isOpen ? <span className="icon icon-chevron-down"></span> : <span className="icon icon-chevron-right"></span>}
                    <span className='epa-label' >Advanced Chromosome Layout Editor </span>
                    <span className={"icon icon-copy"}></span> (Click to open)
                </div>
                <div className={'advanced-filter-content text-center ' + (isOpen ? 'show-row' : 'hide-row')}>
                    <div className='advanced-info-box'>
                        <p><b>Select</b> the required Chromosomes and Click <b>GO</b> above before editing the layout here.</p>
                        <p><b>Drag</b> the chromosomes around to rearrange their order. <b>Double click</b> on any chromosome if you want to reverse it.</p>
                        <p>Regular chromosomes are <b className='text-primary'>BLUE</b> and reversed chromosomes are <b className='text-danger'>RED.</b> </p>
                    </div>
                    {_.map(markers, (markerList, markerId) => {
                        return <div key={'markerID-' + markerId} className='marker-wrapper'>
                            <DndProvider backend={Backend}>
                                <DragContainer markerId={markerId} width={width}
                                    reversedMarkerList={reversedMarkers[markerId]}
                                    markerList={markerList}
                                    updateMarkerList={this.updateMarkerList}
                                    updatedReversedMarkers={this.updatedReversedMarkers} />
                            </DndProvider>
                        </div>
                    })}

                    <div className='button-container'>
                        <button className="btn btn-primary-outline m-r" onClick={this.setMarkerListRedux}>
                            <span>Update Chromosome Layout</span> <span className="icon icon-check"></span>
                        </button>
                        <button className="btn btn-danger-outline" onClick={this.resetMarkers}>
                            <span>Reset</span> <span className="icon icon-circle-with-cross"></span>
                        </button>
                    </div>

                </div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        markers: _.clone(state.oracle.configuration.markers),
        reversedMarkers: _.clone(state.oracle.configuration.reversedMarkers)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setRootMarkers: bindActionCreators(setRootMarkers, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedFilterPanel);