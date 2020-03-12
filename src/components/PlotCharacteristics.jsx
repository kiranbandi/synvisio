import React, { Component } from 'react';
import { RadioButton } from './';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setPlotProps, setTrackType, setMultiLevelType } from '../redux/actions/actions';

class PlotCharacterisitics extends Component {

    constructor(props) {
        super(props);
        this.radioChange = this.radioChange.bind(this);
        this.multiRadioChange = this.multiRadioChange.bind(this);
    }

    radioChange(event) {
        const value = event.target.value;
        if (value.indexOf('level') > -1) {
            this.props.actions.setPlotProps('level', value == 'level-multi');
        }
        else {
            this.props.actions.setPlotProps('type', value);
        }
    }
    multiRadioChange(event) {
        const value = event.target.value;
        this.props.actions.setMultiLevelType(value);
    }

    render() {

        const { multiLevel, multiLevelType, configuration, plotType } = this.props;

        return (
            <div className='plot-type-panel'>

                <div className='snapshot-header'>
                    <h4>
                        Chart Configuration
                        <span className="icon icon-chevron-right"></span>
                    </h4>
                </div>

                <div className='snapshot-inner'>
                    <span className='text-info info-text-message'> Select the type of analysis you want to do, single level analysis is for pairwise comparisions while multi level analysis is for comparing more than 2 entities at a time
                    through stacked parallel plots or hive plots.</span>
                    <RadioButton value={'level-single'} id={'level-single'} className='conf-radio' name='level-select'
                        label={"Single Level Analysis"}
                        onChange={this.radioChange}
                        checked={!multiLevel} />
                    <RadioButton value={'level-multi'} id={'level-multi'} className='conf-radio' name='level-select'
                        label={"Multi Level Analysis"}
                        onChange={this.radioChange}
                        checked={multiLevel} />
                    {!multiLevel && <div>
                        <RadioButton value={'dashboard'} id={'dashboard'} className='conf-radio' name='plot-select'
                            label={"Default Dashboard"}
                            onChange={this.radioChange}
                            checked={plotType == 'dashboard'} />
                        <RadioButton value={'dotplot'} id={'dotplot'} className='conf-radio' name='plot-select'
                            label={"Dot Plot"}
                            onChange={this.radioChange}
                            checked={plotType == 'dotplot'} />
                        <RadioButton value={'linearplot'} id={'linearplot'} className='conf-radio' name='plot-select'
                            label={"Linear PLot"}
                            onChange={this.radioChange}
                            checked={plotType == 'linearplot'} />
                    </div>}

                    {multiLevel && <div>
                        <RadioButton value={'tree'} id={'tree'} className='conf-radio' name='multi-view-select'
                            label={"Tree View"}
                            onChange={this.multiRadioChange}
                            checked={multiLevelType == 'tree'} />
                        <RadioButton value={'hive'} id={'hive'} className='conf-radio' name='multi-view-select'
                            label={"Hive View"}
                            onChange={this.multiRadioChange}
                            checked={multiLevelType == 'hive'} />
                        <RadioButton value={'cube'} id={'cube'} className='conf-radio' name='multi-view-select'
                            label={"3D Cube View"}
                            onChange={this.multiRadioChange}
                            checked={multiLevelType == 'cube'} />
                    </div>}

                    {/* {(plotType == 'linearplot' || plotType == 'dotplot') && (!multiLevel) && <div>
                        <h4 className="sub-info">If a track file has been provided choose one of the following options to view tracks , this feature is only available for dotplots and linearplots -</h4>
                        <RadioButton value={'track-heatmap'} id={'track-heatmap'} className='conf-radio' name='track-select'
                            label={"Heatmap"}
                            onChange={this.radioChange}
                            checked={trackType == 'track-heatmap'} />
                        <RadioButton value={'track-histogram'} id={'track-histogram'} className='conf-radio' name='track-select'
                            label={"Histogram"}
                            onChange={this.radioChange}
                            checked={trackType == 'track-histogram'} />

                        <RadioButton value={'track-line'} id={'track-line'} className='conf-radio' name='track-select'
                            label={"Line"}
                            onChange={this.radioChange}
                            checked={trackType == 'track-line'} />
                        <RadioButton value={'track-scatter'} id={'track-scatter'} className='conf-radio' name='track-select'
                            label={"Scatter"}
                            onChange={this.radioChange}
                            checked={trackType == 'track-scatter'} />
                    </div>} */}
                </div>
            </div>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ setPlotProps, setTrackType, setMultiLevelType }, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(PlotCharacterisitics);




