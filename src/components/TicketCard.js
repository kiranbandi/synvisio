import React, { Component } from 'react';
import ajaxHelpers from '../utils/ajaxHelpers';
import moment from 'moment';
import Loading from 'react-loading';

export default class TicketCard extends Component {

constructor(props) {
  super(props);
  this.state = {
  	ticketData:{},
  	loading:true
  };
  this.updateTicket = this.updateTicket.bind(this);

}

componentDidMount() {
    ajaxHelpers.ticketCall(this.props.ticketId,'getTicket').then((data)=> {
      this.setState({ticketData:data});
    }).always(()=>{
      this.setState({loading:false});
    });
}

updateTicket(status){
    this.setState({loading:true});
      ajaxHelpers.ticketCall(this.props.ticketId,'parkTicket').then((data)=> {
      this.setState({ticketData:data});
      }).always(()=>{
      this.setState({loading:false});
    });
}


getStatusIndicator(){
  
  const { status } = this.state.ticketData || { };
  
  let statusObject = {
      statClass :"primary",
      alertClass :"success",
      alertIcon :"check"
  };
      
    switch (status) {
      
      case 'parked':
      statusObject.statClass ="info",
      statusObject.alertClass ="success",
      statusObject.alertIcon = "thumbs-up";
      break;
          
      case 'cancelled':
      statusObject.statClass ="danger",
      statusObject.alertClass ="warning",
      statusObject.alertIcon = "circle-with-cross";
      break;
        
      case 'exited':
      statusObject.statClass ="success",
      statusObject.alertClass ="primary",
      statusObject.alertIcon = "home";
      break;
        
      case 'expired':
      statusObject.statClass ="danger",
      statusObject.alertClass ="warning",
      statusObject.alertIcon = "emoji-sad";
      break;
        
    }  
    
    return statusObject;
        
}

render () {
  
    const { ticketData , loading } = this.state ,
          { alertClass , alertIcon , statClass } = this.getStatusIndicator();

    return (
    	<div className='ticket-card-container'>
        <div className="hr-divider">
  					  <h4 className="hr-divider-content hr-divider-heading">
  					 Parking Ticket 
  					  </h4>
  			</div>
			
      { !loading  ? 
       
       <div>

          <div className={`statcard statcard-${statClass} p-a-md`}>
            <h3 className="statcard-number">
              {ticketData.locationDesc}
            </h3>
            
          <span className={`parking-status-indicator label-${alertClass}`}>
              <span className={`icon icon-${alertIcon}`}></span>
              {ticketData.status}
          </span>


          <div className='name-slot'>
            <h3 className="statcard-desc m-a">{`Name : ${ticketData.firstName} ${ticketData.lastName}`}</h3>
            <h3 className="statcard-desc ">{`Company : ${ticketData.company}`}</h3>
            <h3 className="statcard-desc">{`Booking Time : ${moment(ticketData.time*1000).format("ddd, MMM DD YYYY, h:mm a")}`}</h3>
            { !!ticketData.parkedtime && <h3 className="statcard-desc">{`Parked Time : ${moment(ticketData.parkedtime*1000).format("ddd, MMM DD YYYY, h:mm a")}`}</h3>}
            { !!ticketData.exitedtime && <h3 className="statcard-desc">{`Exited Time : ${moment(ticketData.exitedtime*1000).format("ddd, MMM DD YYYY, h:mm a")}`}</h3>}
            { !!ticketData.cancelledtime && <h3 className="statcard-desc">{`Cancelled Time : ${moment(ticketData.cancelledtime*1000).format("ddd, MMM DD YYYY, h:mm a")}`}</h3>}
          </div>
          </div>
          
        { ticketData.status=="booked" &&
        <button onClick={this.updateTicket} type="button" className="btn btn-lg btn-success m-a">
          <span className="icon icon-arrow-with-circle-up"></span>
          PARK
        </button> }

      </div> 
      
     : <Loading type='spin' color='#3fbfe2' delay={-1} />}
      
      </div>
    )
  }
};
