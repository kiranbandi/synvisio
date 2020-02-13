import React, { Component } from 'react';
import Card from './Card';
import _ from 'lodash';
import update from 'immutability-helper';


export default class Container extends Component {

  constructor(props) {
    super(props);
    this.moveCard = this.moveCard.bind(this);
  }


  reverseCard(marker) {
    this.props.updatedReversedMarkers(marker, this.props.markerId);
  }

  moveCard(dragIndex, hoverIndex) {
    let markerList = [...this.props.markerList];
    const draggedCard = markerList[dragIndex];
    //remove card that is being dragged
    markerList.splice(dragIndex, 1);
    markerList.splice(hoverIndex, 0, draggedCard);
    this.props.updateMarkerList(markerList, this.props.markerId);
  }

  render() {

    const { markerList, width, reversedMarkerList = [] } = this.props;

    return (
      <div style={{ 'width': width }}>
        {_.map(markerList, (marker, index) =>
          <Card
            key={marker}
            index={index}
            id={marker}
            text={marker}
            isCardReversed={_.findIndex(reversedMarkerList, (d) => d == marker) > -1}
            moveCard={this.moveCard}
            reverseCard={this.reverseCard.bind(this, marker)}
          />
        )}
      </div>
    )
  }
}