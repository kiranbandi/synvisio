import React, { Component } from 'react';
import { connect } from 'react-redux';
import { scaleLinear, scaleLog, schemeCategory10 } from 'd3';
import _ from 'lodash';
import { RadioButton } from '../';

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
        this.radioChange = this.radioChange.bind(this);
    }

    radioChange(event) {
        this.setState({ selectedRadio: event.target.value });
    }

    render() {

        let { configuration } = this.props;

        let { selectedRadio } = this.state;



        let availableWidth = configuration.panelView.width - 200;

        let style = {
            width: '200px',
            height: configuration.panelView.height
        }

        const margin = { top: 100, right: 40, bottom: 40, left: 40 },
            width = availableWidth - margin.left - margin.right,
            height = configuration.panelView.height - margin.top - margin.bottom;

        let { alignmentList = [] } = configuration;

        let valueList = alignmentList.map((o) => o[selectedRadio]).sort((a, b) => a - b);

        let min = valueList[0],
            max = valueList[valueList.length - 1];

        if (selectedRadio == 'e_value') {
            min = valueList[_.findIndex(valueList, (o) => o != 0)];
        }

        let x = scaleLinear()
            .domain([0, alignmentList.length])
            .range([0, width]);

        let y = selectedRadio == 'e_value' ? scaleLog() : scaleLinear();
        y = y.domain([min, max])
            .range([selectedRadio == 'e_value' ? height - 2 : height, 0]);


        let dotList = alignmentList.map((alignment, index) => {

            const sourceIndex = configuration.markers.source.indexOf(alignment.source),
                style = {
                    'fill': (sourceIndex == -1) ? '#2a859b' : schemeCategory10[sourceIndex % 10]
                };

            let cy;

            if (selectedRadio == 'e_value' && alignment[selectedRadio] == 0) {
                cy = height;
            }
            else {
                cy = y(alignment[selectedRadio]);
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
        dotList.push(<line key='panel-x' className='panel-axis' x1={x(0) - 10} y1={y(min) + 10} x2={x(alignmentList.length)} y2={y(min) + 10}></line>);
        dotList.push(<line key='panel-y' className='panel-axis' x1={x(0) - 10} y1={y(min) + 10} x2={x(0) - 10} y2={y(max)}></line>);

        // Append axis labels to the same list
        dotList.push(<text key='label-x' className='label-x panel-label' x={x(alignmentList.length) - 75} y={y(min) + 30} >Alignments</text>);
        dotList.push(<text key='label-y' className='label-y panel-label' x={x(0) - (this.optionLabels[selectedRadio].length * 8)} y={y(max) - 20} >{this.optionLabels[selectedRadio]}</text>);

        return (
            <div className='panelViewRoot' >
                <svg width={availableWidth} height={configuration.panelView.height} >
                    <g transform={"translate(" + margin.left + "," + margin.top / 2 + ")"}>
                        {dotList}
                    </g>
                </svg>
                <div className='togglePanel' style={style}>
                    {_.map(this.optionLabels, (value, key) => {
                        return <RadioButton
                            key={key}
                            value={key}
                            id={key}
                            label={value}
                            onChange={this.radioChange}
                            checked={this.state.selectedRadio == key} />
                    })}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { configuration: state.oracle.configuration };
}

export default connect(mapStateToProps)(PanelView);