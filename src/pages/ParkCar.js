import React, { Component } from 'react';
import { TicketCard } from '../components';

class ParkCar extends Component {

constructor(props) {
  super(props);
}

render () {
    return (
              <div className='park-car-container container col-lg-4 col-lg-offset-4 col-xs-10 col-xs-offset-1'>
               <TicketCard ticketId={this.props.params.ticketId}/>
              </div>
    )
  }
};

export default ParkCar;