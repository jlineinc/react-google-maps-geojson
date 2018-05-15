import { toLatLng, latLngBoundsLiteralCenter } from './utils'
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const defaultStyle = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  map: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  }
}

const DEFAULT_ZOOM = 14;

export default class GoogleMapInternal extends Component {
  constructor(props){
    super(props)
    this._mapRef = React.createRef();
  }

  state = {
    map: null
  }

  static propTypes = {
    children: PropTypes.node,
    google: PropTypes.object,
    className: PropTypes.string,
    onLoad: PropTypes.func,
    onClick: PropTypes.func,
    onIdle: PropTypes.func,
    onMapReady: PropTypes.func,
    viewPort: PropTypes.object,
    visible: PropTypes.bool,
    style: PropTypes.object,
    containerStyle: PropTypes.object,
    mapOptions: PropTypes.object // Additional options passed directly to google map
  }

  static defaultProps = {
    viewPort : {
      zoom: 14,
      center: {
        lat: 37.774929,
        lng: -122.419416
      }
    },
    visible: true
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { viewPort, google } = this.props
    const { map } = this.state


    if(!prevProps.google && google){ // Google API Loaded
      this.loadMap()
    }

    if(!prevState.map && map && this.props.onMapReady){
      this.props.onMapReady(map)
    }

    if (map && viewPort && viewPort !== prevProps.viewPort) {
      if ("bounds" in viewPort) {
        this.state.map.fitBounds(viewPort.bounds)
      }
      else if ("center" in viewPort && "zoom" in viewPort) {
        map.setCenter(toLatLng(viewPort.center))
        map.setZoom(viewPort.zoom)
      }
      else {
        throw "ViewPort must specify either bounds or center and zoom. Do not pass viewPort if uncontrolled.";
      }
    }

  }

  componentWillUnmount() {
    // No official way to destroy map
  }

  loadMap() {
    const { google } = this.props
    const node = this._mapRef.current

    // Must initialize map with center/zoom. If bounds supplied, use default zoom and call fitBounds()
    // immediate after map is initialized.

    // Bounds literal : {east, north, south, west}
    const bounds = this.props.viewPort.bounds ? this.props.viewPort.bounds : null
    const mapOptions = Object.assign({}, this.props.mapOptions, {
      center: this.props.viewPort.center ? toLatLng(this.props.viewPort.center) : latLngBoundsLiteralCenter(bounds),
      zoom: this.props.viewPort.zoom ? this.props.viewPort.zoom : DEFAULT_ZOOM // Default zoom
    });


    // Create Map and run fitBounds if needed
    const map = new google.maps.Map(node, mapOptions)

    /*
    if (bounds) {
      map.fitBounds(bounds);
    }
    */

    // Bind click event
    map.addListener('click', e => {
      if (this.props.onClick) {
        this.props.onClick(e)
      }
    });

    map.addListener('idle', () => {
      if(this.props.onIdle){
        this.props.onIdle(map)
      }
    })

    this.setState({ map: map })
    
    // Bind onload event
    if (this.props.onLoad) {
      this.props.onLoad(map)
    }

  }

  render() {
    const style = {...defaultStyle.map, ...this.props.style, 
      display: this.props.visible ? 'inherit' : 'none'
    }

    const containerStyles = {...defaultStyle.container, ...this.props.containerStyle}

    var childrenWithProps = React.Children.map(this.props.children, child => child &&
      React.cloneElement(child, { map: this.state.map, google: this.props.google })
    );

    return (
      <div style={containerStyles} className={this.props.className}>
        <div style={style} ref={this._mapRef}>
          Loading map...
          </div>
        {this.state.map && childrenWithProps}
      </div>
    )
  }
}