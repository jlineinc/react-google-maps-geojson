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
    zIndex: PropTypes.number,
    listeners: PropTypes.object
  }

  static defaultProps = {
    listeners: {}
  }

  componentDidMount(){
    const google = this.props.google
    console.log('mounting marker')
    this._marker = new google.maps.Marker(_.omit(this.props, ['google']))

    // Add listeners (init)
    for(const [key, val] of Object.entries(this.props.listeners)){
      this._marker.addListener(key, val)
    }
  }

  componentDidUpdate(prevProps){
    const {google} = this.props
    if(this.props !== prevProps){
      this._marker.setOptions(_.omit(this.props, ['google', 'map', 'listeners']))
    }

    if(this.props.listeners !== prevProps.listeners){
      // Clear all existing listeners
      for(const key of Object.keys(this.props.listeners)){
        google.maps.event.clearListeners(this._marker, key);
      }
    
      // Add (re-add) listeners
      for(const [key, val] of Object.entries(this.props.listeners)){
        this._marker.addListener(key, val)
      }
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