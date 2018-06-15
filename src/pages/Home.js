import React, { Component } from 'react';

let backgroundStyle = { background: 'url(assets/img/choozago.jpg)' };

class Home extends Component {
  render() {
    return (
      <div>

        <div className="home-header" style={backgroundStyle}>
          <div className="container">
            <div className='col-lg-12 text-lg-left text-md-center text-sm-center text-xs-center'><h1>SynVisio</h1>
              <p>An Interactive Multiscale Synteny Visualization Tool for <a href="http://chibba.pgml.uga.edu/mcscan2/">McScanX</a>.</p>
            </div>
          </div>
        </div>

        <div className="container home-body">
          <h1>How does it work ?</h1>
          <p>You can book your car/bike parking ticket for your office location even if from home. Check real-time parking availability status right from your smart phone and decide conveniently.</p>
          <p>User need to register through an internal portal to avail this service. This info will be used to authenticate user in the mobile app.</p>
          <p>User can check real-time parking availability on their smart-phone any time (even at home). It'll give them flexibility to decide conveniently.</p>
          <p>User can book parking ticket in advance (even at home) for same day. Ticket will be valid for a duration (say 1.5 hours, depends on city, traffic condition etc.) User can cancel ticket any time before expiry.</p>
          <p>User need to show valid ticket while entering into office premises. Security personnel will scan ticket and mark as 'occupied'. User need to show same ticket to security personnel in exit to mark it 'released'.</p>
          <p>For 'No show', booking will be marked as 'fraud' and x such incidents will block user for further ticket booking. To avoid 'No show' user has to enter corresponding parking area before ticket expiry or cancel his ticket.</p>

        </div>
      </div >

    )
  }
};

export default Home;


