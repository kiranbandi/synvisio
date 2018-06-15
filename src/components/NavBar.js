/*global $*/
import React, {Component} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import * as sessionActions from '../redux/actions/sessionActions';
import {bindActionCreators} from 'redux';

class NavBar extends Component {
    
    constructor(props) {
            super(props);
             this.logOut = this.logOut.bind(this);
    }

    componentDidMount(){
    //fix for mobile browsers , navbar doesnt automatically collapse and needs to be toggled manually
        $('.navbar-collapse').on('click',function(e) {
             var toggle = $(".navbar-toggle").is(":visible");
                if( $(e.target).is('a') && toggle ) {
                    $(this).collapse('hide');
                }
        });

    }
    
    logOut(event) {
    event.preventDefault();
    this.props.actions.logOutUser();
  }
    
  	render() {
		return (
                <nav className="navbar navbar-inverse navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                            <Link data-toggle="collapse" data-target="#navbar" className="navbar-brand navbar-brand-emphasized" to='/'>
                                <span className="icon icon-home navbar-brand-icon"></span> Home
                            </Link>
                        </div>
                        <div id="navbar" className="navbar-collapse collapse ">
                                
                            <ul className='nav navbar-nav'>
                                <li>
                                    <Link to='/Dashboard'>
                                        <span className="icon icon-line-graph"></span> Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link to='/Configuration'>
                                        <span className="icon icon-tools"></span> Configuration
                                    </Link>
                                </li>                                
                            </ul>
                            
                            <ul className='nav navbar-nav navbar-right'>
                                <li> { this.props.logged_in ?
                                        <Link to='/Logout' onClick={this.logOut}>
                                        <span className="icon icon-log-out"></span> Logout
                                        </Link>
                                        :
                                        <Link to='/Login'>
                                            <span className="icon icon-user"></span> Login
                                        </Link>
                                     }
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
		);
	}
}  

function mapStateToProps(state, ownProps) {  
  return {logged_in: state.session.sessionStatus};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(sessionActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);