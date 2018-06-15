import React, { Component } from 'react';
import { GraphCard,Statcard } from '../components';
import Loading from 'react-loading';
import ajaxHelpers from '../utils/ajaxHelpers'

var locationData = [
    {
        'title':'Gurgaon Infospace',
        'availableSlots':130,
        'booked':27,
        'parked':101,
        'cancelled':23,
        'exited':10,
        'expired':10
    },
    {
        'title':'Delhi Shastri Park',
        'availableSlots':65,
        'booked':31,
        'parked':30,
        'cancelled':42,
        'exited':10,
        'expired':10
    },
    {
        'title':'Gurgaon 7B',
        'availableSlots':0,
        'booked':0,
        'parked':0,
        'cancelled':0,
        'exited':0,
        'expired':0
    }] ,
    
    statData = [
    {
        'title':'Slots Available',
        'icon':'location',
        'type':'primary',
        'keyedIndex':'availableSlots'
    },
    {
        'title':'Slots Booked',
        'icon':'clipboard',
        'type':'info',
        'keyedIndex':'booked'
    },
    {
        'title':'Slots Parked',
        'icon':'new-message',
        'type':'success',
        'keyedIndex':'parked'
    },
    {
        'title':'Bookings Cancelled',
        'icon':'block',
        'type':'warning',
        'keyedIndex':'cancelled'
    },
    {
        'title':'Bookings Expired',
        'icon':'stopwatch',
        'type':'danger',
        'keyedIndex':'expired'
    },
    {
        'title':'Slots Exited',
        'icon':'align-top',
        'type':'primary',
        'keyedIndex':'exited'
    }
    ];
    

class Dashboard extends Component {

constructor(props) {
  super(props);
  this.state={
      locationKey:false,
      loading: true
  };
  this.setKey = this.setKey.bind(this);
}

setKey(e,locationKey){
    this.setState({locationKey});    
}

componentDidMount() {
    ajaxHelpers.getStatus('ggn-7b').then((data)=> {
      let { booked=0, cancelled=0, availableSlots=0, parked=0, exited=0, expired=0 } = data;    
      locationData[2] = Object.assign({},locationData[2],{booked,cancelled,availableSlots,parked,exited,expired});
    }).always(()=>{
      this.setState({loading:false});
    });
}


locationDataMapper(val,ind){
    let type='primary';

    if(val.availableSlots==0){
        type='danger';
    }


 return <Statcard key={ind}
        title={val.title}
        count={`Free Slots - ${val.availableSlots} `}
        type={type}
        className={`col-md-4 col-sm-6`}
        />;
}

render () {
    const graphList = locationData.map((val,ind)=> <GraphCard onClick={this.setKey} selected={this.state.locationKey===ind} key={ind} locationKey={ind} slotData={val}/>),
          statCardList =this.state.locationKey!==false?statData.map((val,ind)=> {
           return <Statcard className={`col-md-4 col-sm-6`} key={ind} {...val} count={locationData[this.state.locationKey][val.keyedIndex]}/>;   
          }):null ,
          quickViewData = locationData.map(this.locationDataMapper),
          loading = this.state.loading ;
          
    return (

        	<div className='dashboard-container container m-t'>
        	    
                { !loading  ?
                    <div>

        		<div className="row hr-divider">
        		  <h4 className="hr-divider-content hr-divider-heading">
        		  Parking Stats Quick-View
        		  </h4>
        		</div>
            	<div className='row quickViewBox'>
                    {quickViewData}
                </div>
    		

            	<div className="row hr-divider">
        		  <h4 className="hr-divider-content hr-divider-heading">
        		  Stats across all locations
        		  </h4>
        		</div>
                <div className='row'>
                    {graphList}
                </div>
    	
            	{ this.state.locationKey!==false && 
            	<div className='row locationStatBox'>
            	<div className="hr-divider">
        		  <h4 className="hr-divider-content hr-divider-heading">
        		  Parking Stats at {locationData[this.state.locationKey].title}
        		</h4>
        		</div>
                        {statCardList}
                </div> } 
        	   
           </div>  
             : <span className='loadingContainer'><Loading type='spin' color='#3fbfe2' /></span> }

                 </div>  

    );
    
  }
}

export default Dashboard;


