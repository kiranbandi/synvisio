import React from 'react';

export default ({ top = '20', right = '30', fontSize = '25', type = 'primary', icon = 'cycle', onClick }) => {

    const iconStyle = {
        'position': 'absolute',
        'top': top + 'px',
        'right': right + 'px',
        'fontSize': fontSize + 'px'
    }

    return (
        <button style={iconStyle} className={"inlay-icon btn btn-" + type + "-outline"} onClick={onClick}>
            <span className={'icon icon-' + icon}></span>
        </button>);

}
