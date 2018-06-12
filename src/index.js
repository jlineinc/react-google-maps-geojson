import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoogleMapsLoader from 'google-maps'
import GoogleMapInternal from './GoogleMapInternal'

export {default as Marker} from './Marker'
export {default as FeatureLayer} from './FeatureLayer'
export {default as DataPolygonLayer} from './DataPolygonLayer'

export const GoogleAPIContext = React.createContext({
  google: null,
});


export class GoogleAPIProvider extends Component {
  static propTypes = {
    apiKey: PropTypes.string,
    children: PropTypes.node
  }

  state = {
    google: null
  }

  componentDidMount(){
    GoogleMapsLoader.KEY = this.props.apiKey;
    GoogleMapsLoader.load(google => {
      this.setState({google: google})
    });
  }

  render(){
    return (
      <GoogleAPIContext.Provider value={{google: this.state.google}}>
        {this.props.children}
      </GoogleAPIContext.Provider>
    )
  }
}

export const GoogleMap = props => (
  <GoogleAPIContext.Consumer>
    {ctx => <GoogleMapInternal {...props} {...ctx} />}
  </GoogleAPIContext.Consumer>
);
