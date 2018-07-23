import React, { Component } from 'react';
import { Information, GenomeView, BlockView, DotView, PanelView } from './';

export default class SingleLevel extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        let { configuration, plotType = 'dashboard' } = this.props,
            { markers = { source: [], target: [] }, alignmentList = [], isChromosomeModeON = false, isBlockModeON = false } = configuration;

        const isMarkerListEmpty = markers.source.length == 0 || markers.target.length == 0,
            areLinksAvailable = alignmentList.length > 0;

        if (isChromosomeModeON) {
            // update markers to only the source and target set in the filter panel
            const filteredMarkers = {
                source: [configuration.filterLevel.source],
                target: [configuration.filterLevel.target],
            };
            configuration = {
                ...configuration,
                markers: filteredMarkers
            }
        }

        return (
            <div>
                <Information />
                {isMarkerListEmpty ?
                    <h2 className='text-danger text-xs-center m-t-lg'>Source or Target Empty</h2> :
                    areLinksAvailable &&
                    <div className='anchor-root'>
                        {plotType == 'dashboard' ?
                            <div>
                                <GenomeView configuration={configuration} plotType={plotType} />
                                <DotView configuration={configuration} plotType={plotType} />
                                <PanelView configuration={configuration} plotType={plotType} />
                            </div> :
                            plotType == 'dotplot' ?
                                <DotView configuration={configuration} plotType={plotType} /> :
                                <GenomeView configuration={configuration} plotType={plotType} />}
                        {isBlockModeON && <BlockView configuration={configuration} />}
                    </div>}
            </div>
        );
    }
}  
