/*global $*/
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Dashboard } from './pages';
import configureStore from './redux/store/configureStore';
import { Provider } from 'react-redux';

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
        <Dashboard />
      </Provider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('synvisio-content-mount'))

