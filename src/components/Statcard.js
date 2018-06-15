/*global Chart*/
import React, {Component} from 'react';
import { Doughnut } from 'react-chartjs';
import Chart from 'chart.js'

Chart.defaults.global.responsive = true;

var Statcard = (props) => {
     return (<div className={`statcard-container m-b ${props.className}`}>
                <div className={`statcard statcard-${ props.type }`}>
                  <div className="title-box">
                    <span className="statcard-desc">{ props.title }</span>
                    <h2 className="statcard-number">
                      { props.count }
                    </h2>
                  </div>
                 {!!props.icon && <span className={`icon icon-${ props.icon }`}></span> } 
                </div>
              </div>);
              
};

Statcard.defaultProps = {
  className:'col-sm-6 col-md-3',
  type:'primary'
}

export default Statcard;

