/*global Chart*/
import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs';
import Chart from 'chart.js'

// Chart.defaults.global.responsive = true;
// Chart.defaults.global.cutoutPercentage=30;
// Chart.defaults.Doughnut.segmentStrokeColor='#252830';

export default class GraphCard extends Component {

    constructor(props) {
        super(props);
        this.onChartClick = this.onChartClick.bind(this);

    }

    mixinData() {

        const { availableSlots, booked, parked } = this.props.slotData;

        return [
            {
                value: booked,
                color: "#9f86ff",
                label: "Booked"
            },
            {
                value: parked,
                color: "#1bc98e",
                label: "Parked"
            },
            {
                value: availableSlots,
                color: "#1ca8dd",
                label: "Available"
            }];


    }

    onChartClick(e) {

        let { onClick, locationKey, selected } = this.props;
        onClick(e, locationKey);

    }

    render() {

        return (
            <div className='col-lg-4 col-md-6'>
                <div className={`graph-container m-a ${this.props.selected ? 'selected' : ''}`} onClick={this.onChartClick}>
                    <h4 className="slot-name m-a-md">
                        {this.props.slotData.title}
                    </h4>
                    <Doughnut ref='chart' data={this.mixinData()} />
                    <DoughnutChartLegend data={this.mixinData()} />
                </div>
            </div>
        );
    }
}

export class DoughnutChartLegend extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        let displayLegend = this.props.data.map((item, index) => {
            let tdStyle = { "backgroundColor": item.color, width: "40px" };
            return <tr key={index}>
                <td style={tdStyle}></td>
                <td>{item.label}</td>
                <td>{item.value}</td>
            </tr>;
        });
        return (<div className="table-responsive legend-table text-center">
            <table className="table table-condensed">
                <tbody>
                    {displayLegend}
                </tbody>
            </table>
        </div>);
    }
}