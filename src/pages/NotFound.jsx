import React, { Component } from 'react';
import { Link } from 'react-router';

export default class NotFound extends Component {
	render() {
		return (
			<div className='not-found container m-t'>
				<div className="alert alert-danger text-center" role="alert">
					<h3><strong>Oh snap ! Error 404 ! Page Not Found ! </strong></h3>
				</div>
				<div className="well well-lg align-center">
					<strong>Seems like you took a wrong turn and landed here or maybe the page you
					    are trying to view is still under development .As you can see below we are trying to fix this issue as soon as possible.Please click <Link to='/'>HERE</Link> to head back home.</strong>
					<img className='img-responsive error-image' src="assets/img/404.jpg" alt="Error Image" />
				</div>
			</div>
		)
	}
};
