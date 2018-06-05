import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import chroma from 'chroma-js'

import FeatureLayer from './FeatureLayer';

const VALUE_OPACITY = 0.7;
const NULL_OPACITY = 0;

const COLORS=chroma.scale(['#ffffff','#F57A82'])

const QUALITATIVE_BREWER = 'Accent';
const NUM_BREAKS = 9;

const outlineStyles = {
  strokeOpacity : 1,
  strokeWeight: 3,
  strokeColor: '#ff0000'
}

const highlightStyles = {
  fillColor : '#67b3a3',
  fillOpacity : 0.5
} 

// NOTE: PureComponent does shallow compare on props.
class DataPolygonLayer extends PureComponent {

  state = {
    dataStyles: null,

    savedDataTable: null,
    savedDataIdColumn: null,
    savedDataValueColumn: null
  }

  static propTypes = {
    google: PropTypes.object, // Context
    map: PropTypes.object,

    geom: PropTypes.object, // passthru
    geomIdColumn: PropTypes.string, // passthru

    onFeatureClick: PropTypes.func, // passthru
    onFeatureHover: PropTypes.func, // passthru
    onFeatureOut: PropTypes.func, // passthru

    dataTable: PropTypes.instanceOf(Map),
    dataIdColumn: PropTypes.string,
    dataValueColumn: PropTypes.string,

    highlightedFeatures: PropTypes.instanceOf(Set),
    outlinedFeatures: PropTypes.instanceOf(Set),

    palette: PropTypes.string
  };
  
  static defaultProps = {
    palette: "sequential",
    dataIdColumn: "id",
    dataValueColumn: "value",
    
    highlightedFeatures: new Set(),
    outlinedFeatures: new Set()

  }

  static getDerivedStateFromProps(nextProps, prevState){  
    // Only recompute dataStyles if necessary
    if(nextProps.dataTable !== prevState.savedDataTable || 
      nextProps.dataValueColumn !== prevState.savedDataValueColumn || 
      nextProps.dataIdColumn !== prevState.savedDataIdColumn){
        return { 
          dataStyles : DataPolygonLayer.getDataStyles(nextProps),
          savedDataTable: nextProps.dataTable,
          savedDataValueColumn: nextProps.dataValueColumn,
          savedDataIdColumn: nextProps.dataIdColumn
        }
    }
    else {
      return null
    }
  }

  getSelectionStyles = (highlightedFeatures, outlinedFeatures) => {
    const selectionStyles = new Map()
    for(let featureId of highlightedFeatures){
      selectionStyles.set(featureId, highlightStyles)
    }

    for(let featureId of outlinedFeatures){
      if(selectionStyles.has(featureId)){
        selectionStyles.set(featureId, {...highlightStyles, ...outlineStyles} )
      }
      else {
        selectionStyles.set(featureId, outlineStyles)
      }
    }
    return selectionStyles
  }

  static getDataStyles = nextProps => {
    const { dataTable, dataValueColumn, dataIdColumn, palette } = nextProps;
    //console.log('recalculating data styles', dataValueColumn, dataIdColumn,dataTable)

    const dataStyles = new Map()
    let breaks, chromaScale
    
    if(!dataTable){
      return dataStyles
    }

    if (palette === 'sequential') {
      //console.log('recalculating breaks')
      ((((({ breaks, chromaScale } = DataPolygonLayer.calculateBreaks(dataTable, dataValueColumn))))))
    }
    else {
      // TODO implement non-sequential pallet
    }

    for(let row of dataTable.values()) {
      const featureId =  row[dataIdColumn].toString()
      const value = row[dataValueColumn]
      const color = chromaScale(value)

      dataStyles.set(featureId, {
        fillOpacity: value ? VALUE_OPACITY : NULL_OPACITY,
        fillColor: color.hex(),
      })
    }
    return dataStyles 
  }


  static calculateBreaks(dataTable, valueColumn) {
    // Extract values based on valueColumn for calculating chroma breaks
    let vals = [];
    for (let row of dataTable.values()) { 
      if(row[valueColumn]){ // exclude 0, null and undefined for more even colors
        vals.push(row[valueColumn])
      }
    }
    const breaks = chroma.limits(vals, 'q', NUM_BREAKS);
    breaks[0] = 0; // Always start at 0
    const chromaScale = COLORS.classes(breaks)//chroma.scale(BREWER_NAME).classes(breaks);
    return {
      breaks: breaks,
      chromaScale: chromaScale
    };
  }


  getMergedStyles = () => {
    const mergedStyles = new Map(this.state.dataStyles) //clone

    const selectionStyles = this.getSelectionStyles(this.props.highlightedFeatures, this.props.outlinedFeatures)
    
    for (let [key, value] of selectionStyles) {
      mergedStyles.set(key, value) // Override or insert new 
    }    
    return mergedStyles    
  }

  render(){
    const mergedStyles = this.getMergedStyles()
    return(
      <FeatureLayer 
        google={this.props.google}
        map={this.props.map}

        geom={this.props.geom} 
        geomIdColumn={this.props.geomIdColumn}

        featureStyles={mergedStyles}

        onFeatureClick={this.props.onFeatureClick}
        onFeatureHover={this.props.onFeatureHover}
        onFeatureOut={this.props.onFeatureOut}
      >

      </FeatureLayer>
    )
  }
}

export default DataPolygonLayer