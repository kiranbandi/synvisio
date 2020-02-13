import React, { Component } from 'react';
import { connect } from 'react-redux';
import { scaleLinear, scaleLog, schemeCategory10 } from 'd3';
import _ from 'lodash';
import RadioButton from './RadioButton';
import Slider from 'rc-slider';
import { bindActionCreators } from 'redux';
import { refineAlignmentList } from '../redux/actions/actions';

class PanelView extends Component {

    constructor(props) {
        super(props);
        this.optionLabels = {
            'count': 'Count',
            'score': 'Match Score',
            'e_value': 'E value'
        };
        this.state = {
            selectedRadio: 'count'
        };
        this.scales = {};
        this.radioChange = this.radioChange.bind(this);
        this.onSliderChange = this.onSliderChange.bind(this);
        this.onReset = this.onReset.bind(this);
        this.onRemoveBlockView = this.onRemoveBlockView.bind(this);
    }

    radioChange(event) {
        this.setState({ selectedRadio: event.target.value });
    }

    onReset(event) {
        const { configuration, refineAlignmentList, originalAlignmentList } = this.props;
        const { isChromosomeModeON, alignmentList } = configuration;
        refineAlignmentList({}, isChromosomeModeON ? originalAlignmentList : alignmentList);

    }

    onRemoveBlockView() {
        const { configuration, refineAlignmentList, originalAlignmentList } = this.props;
        let { isChromosomeModeON, alignmentList, filterLevel } = configuration;
        filterLevel = { ...filterLevel, alignment: false };
        refineAlignmentList(filterLevel, isChromosomeModeON ? originalAlignmentList : alignmentList);
    }

    onSliderChange(value) {
        const { min_height, max_height, y } = this.scales,
            { selectedRadio } = this.state,
            { configuration, refineAlignmentList } = this.props;
        let line_pos_value = y.invert(((value * (max_height - min_height)) / 19) + min_height);
        let { filterLevel = {} } = this.props.configuration;

        let adjustToZero = false;

        // For E value since the scale is adjusted the minimum value is pushed to zero 
        if (selectedRadio == 'e_value' && value == 0) {
            adjustToZero = true;
        }

        filterLevel[selectedRadio] = { 'sliderValue': value, 'nominalValue': line_pos_value, adjustToZero };
        refineAlignmentList(filterLevel, configuration.alignmentList);
    }

    render() {

        let { configuration } = this.props,
            { selectedRadio } = this.state,
            leftWidth = 260,
            availableWidth = configuration.panelView.width - leftWidth;

        let style = {
            width: (leftWidth / 2) + 'px',
            height: configuration.panelView.height * 0.80,
            margin: configuration.panelView.height * 0.1 + "px 0px"
        };
        let labelContainerStyle = {
            width: (leftWidth / 4) + 'px',
            height: configuration.panelView.height * 0.70,
            margin: ((configuration.panelView.height * 0.1) + "px 0px ") + ((configuration.panelView.height * 0.2) + "px 0px")
        };
        let sliderStyle = {
            ...labelContainerStyle,
            paddingLeft: (leftWidth / 8) + 'px'
        };

        const margin = { top: 100, right: 40, bottom: 40, left: 40 },
            width = availableWidth - margin.left - margin.right,
            height = configuration.panelView.height - margin.top - margin.bottom;

        let { alignmentList = [], filterLevel = {} } = configuration;

        // we cannot hide all hidden alignments so we selectively 
        // remove only the ones not available for the present markers
        if (configuration.isChromosomeModeON) {
            alignmentList = _.filter(alignmentList, (o) => {
                return (filterLevel.source == o.source && filterLevel.target == o.target);
            })
        }

        let valueList = alignmentList.map((o) => o[selectedRadio]).sort((a, b) => a - b);

        let min = valueList[0],
            max = valueList[valueList.length - 1];

        if (selectedRadio == 'e_value') {
            min = valueList[_.findIndex(valueList, (o) => o != 0)];
            min = Math.max((max / 1.0e300), min);
        }

        let x = scaleLinear()
            .domain([0, alignmentList.length])
            .range([0, width]);

        let y_range = [selectedRadio == 'e_value' ? height - 2 : height, 0];
        let y_scale = selectedRadio == 'e_value' ? scaleLog().base(Math.E) : scaleLinear();

        this.scales.y = y_scale.domain([min, max]).range(y_range);
        this.scales.min_height = height;
        this.scales.max_height = 0;

        let filterLevelValue = filterLevel[selectedRadio] || { 'sliderValue': 0, 'nominalValue': min, 'adjustToZero': (selectedRadio == 'e_value') };

        let dotList = alignmentList.map((alignment, index) => {
            const sourceIndex = configuration.markers.source.indexOf(alignment.source),
                style = {
                    'fill': (sourceIndex == -1) ? '#2a859b' : schemeCategory10[sourceIndex % 10]
                };
            let cy;

            if ((selectedRadio == 'e_value' && alignment[selectedRadio] == 0) || (selectedRadio == 'e_value' && alignment[selectedRadio] < min)) {
                cy = height;
            }
            else {
                cy = this.scales.y(alignment[selectedRadio]);
            }

            return <circle
                key={'scatter-plot-' + index}
                className='scatter-plot-dot'
                r='2.5'
                cx={x(index)}
                cy={cy}
                style={style}>
                <title>
                    {alignment.source + " => " + alignment.target +
                        "\n type : " + alignment.type +
                        "\n E value : " + alignment.e_value +
                        "\n score : " + alignment.score +
                        "\n count : " + alignment.count}
                </title>
            </circle>
        });

        // Append axises to the same list
        dotList.push(<line key='panel-x' className='panel-axis' x1={x(0) - 10} y1={this.scales.y(min) + 10} x2={x(alignmentList.length)} y2={this.scales.y(min) + 10}></line>);
        dotList.push(<line key='panel-y' className='panel-axis' x1={x(0) - 10} y1={this.scales.y(min) + 10} x2={x(0) - 10} y2={this.scales.y(max)}></line>);

        // Append axis labels to the same list
        dotList.push(<text key='label-x' className='label-x panel-label' x={x(alignmentList.length) - 75} y={this.scales.y(min) + 30} >Alignments</text>);
        dotList.push(<text key='label-y' className='label-y panel-label' x={x(0) - (this.optionLabels[selectedRadio].length * 8)} y={this.scales.y(max) - 20} >{this.optionLabels[selectedRadio]}</text>);

        // Append Filter Level Line 
        dotList.push(<line key='filter-level-line' className='panel-axis filter-level-line' x1={x(0) - 10} y1={this.scales.y(filterLevelValue.nominalValue)} x2={x(alignmentList.length)} y2={this.scales.y(filterLevelValue.nominalValue)}></line>)
        // Append Label for Filter Level Line
        dotList.push(
            <text key='label-filter-line'
                className='label-filter-line panel-label'
                x={x(0)}
                y={this.scales.y(filterLevelValue.nominalValue) - 15} >
                {this.optionLabels[selectedRadio]} >= {selectedRadio == 'e_value' ? (filterLevelValue.adjustToZero ? '0' : filterLevelValue.nominalValue) : filterLevelValue.nominalValue.toFixed(3)}
            </text>);

        return (
            <div className='panelViewRoot' >
                <div className='toggle-container' style={style}>
                    {_.map(this.optionLabels, (value, key) => {
                        return <RadioButton
                            key={key}
                            value={key}
                            id={key}
                            label={value}
                            onChange={this.radioChange}
                            checked={this.state.selectedRadio == key} />
                    })}
                    <button className="btn btn-danger-outline m-t-md" onClick={this.onReset}>
                        Reset <span className="icon icon-cycle"></span>
                    </button>
                    {configuration.isBlockModeON &&
                        <button className="btn btn-danger-outline m-t" onClick={this.onRemoveBlockView}>
                            Blockview  <span className="icon icon-ccw"></span>
                        </button>}
                </div>
                <div className='toggle-container' style={sliderStyle}>
                    <Slider min={0} max={19} value={filterLevelValue.sliderValue} vertical={true} onChange={this.onSliderChange} />
                </div>
                <div className='toggle-container slider-label-container' style={labelContainerStyle}>
                    <p className='slider-top-label'>MAX</p>
                    <p className='slider-bottom-label'>MIN</p>
                </div>
                <svg width={availableWidth} height={configuration.panelView.height} >
                    <g transform={"translate(" + margin.left + "," + margin.top / 2 + ")"}>
                        {dotList}
                    </g>
                </svg>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return { refineAlignmentList: bindActionCreators(refineAlignmentList, dispatch) };
}

function mapStateToProps(state) {
    return {
        originalAlignmentList: state.oracle.configuration.alignmentList
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PanelView);