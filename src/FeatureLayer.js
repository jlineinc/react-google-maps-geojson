import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { featureCollection } from '@turf/helpers'
import _ from 'lodash';
import assert from 'assert';


const GEOM_DEFAULTS = {
  HOVER_FILL_OPACITY: 0.3,
  HOVER_FILL_COLOR : '#67b3a3',
}

class FeatureLayer extends Component {
  constructor(props){
    super(props);
    this._dataLayer = null
    this._featuresMap = new Map()
  }

  static defaultProps = {
    geomIdColumn : null
  }
  
  static propTypes = {
    google: PropTypes.object.isRequired,
    map: PropTypes.object.isRequired,

    geom: PropTypes.object,
    featureStyles: PropTypes.instanceOf(Map),
    geomIdColumn: PropTypes.string,
  
    pointStyle: PropTypes.object,

    onFeatureClick: PropTypes.func,
    onFeatureHover: PropTypes.func,
    onFeatureOut: PropTypes.func,
    onFeatureMouseover: PropTypes.func,
    onFeatureMouseout: PropTypes.func,
  
    children: PropTypes.node
  };


  getFeatureId = (feature) => {
    assert(this.props.geomIdColumn || feature.id, 'If geomIdColumn not specified geoJSON must contain id key.')
    return this.props.geomIdColumn ? feature.properties[this.props.geomIdColumn] : feature.id
  }

      
  calcStyle = feature  => {
    let defaultStyle;
    const google = this.props.google
    switch(feature.getGeometry().getType()){
      case "Polygon":
      case "MultiPolygon":
        defaultStyle = {
          strokeWeight: 1,
          strokeColor: '#a1d0c6',
          fillOpacity: 0
        }
        break
      case "Point":
        defaultStyle = this.props.pointStyle || {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#fff',
            fillOpacity: 1,
            strokeColor: '#000',
            strokeWeight: 3,
            scale: 5
          }
        }
        break
      case "LineString":
      case "MultiLineString":
      case "LinearRing":
        defaultStyle = {
          strokeColor: '#000',
          strokeWeight: 2
        }
        break
    }

    return {
      ...defaultStyle,
      ...feature.getProperty('style')
    }
  }
  
  // OK if geom is null
  renderGeom = () => {
    const geom = this.props.geom;

    if(geom){
      const oldMap = this._featuresMap
      const newMap = new Map(geom.features.map(feature => [this.getFeatureId(feature), feature]))

      // Get set difference
      const idsToRemove = Array.from(oldMap.keys()).filter(key => !newMap.has(key));
      const idsToAdd = Array.from(newMap.keys()).filter(key => !oldMap.has(key));

      //console.log('adding ids', idsToAdd.length)
      //console.log('removing ids', idsToRemove.length)

      for(let id of idsToRemove){
        this._dataLayer.remove(this._dataLayer.getFeatureById(id))
      }

      const geoJsonToAdd = featureCollection(idsToAdd.map(id => newMap.get(id)))
      const addedFeatures = this._dataLayer.addGeoJson(geoJsonToAdd, {
        idPropertyName: this.props.geomIdColumn
      })

      if(this.props.featureStyles){
        for(let feature of addedFeatures){
          feature.setProperty('style', this.props.featureStyles.get(feature.getId()))
        }
      }

      this._featuresMap = newMap;
    }
    else {
      // Flush features
      console.log('flushing features')
      this._dataLayer.forEach(feature => this._dataLayer.remove(feature))
      this._featuresMap = new Map();
    }
  }


  
  // OK if geom not loaded (if(feature) returns null)
  // OK if either newStyles or oldStyles is undefined
  // Passing in oldStyles = undefined forces all features to be updated.
  renderStyles = (prevStyles) => {
    const newStyles = this.props.featureStyles || new Map();
    const oldStyles = prevStyles || new Map();

    for(let [id] of oldStyles){
      if(!newStyles.has(id)){
        const feature = this._dataLayer.getFeatureById(id)
        if(feature) {
          feature.removeProperty('style')
          //console.log('removing style')
        }
      }
    }

    for(let [id, newStyle] of newStyles){
      if(!oldStyles.has(id) || !_.isEqual(newStyle, oldStyles.get(id))){
        const feature = this._dataLayer.getFeatureById(id)
        if(feature){
          feature.setProperty('style', newStyle)
          //console.log('adding/updating style')
        }
      }
    }
  }

  componentDidMount(){
    assert(this.props.google)
    assert(this.props.map)

    const { google, map, onFeatureClick, onFeatureOut, onFeatureHover } = this.props

    if(!this._dataLayer){
      console.log('Create and bind new Data layer')
      this._dataLayer = new google.maps.Data({ map: map })
      this._dataLayer.setStyle(this.calcStyle)

      // Handle hover effect internally but also notify upstream
      this._dataLayer.addListener('mouseover', evt => {
        this._dataLayer.overrideStyle(evt.feature, {
          fillColor: GEOM_DEFAULTS.HOVER_FILL_COLOR,
          fillOpacity: GEOM_DEFAULTS.HOVER_FILL_OPACITY
        });
        if(onFeatureHover){
          onFeatureHover(evt);
        }
      });

      this._dataLayer.addListener('mouseout', evt=> {
        this._dataLayer.revertStyle(evt.feature);
        if(onFeatureOut){
          onFeatureOut(evt);
        }
      });
      this._dataLayer.addListener('click', evt => {
        if(onFeatureClick){
          onFeatureClick(evt)
        }  
      });     
    }

    // If geom already available
    if(this.props.geom){
      console.log('geom available at start')
      this.renderGeom()
    }

    if(this.props.featureStyles){
      console.log('featureStyles available at start')
      this.renderStyles(null);
    }
  }

  componentDidUpdate(prevProps){
    if(this.props.geom !== prevProps.geom){
      this.renderGeom();
    } 
    
    if(this.props.featureStyles !== prevProps.featureStyles){
      this.renderStyles(prevProps.featureStyles);
    }
  }

  render() {
    if(this.props.geom){
      return (
      <div>{this.props.children}</div>
      )
    }
    else{
      return null;
    }
  }
}


export default FeatureLayer;