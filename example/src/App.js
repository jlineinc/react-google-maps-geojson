import React, { Component } from 'react'

import {GoogleMap, GoogleAPIProvider, Marker } from '../../dist/index.js'

export default class App extends Component {
  
  pan = () => {
    this._map.panTo({lat:37.773165, lng:-122.42242})
  }

  render () {
    return (
      <GoogleAPIProvider apiKey="AIzaSyAbq1e0BYsKYXQEbpa52DrOVVHxvRM1Too">
        <GoogleMap containerStyle={{height: 600, width: 600}} onLoad={map => this._map = map}>
          <Marker position={{lat:37.773165, lng:-122.42242}} label='A' />
        </GoogleMap>
        <div>
        <button onClick={this.pan}>Pan</button>
        </div>
      </GoogleAPIProvider>
    )
  }
}
