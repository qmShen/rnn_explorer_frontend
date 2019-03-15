/**
 * Created by yiding on 2017/1/10.
 */

import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource);

const dataServerUrl = "http://127.0.0.1:9930";
// const dataServerUrl = "/sv-analysis";
// const dataServerUrl = Config.serverLink == ""? "" : Config.serverLink.substring(0,  Config.serverLink.length - 1);
const $http = Vue.http;

function getTemporal(callback){
  const url = `${dataServerUrl}/temporal_trend`;
  $http.get(url).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

function getInitScatter(callback){
  const url = `${dataServerUrl}/scatter_data`;
  $http.get(url).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}


function getTestScatterPlot(callback){
  const url = `${dataServerUrl}/testscatterplot`
  $http.get(url).then(response => {

    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}
function getTestData (callback) {
  const url = `${dataServerUrl}/test`
  $http.get(url).then(response => {
    callback(JSON.parse(response.data))
  }, errResponse => {
    console.log(errResponse)
  })
}


function getUnitsStats(mid, callback) {
  const url = `${dataServerUrl}/all_units_stats`
  $http.post(url, {'mid': mid}).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

function getFeatureStats(mid, callback) {
  const url = `${dataServerUrl}/all_feature_stats`
  $http.post(url, {'mid': mid}).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}

function getGradientsAndIO(mid, tid, callback) {
  const url = `${dataServerUrl}/cell_input_output`
  $http.post(url, {'mid': mid, 'tid': tid}).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}


function getFeatureValues(mid, features, callback) {
  const url = `${dataServerUrl}/feature_values`
  $http.post(url, {'mid': mid, 'features': features}).then(response => {
    callback(response.data)
  }, errResponse => {
    console.log(errResponse)
  })
}
//

// function getAllRecordsForOneCity(cityId, callback) {
//   const url = `${dataServerUrl}/getallrecords`
//   $http.post(url, {'cityId': cityId}).then(response => {
//     callback(JSON.parse(response.data))
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
//
// function queryRegionFromBackground(cityId, positions, callback) {
//   const url = `${dataServerUrl}/regionquery`
//   $http.post(url, {'cityId': cityId, 'positions': positions}).then(response => {
//     callback(JSON.parse(response.data))
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
//
// function queryStreetCollections(cityId, startIndex, number, condition, callback){
//   const url = `${dataServerUrl}/streetsetquery`
//   $http.post(url, {'cityId': cityId, 'startIndex': startIndex, 'number': number, 'condition': condition}).then(response => {
//     callback(JSON.parse(response.data))
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
//
// function queryRegionCollections(cityId, startIndex, number, condition, callback){
//   const url = `${dataServerUrl}/adregionsetquery`
//   $http.post(url, {'cityId': cityId, 'startIndex': startIndex, 'number': number, 'condition': condition}).then(response => {
//     callback(JSON.parse(response.data))
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
//
// function queryStatistics(cityId, type, callback){
//   const url = `${dataServerUrl}/statisticsquery`
//   $http.post(url, {'cityId': cityId, 'type': type}).then(response => {
//     callback(JSON.parse(response.data))
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }
//
// function queryAllCityStatics(cityIds, callback){
//   const url = `${dataServerUrl}/allstatisticsquery`
//   $http.post(url, {}).then(response => {
//     callback(JSON.parse(response.data))
//   }, errResponse => {
//     console.log(errResponse)
//   })
// }

export default{
  getFeatureValues,
  getTestData,
  getGradientsAndIO,
  getTemporal,
  getInitScatter,
  getUnitsStats,
  getFeatureStats

}
