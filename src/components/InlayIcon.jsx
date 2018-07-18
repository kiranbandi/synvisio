import React from 'react';

export default ({ top = '20', right = '30', icon = 'cycle', onClick }) => {

    const iconStyle = {
        'position': 'absolute',
        'top': top + 'px',
        'right': right + 'px'
    }

    return (
        <button style={iconStyle} className="inlay-icon btn btn-primary-outline" onClick={onClick}>
            <span className={'icon icon-' + icon}></span>
        </button>);

}
