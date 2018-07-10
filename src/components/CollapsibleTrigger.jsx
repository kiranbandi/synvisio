import React, { Component } from 'react';

export default ({ open = false }) =>
    <div className='snapshot-header'>
        <h4>
            Snaphot Store
    <span className={"icon icon-chevron-" + (open ? 'down' : 'right')}></span>
        </h4>
    </div>;




