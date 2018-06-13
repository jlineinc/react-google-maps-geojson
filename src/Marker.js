import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash'

class Marker extends Component {
  
  static propTypes = {
    google: PropTypes.object,
    map: PropTypes.object,

    position: PropTypes.object,
    animation: PropTypes.number, // constant
    clickable: PropTypes.bool,
    cursor: PropTypes.string,
    draggable: PropTypes.bool,
    icon: PropTypes.object,
    label:PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    opacity: PropTypes.number,
    shape: PropTypes.object,
    title: PropTypes.string,
    visible: PropTypes.bool,
    zIndex: PropTypes.number
  }

  componentDidMount(){
    const google = this.props.google
    console.log('mounting marker')
    this._marker = new google.maps.Marker(_.omit(this.props, ['google']))
  }

  componentDidUpdate(prevProps){
    if(this.props !== prevProps){
      this._marker.setOptions(_.omit(this.props, ['google', 'map']))
    }
  }

  componentWillUnmount(){
    console.log('unmounting marker')
    this._marker.setMap(null);
  }

  render(){
    return null // noop
  }
}

export default Marker