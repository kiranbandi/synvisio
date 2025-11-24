import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import CirclePlotChromosomes from './CirclePlotChromosomes';
import CirclePlotLinks from './CirclePlotLinks';
import { InlayIcon } from '../';
import * as d3 from 'd3';

class CirclePlotView extends Component {

    constructor(props) {
        super(props);
        this.zoom = d3.zoom()
            .scaleExtent([1, 4])
            .filter(() => !(d3.event.type == 'dblclick'))
            .on("zoom", this.zoomed.bind(this));
        this.resetZoom = this.resetZoom.bind(this);
        this.removeZoom = this.removeZoom.bind(this);
        this.attachZoom = this.attachZoom.bind(this);
    }

    componentDidMount() {
        this.attachZoom();
    }

    componentDidUpdate() {
        this.attachZoom();
    }

    attachZoom() {
        if (this.props.configuration.isChromosomeModeON) {
            d3.select(this.outerG)
                .call(this.zoom)
        }
        else {
            this.removeZoom();
        }
    }

    resetZoom() {
        d3.select(this.outerG).call(this.zoom.transform, d3.zoomIdentity.scale(1).translate(0, 0));
    }

    removeZoom() {
        d3.select(this.outerG).call(this.zoom.transform, d3.zoomIdentity.scale(1).translate(0, 0));
        d3.select(this.outerG).on('.zoom', null);
    }

    zoomed() {
        let zoomTransform = d3.event.transform;
        zoomTransform = zoomTransform || { x: 0, y: 0, k: 1 };
        d3.select(this.innerG).attr('transform', 'translate(' + zoomTransform.x + "," + zoomTransform.y + ") scale(" + zoomTransform.k + ")")
    }

    // Generate random color for each alignment (similar to Java code)
    getAlignmentColor(alignmentIndex) {
        // Java uses random colors, but we'll use a deterministic approach based on index
        const hue = (alignmentIndex * 137.508) % 360; // Golden angle approximation
        return `hsla(${hue}, 70%, 50%, 0.3)`;
    }

    initializeCircleLayout(configuration, chromosomeCollection) {
        const { genomeLibrary } = window.synVisio;
        const { markers } = configuration;
        
        const xchr = markers.source || [];
        
        const xdim = (configuration.circlePlotView && configuration.circlePlotView.width) || 800;
        const ydim = (configuration.circlePlotView && configuration.circlePlotView.height) || 800;
        
        const hmargin = xdim * 0.1;
        const vmargin = ydim * 0.1;
        const radius = (xdim - hmargin - hmargin) / 2;
        const center_x = xdim / 2;
        const center_y = ydim / 2;
        const thick = 15;
        const lcells = xchr.length;
        const space = lcells > 10 ? 5 : 8;
        
        // Calculate total length
        let lnt = 0;
        xchr.forEach(chr => {
            const chrData = chromosomeCollection.get(chr);
            if (chrData) {
                lnt += chrData.width;
            }
        });
        
        // Calculate unit (degrees per base pair)
        const unit = (360 - (space * lcells)) / lnt;
        
        // Calculate start angles for each chromosome
        const lstart = new Map();
        const chromosomes = [];
        
        if (xchr.length > 0) {
            lstart.set(xchr[0], 0);
            const firstChrData = chromosomeCollection.get(xchr[0]);
            const firstChrLength = firstChrData ? firstChrData.width : 0;
            const firstChrAngle = unit * firstChrLength;
            
            chromosomes.push({
                key: xchr[0],
                startAngle: 0,
                endAngle: firstChrAngle,
                length: firstChrLength,
                chromosomeData: firstChrData
            });
            
            // Calculate positions for remaining chromosomes
            for (let i = 1; i < lcells; i++) {
                const prevChr = xchr[i - 1];
                const prevChrData = chromosomeCollection.get(prevChr);
                const prevChrLength = prevChrData ? prevChrData.width : 0;
                const prevStart = lstart.get(prevChr);
                const temp = prevStart + (unit * prevChrLength) + space;
                
                lstart.set(xchr[i], temp);
                
                const chrData = chromosomeCollection.get(xchr[i]);
                const chrLength = chrData ? chrData.width : 0;
                const chrAngle = unit * chrLength;
                
                chromosomes.push({
                    key: xchr[i],
                    startAngle: temp,
                    endAngle: temp + chrAngle,
                    length: chrLength,
                    chromosomeData: chrData
                });
            }
        }
        
        return {
            xdim,
            ydim,
            hmargin,
            vmargin,
            radius,
            center_x,
            center_y,
            thick,
            space,
            unit,
            lstart,
            chromosomes
        };
    }

    initializeLinks(configuration, circleLayout) {
        const { genomeLibrary } = window.synVisio;
        const { alignmentList } = configuration;
        const { lstart, unit, radius, center_x, center_y } = circleLayout;
        
        const links = [];
        let prevAlignmentIndex = -1;
        let currentColor = null;
        
        // Process each alignment
        // Java code processes all gene pairs and checks if both chromosomes are in lstart
        alignmentList.forEach((alignment, alignmentIndex) => {
            if (alignment.hidden) return;
            
            const linksList = alignment.links || [];
            
            if (linksList.length === 0) return;
            
            // Get color for this alignment (change color when alignment index changes)
            // Java uses random colors per alignment index
            if (alignmentIndex !== prevAlignmentIndex) {
                prevAlignmentIndex = alignmentIndex;
                currentColor = this.getAlignmentColor(alignmentIndex);
            }
            
            linksList.forEach(link => {
                const sourceGene = genomeLibrary.get(link.source);
                const targetGene = genomeLibrary.get(link.target);
                
                if (!sourceGene || !targetGene) {
                    // Gene not found in library - skip
                    return;
                }
                
                const sourceChr = sourceGene.chromosomeId;
                const targetChr = targetGene.chromosomeId;
                
                // Java: if(lstart.containsKey(ss1[0])&&lstart.containsKey(ss2[0]))
                // Both chromosomes must be in the layout (in source markers for circle plot)
                if (!lstart.has(sourceChr) || !lstart.has(targetChr)) {
                    // One or both chromosomes not in the circle layout - skip
                    return;
                }
                
                // Java: angle = (lstart.get(chr) + unit * position) * PI / 180
                const sourceStartAngle = lstart.get(sourceChr);
                const targetStartAngle = lstart.get(targetChr);
                
                // Use gene start position (Java uses ss1[1] which is the position)
                const angle1 = (sourceStartAngle + (unit * sourceGene.start)) * (Math.PI / 180);
                const angle2 = (targetStartAngle + (unit * targetGene.start)) * (Math.PI / 180);
                
                // Java: center_x+Math.cos(angle1)*(radius-2), center_y-Math.sin(angle1)*(radius-2)
                const x1 = center_x + Math.cos(angle1) * (radius - 2);
                const y1 = center_y - Math.sin(angle1) * (radius - 2);
                const x2 = center_x + Math.cos(angle2) * (radius - 2);
                const y2 = center_y - Math.sin(angle2) * (radius - 2);
                
                links.push({
                    x1, y1, x2, y2,
                    color: currentColor,
                    alignmentIndex
                });
            });
        });
        
        return links;
    }

    render() {
        let { configuration, genomeData, isDark, plotType } = this.props;
        const { isChromosomeModeON = false } = configuration;
        
        // Set default dimensions if not in configuration
        if (!configuration.circlePlotView) {
            configuration = {
                ...configuration,
                circlePlotView: {
                    width: 800,
                    height: 800
                }
            };
        }
        
        const circleLayout = this.initializeCircleLayout(configuration, genomeData.chromosomeMap);
        const links = this.initializeLinks(configuration, circleLayout);
        
        // Debug: log links count and layout info
        console.log('CirclePlotView Debug:', {
            linksCount: links.length,
            alignmentListLength: configuration.alignmentList && configuration.alignmentList.length,
            chromosomesInLayout: Array.from(circleLayout.lstart.keys()),
            lstartSize: circleLayout.lstart.size
        });
        
        return (
            <div className={(plotType != 'dashboard' ? 'circlePlotViewWrapper only-circleplotview' : 'circlePlotViewWrapper')}>
                <div className='circlePlotViewRoot' style={{ textAlign: 'center' }}>
                    {isChromosomeModeON &&
                        <InlayIcon
                            x={circleLayout.xdim - 50}
                            y={20}
                            onClick={this.resetZoom} />}
                    <svg
                        style={{
                            'background': isDark ? isChromosomeModeON ? '#1a1c22' : '#252830' : 'white',
                            'margin': '10px 0px 0px 10px'
                        }}
                        id='circle-plot-graphic'
                        className={'circlePlotViewSVG exportable-svg snapshot-thumbnail ' + (isChromosomeModeON ? 'chrom-mode' : '')}
                        ref={node => this.outerG = node}
                        height={circleLayout.ydim}
                        width={circleLayout.xdim}>
                        
                        <g ref={node => this.innerG = node}>
                            <CirclePlotChromosomes 
                                circleLayout={circleLayout}
                                isDark={isDark}
                            />
                            <CirclePlotLinks 
                                links={links}
                                center_x={circleLayout.center_x}
                                center_y={circleLayout.center_y}
                            />
                        </g>
                    </svg>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        genomeData: state.genome,
        isDark: state.oracle.isDark
    };
}

export default connect(mapStateToProps)(CirclePlotView);

