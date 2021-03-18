import React, { Component } from 'react';
import { MultiGenomeView } from '../';


export default class MagnumView extends Component {

    render() {

        let { configuration, plotType = 'dashboard' } = this.props,
            { alignmentList = [] } = configuration;

        const areLinksAvailable = alignmentList.length > 0;

        return (
            <div>
                {areLinksAvailable &&
                    <div className='anchor-root'>
                        <MultiGenomeView configuration={configuration} plotType={plotType} />
                    </div>}
            </div>
        );
    }
}
