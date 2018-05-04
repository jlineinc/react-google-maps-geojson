export const toLatLng = (geom) => {
  if(geom.coordinates){
    return {
      lat: geom.coordinates[1],
      lng: geom.coordinates[0]
    }
  }
  else if(geom.latitude && geom.longitude){
    return {
      lat: geom.latitude,
      lng: geom.longitude
    }
  }
  else if(geom.lat && geom.lng){
    return geom
  }
}

export const latLngBoundsLiteralCenter = (val) => {
  return {
    lat: (val.north + val.south)/2,
    lng: (val.east + val.west)/2
  }
}