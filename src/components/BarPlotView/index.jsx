import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import BarPlotBars from './BarPlotBars';
import BarPlotAlignments from './BarPlotAlignments';
import { InlayIcon } from '../';
import * as d3 from 'd3';

class BarPlotView extends Component {

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

    // Generate color for chromosome based on Java code logic
    getChromosomeColor(index, totalBars) {
        const barWidth = 10;
        const cround = Math.floor((totalBars - 1) / 7) + 1;
        const change = index % 7;
        const tempa = 0.8 * (Math.floor(index / 7)) / cround;
        
        let temp = [0, 0, 0];
        
        switch(change) {
            case 0:
                temp[0] = 1 - tempa;
                break;
            case 1:
                temp[1] = 1 - tempa;
                break;
            case 2:
                temp[2] = 1 - tempa;
                break;
            case 3:
                temp[0] = temp[1] = 1 - tempa;
                break;
            case 4:
                temp[0] = temp[2] = 1 - tempa;
                break;
            case 5:
                temp[1] = temp[2] = 1 - tempa;
                break;
            case 6:
                temp[0] = temp[1] = temp[2] = tempa;
                break;
        }
        
        return `rgb(${Math.round(temp[0] * 255)}, ${Math.round(temp[1] * 255)}, ${Math.round(temp[2] * 255)})`;
    }

    initializeBarPositions(configuration, chromosomeCollection) {
        const { genomeLibrary } = window.synVisio;
        const { markers } = configuration;
        
        const xchr = markers.source || [];
        const ychr = markers.target || [];
        
        const xdim = (configuration.barPlotView && configuration.barPlotView.width) || 800;
        const ydim = (configuration.barPlotView && configuration.barPlotView.height) || 600;
        
        const hmargin = xdim * 0.1;
        const vmargin = ydim * 0.05;
        const mid_y = ydim / 2;
        const mid_margin = vmargin;
        const bar_width = 10;
        
        // Find max chromosome length
        let max_len = 0;
        xchr.forEach(chr => {
            const chrData = chromosomeCollection.get(chr);
            if (chrData && chrData.width > max_len) {
                max_len = chrData.width;
            }
        });
        ychr.forEach(chr => {
            const chrData = chromosomeCollection.get(chr);
            if (chrData && chrData.width > max_len) {
                max_len = chrData.width;
            }
        });
        
        const rbars = xchr.length;
        const tbars = ychr.length;
        const ncells = Math.max(rbars, tbars);
        const cell_width = (xdim - 2 * hmargin) / ncells;
        const unit = (mid_y - hmargin - mid_margin) / max_len;
        
        // Position source bars (top)
        const sourceBars = xchr.map((chr, i) => {
            const chrData = chromosomeCollection.get(chr);
            const temp_x = hmargin + (i * cell_width) + (cell_width / 3);
            const temp_h = (chrData ? chrData.width : 0) * unit;
            const color = this.getChromosomeColor(i, rbars);
            
            return {
                key: chr,
                x: temp_x,
                y: mid_y - mid_margin - temp_h,
                width: bar_width,
                height: temp_h,
                color: color,
                chromosomeData: chrData
            };
        });
        
        // Position target bars (bottom)
        const targetBars = ychr.map((chr, i) => {
            const chrData = chromosomeCollection.get(chr);
            const temp_x = hmargin + (i * cell_width) + (cell_width / 3);
            const temp_h = (chrData ? chrData.width : 0) * unit;
            
            return {
                key: chr,
                x: temp_x,
                y: ydim - vmargin - temp_h,
                width: bar_width,
                height: temp_h,
                chromosomeData: chrData
            };
        });
        
        return {
            sourceBars,
            targetBars,
            unit,
            xdim,
            ydim,
            hmargin,
            vmargin,
            mid_y,
            mid_margin
        };
    }

    initializeAlignments(configuration, barPositions) {
        const { genomeLibrary } = window.synVisio;
        const { alignmentList } = configuration;
        const { sourceBars, targetBars, unit, ydim, vmargin } = barPositions;
        
        // Create maps for quick lookup
        const sourceBarMap = new Map();
        sourceBars.forEach((bar, index) => {
            sourceBarMap.set(bar.key, { ...bar, index });
        });
        
        const targetBarMap = new Map();
        targetBars.forEach(bar => {
            targetBarMap.set(bar.key, bar);
        });
        
        const alignments = [];
        
        // Process each alignment
        alignmentList.forEach(alignment => {
            if (alignment.hidden) return;
            
            const sourceChromosome = alignment.source;
            const targetChromosome = alignment.target;
            const links = alignment.links || [];
            
            if (links.length === 0) return;
            
            // Get first and last links to determine segment boundaries
            const firstLink = links[0];
            const lastLink = links[links.length - 1];
            
            const sourceGene1 = genomeLibrary.get(firstLink.source);
            const sourceGene2 = genomeLibrary.get(lastLink.source);
            const targetGene1 = genomeLibrary.get(firstLink.target);
            const targetGene2 = genomeLibrary.get(lastLink.target);
            
            if (!sourceGene1 || !sourceGene2 || !targetGene1 || !targetGene2) return;
            
            const sourceBar = sourceBarMap.get(sourceChromosome);
            const targetBar = targetBarMap.get(targetChromosome);
            
            // Draw alignment segment on target bar if source and target bars exist
            // Based on Java code: fil_start and fil_len calculation
            if (sourceBar && targetBar) {
                const targetChrData = targetBar.chromosomeData;
                if (targetChrData) {
                    // Java: fil_start = (chr_len - ss_s2[1]) * unit
                    // ss_s2[1] is the start position of the segment start gene
                    // ss_t2[1] is the start position of the segment end gene
                    const targetStartPos = Math.min(targetGene1.start, targetGene2.start);
                    const targetEndPos = Math.max(targetGene1.start, targetGene2.start);
                    const chrLen = targetChrData.width;
                    
                    // fil_start is distance from bottom to start of segment
                    const fil_start = (chrLen - targetStartPos) * unit;
                    // fil_len is the length of the segment
                    const fil_len = (targetEndPos - targetStartPos) * unit;
                    
                    if (fil_len > 0) {
                        // Java: g.fillRect(x, ydim-vmargin-fil_start, width, fil_len)
                        // y position is where rectangle starts (from top of SVG)
                        alignments.push({
                            x: targetBar.x + 1,
                            y: ydim - vmargin - fil_start,
                            width: 8,
                            height: fil_len,
                            color: sourceBar.color,
                            source: sourceChromosome,
                            target: targetChromosome
                        });
                    }
                }
            }
            
            // Also check reverse mapping (when target chromosome is in source bars)
            const reverseSourceBar = sourceBarMap.get(targetChromosome);
            const reverseTargetBar = targetBarMap.get(sourceChromosome);
            
            if (reverseSourceBar && reverseTargetBar) {
                const sourceChrData = reverseTargetBar.chromosomeData;
                if (sourceChrData) {
                    const sourceStartPos = Math.min(sourceGene1.start, sourceGene2.start);
                    const sourceEndPos = Math.max(sourceGene1.start, sourceGene2.start);
                    const chrLen = sourceChrData.width;
                    
                    const fil_start = (chrLen - sourceStartPos) * unit;
                    const fil_len = (sourceEndPos - sourceStartPos) * unit;
                    
                    if (fil_len > 0) {
                        alignments.push({
                            x: reverseTargetBar.x + 1,
                            y: ydim - vmargin - fil_start,
                            width: 8,
                            height: fil_len,
                            color: reverseSourceBar.color,
                            source: targetChromosome,
                            target: sourceChromosome
                        });
                    }
                }
            }
        });
        
        return alignments;
    }

    render() {
        let { configuration, genomeData, isDark, plotType } = this.props;
        const { isChromosomeModeON = false } = configuration;
        
        // Set default dimensions if not in configuration
        if (!configuration.barPlotView) {
            configuration = {
                ...configuration,
                barPlotView: {
                    width: 800,
                    height: 600
                }
            };
        }
        
        const barPositions = this.initializeBarPositions(configuration, genomeData.chromosomeMap);
        const alignments = this.initializeAlignments(configuration, barPositions);
        
        return (
            <div className={(plotType != 'dashboard' ? 'barPlotViewWrapper only-barplotview' : 'barPlotViewWrapper')}>
                <div className='barPlotViewRoot'>
                    {isChromosomeModeON &&
                        <InlayIcon
                            x={barPositions.xdim - 50}
                            y={20}
                            onClick={this.resetZoom} />}
                    <svg
                        style={{
                            'background': isDark ? isChromosomeModeON ? '#1a1c22' : '#252830' : 'white',
                            'margin': '10px 0px 0px 10px'
                        }}
                        id='bar-plot-graphic'
                        className={'barPlotViewSVG exportable-svg snapshot-thumbnail ' + (isChromosomeModeON ? 'chrom-mode' : '')}
                        ref={node => this.outerG = node}
                        height={barPositions.ydim}
                        width={barPositions.xdim}>
                        
                        <g ref={node => this.innerG = node}>
                            <BarPlotBars 
                                sourceBars={barPositions.sourceBars}
                                targetBars={barPositions.targetBars}
                                isDark={isDark}
                                xdim={barPositions.xdim}
                                ydim={barPositions.ydim}
                                mid_y={barPositions.mid_y}
                                vmargin={barPositions.vmargin}
                            />
                            <BarPlotAlignments 
                                alignments={alignments}
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

export default connect(mapStateToProps)(BarPlotView);

