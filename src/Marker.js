import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Marker extends Component {
  
  static propTypes = {
    google: PropTypes.object.isRequired,
    map: PropTypes.object.isRequired,

    position: PropTypes.object
  }

  componentDidMount(){
    const google = this.props.google
    
    this._marker = google.maps.Marker({
      position: this.props.position,
      map: this.props.map
    })
  }

  componentDidUpdate(prevProps){
    if(this.props.position !== prevProps.position){
      this._marker.setPosition(this.props.position)
    }
  }
}

export default Marker