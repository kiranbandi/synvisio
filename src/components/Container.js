import React, {Component} from 'react';
import { NavBar} from './';

export default class Container extends Component {
    
    constructor(props) {
        super(props);
    }

  	render() {
		return (
		      <div id='app-container'>
                {/* navbar content , common for entire application */}
                <NavBar/>
                {this.props.children}
          </div>
		);
	}
}  