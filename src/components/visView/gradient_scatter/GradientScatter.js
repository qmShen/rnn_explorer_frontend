/**
 * Created by qshen on 13/7/2019.
 */
import * as d3 from "d3";


let color_list_feature = ["#dc3912", "#3366cc", "#ff9900","#0099c6",  "#109618", "#66aa00", "#dd4477", "#990099",  "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
let feature_color = d3.scaleOrdinal().range(color_list_feature);
feature_color.domain(["CO", "NO2", "O3", "SO2", "PM10", "PM25", "AQHI", "AQHIER", "Temp", "Wind", "WindDirection", "RH", "SeaLevelPressure", "DewPt", "CloudCover", "StationPresure"]);
let weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let toDateTime = function(secs) {
  var t = new Date(1970, 0, 1);
  t.setSeconds(secs);
  return t;
};

let parse_attribute_name = function(attributes_name){
  let segs = attributes_name.split('_');
  let attr = segs[segs.length - 1];
  return attr;
};

let format_date = function(date){
  let month = date.getMonth() >= 9?date.getMonth() + 1:'0' + (date.getMonth() + 1);
  let day = date.getDate() >= 10?date.getDate():'0' + date.getDate();
  let hour = date.getHours() >= 10?date.getHours():'0' + date.getHours();
  let string = date.getFullYear() + '-' + month + '-' + day + ' ' + hour +':00:00  ' + weekDay[date.getDay()];
  return string;
};



let GradientScatter = function(el){
  const margin = {top: 20, right: 20, bottom: 20, left: 20};

  this.width = outerWidth - margin.left - margin.right;
  this.height = outerHeight - margin.top - margin.bottom;
  this.$el = el;
  this.canvas_width = this.$el.clientWidth;
  this.canvas_height = this.$el.clientHeight;

  console.log('Gradient Width', this.canvas_width, this.canvas_height);


};


GradientScatter.prototype.set_Data = function(data){

};



export default GradientScatter
