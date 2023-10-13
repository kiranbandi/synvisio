/*global $*/
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import {
  NotFound, Home, Dashboard, LinkageMap,BlastTrackProcessor,
  Upload, PyadhoreProcessor, MultiGenome, MultiHive,MapBlast 
} from './pages';
import { Container } from './components';
import configureStore from './redux/store/configureStore';
import { Provider } from 'react-redux';

/* BASIC FUNCTIONALITY RULES written by  "He who must not be named" - do not alter ¯\_(ツ)_/¯  */

// Load the Data gff file and syteny collinearity file 
// Parse the Data and store it in appropriate data structures 
// Filter it for useful information and mine it to decide on what to represent 
// Create the plots 
// Refine the plots 
// Add interactivity to the plots 

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
            <Route path='dashboard(/:sourceID)' component={Dashboard} />
            <Route path='upload' component={Upload} />
            <Route path='pyadhore-processor' component={PyadhoreProcessor} />
            <Route path='blast-to-track' component={BlastTrackProcessor} />
            <Route path='map-to-blast' component={MapBlast} />
            <Route path='multi-genome(/:sourceID)' component={MultiGenome} />
            <Route path='multi-hive(/:sourceID)' component={MultiHive} />
            <Route path='linkage-map(/:sourceID)' component={LinkageMap} />
            <Route path='*' component={NotFound} />
          </Route>
        </Router>
      </Provider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))

