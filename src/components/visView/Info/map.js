/**
 * Created by qshen on 15/8/2019.
 */

/**
 * Created by qshen on 13/7/2019.
 */

import L from "leafLet";


let Map = function(el, station) {
  // console.log('leaflet', leaflet)
  this.map = L.map(el, { zoomControl:false }).setView(station.location, 6);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 12,
    id: 'mapbox.light'
  }).addTo(this.map);



  L.circle(station.location, 100, {
    color: 'steelblue',
    fillColor: '#f03',
    fillOpacity: 0.5
  }).addTo(this.map).bindPopup(station.station_name);

  var popup = L.popup();
  let _this = this;
  function onMapClick(e) {
    popup
      .setLatLng(e.latlng)
      .setContent(e.latlng.toString())
      .openOn(_this.map);
  }

  this.map.on('click', onMapClick);
};



Map.prototype.set_region_data = function(testPoints){
  let boundaries = testPoints;
  for(let i = 0, ilen = boundaries.length; i< ilen; i++){
    let _polygon = boundaries[i]['region']
    L.polygon(boundaries[i]['region'], {'weight':1}).addTo(this.map).bindPopup(boundaries[i].parameter.region_name)
  }
};

export default Map
