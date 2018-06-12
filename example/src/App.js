import React, { Component } from 'react'

import {GoogleMap, GoogleAPIProvider, Marker } from '../../dist/index.js'

export default class App extends Component {
  render () {
    return (
      <GoogleAPIProvider apiKey="AIzaSyAbq1e0BYsKYXQEbpa52DrOVVHxvRM1Too">
        <GoogleMap containerStyle={{height: 600, width: 600}}>
          <Marker position={{lat:37.773165, lng:-122.42242}} label='A' />
        </GoogleMap>
      </GoogleAPIProvider>
    )
  }
}
