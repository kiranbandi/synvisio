/*global $*/
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { NotFound, Home, ParkCar, Dashboard, Login, Configuration } from './pages';
import { Container } from './components';
import { checkloginStatus } from './utils/Auth';

import configureStore from './redux/store/configureStore';
import { Provider } from 'react-redux';


//Root sass file for webpack to compile
import './sass/main.scss';

//Initial Default settings 

const store = configureStore();

class App extends Component {

  render() {
    return (
      <Provider store={store}>
        <Router history={hashHistory}>
          <Route path='/' component={Container}>
            <IndexRoute component={Home} />
            <Route path='ParkCar/:ticketId' component={ParkCar} onEnter={checkloginStatus} />
            <Route path='Login' component={Login} />
            <Route path='Dashboard' component={Dashboard} onEnter={checkloginStatus} />
            <Route path='Configuration' component={Configuration} onEnter={checkloginStatus} />
            <Route path='*' component={NotFound} />
          </Route>
        </Router>
      </Provider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))

