/**
 * Created by qshen on 13/7/2019.
 */
import * as d3 from "d3";


let color_list_feature = ["#dc3912", "#3366cc", "#ff9900","#0099c6",  "#109618", "#66aa00", "#dd4477", "#990099",  "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
let feature_color = d3.scaleOrdinal().range(color_list_feature);
feature_color.domain(["CO", "NO2", "O3", "SO2", "PM10", "PM25", "AQHI", "AQHIER", "Temp", "Wind", "WindDirection", "RH", "SeaLevelPressure", "DewPt", "CloudCover", "StationPresure"]);
let weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


// let gradient_color_list = ["#f9d057", "#f9d057", "#f29e2e", "#e76818","#d7191c", '#67000d'];
let gradient_color_list = ["#f9d057", "#f9d057", "#fc4e2a", "#e76818","#bd0026", '#67000d'];
// gradient_color_list = ["#F6CAD9","#E6A3B6", "#B05E6A", "#984B53", "#6E3132", 'black'];
let colorScaleRainbow = d3.scaleLinear()
  .domain([0.0,0.2,0.4,0.5, 0.7, 1])
  .range(gradient_color_list)
  .interpolate(d3.interpolateHcl);

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
  // const margin = {top: 40, right: 40, bottom: 40, left: 40};
  const margin = {top: 0, right: 0, bottom: 0, left: 0};
  this.margin = margin;

  this.width = outerWidth - margin.left - margin.right;
  this.height = outerHeight - margin.top - margin.bottom;
  this.$el = el;
  this.canvasWidth = this.$el.clientWidth - margin.left - margin.right;
  this.canvasHeight = this.$el.clientHeight - margin.top - margin.bottom;



  this.container = d3.select(this.$el);

  this.svgChart = this.container.append('svg:svg')
    .attr('width', this.canvasWidth)  //outerWidth
    .attr('height', this.canvasHeight) //outerHeight
    .attr('class', 'svg-plot')
    .style('position', 'absolute')
    .append('g');

  this.canvasChart = this.container.append('canvas')
    .attr('width', this.canvasWidth) //this.width
    .attr('height', this.canvasHeight) //this.height
    .attr('class', 'canvas-plot');

  this.selectedContainer = this.svgChart.append('g').attr('class','selected_container');
  this.selectingContainer = this.svgChart.append('g').attr('class','selecting_container');

  this.context = this.canvasChart.node().getContext('2d');

  // Prepare buttons
  this.toolsList = this.container.select('.tools')
    .style('visibility', 'visible');

  this.toolsList.select('#reset').on('click', () => {
    const t = d3.zoomIdentity.translate(0, 0).scale(1);
    this.canvasChart.transition()
      .duration(200)
      .ease(d3.easeLinear)
      .call(this.zoom_function.transform, t)
  });

  this.selecting_points = [];

  this.selected_points = [];

};


GradientScatter.prototype.setData = function(data, targetFeature){
  this.data = data;
  this.targetFeature = targetFeature;
  console.log('loglog', this.data, this.targetFeature = targetFeature);

  this.quadtree = d3.quadtree()
    .x(d=>d.x)
    .y(d=>d.y)
    .extent([[-5, -5], [this.canvasWidth + 5, this.canvasHeight + 5]])
    .addAll(this.data);

  this.plot(this.data);
  this.selectWinter();
};

GradientScatter.prototype.setTimeRange = function(timeRange){
  this.timeRange = timeRange;
  if(timeRange == undefined || timeRange.end == undefined || timeRange.start == undefined){
    this.timeRange = undefined
  }
}

;
GradientScatter.prototype.update_quadtree = function(){
  if(this.quadtree == undefined) return

  function nodes(quadtree) {
    var nodes = [];
    quadtree.visit(function(node, x0, y0, x1, y1) {
      node.x0 = x0, node.y0 = y0;
      node.x1 = x1, node.y1 = y1;
      nodes.push(node);
    });
    return nodes;
  }

};

GradientScatter.prototype.plot = function(data){
  // Init Scales
  console.log('Run plot!');
  if(data == undefined){
    data = this.data;
  }
  this.xScale = d3.scaleLinear().domain(d3.extent(data, (d) => d.x)).range([20, this.canvasWidth]).nice();
  this.yScale = d3.scaleLinear().domain(d3.extent(data, (d) => d.y)).range([40, this.canvasHeight]).nice();

  // Init Axis
  this.xAxis = d3.axisBottom(this.xScale);
  this.yAxis = d3.axisLeft(this.yScale);

  this.gxAxis = this.svgChart.append('g')
    .attr('transform', "translate(0," + this.canvasHeight + ")")
    .call(this.xAxis);

  this.gyAxis = this.svgChart.append('g')
    .call(this.yAxis);

  this.update_quadtree();
  this.drawPoints(d3.zoomIdentity)
};


GradientScatter.prototype.selectWinter = function(data){

  let r1 = {start: 1543552908, end: 1546182000};
  let r2 = {start: 1514736000, end: 1519908265};
  console.log('Run plot!');
  if(data == undefined){
    data = this.data;
  }
  this.xScale = d3.scaleLinear().domain(d3.extent(data, (d) => d.x)).range([20, this.canvasWidth]).nice();
  this.yScale = d3.scaleLinear().domain(d3.extent(data, (d) => d.y)).range([40, this.canvasHeight]).nice();

  // Init Axis
  this.xAxis = d3.axisBottom(this.xScale);
  this.yAxis = d3.axisLeft(this.yScale);

  this.gxAxis = this.svgChart.append('g')
    .attr('transform', "translate(0," + this.canvasHeight + ")")
    .call(this.xAxis);

  this.gyAxis = this.svgChart.append('g')
    .call(this.yAxis);

  this.update_quadtree();


  let _this = this;
  let transform = d3.zoomIdentity
  this.lastTransform = transform;

  const scaleX = transform.rescaleX(this.xScale);
  const scaleY = transform.rescaleY(this.yScale);

  this.gxAxis.call(this.xAxis.scale(scaleX));
  this.gyAxis.call(this.yAxis.scale(scaleY));

  this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

  let k = transform.k;
  let r = k * 1 > 3 ? 3: k * 1;
  this.data.forEach(point => {
    if((point.seconds > r1.start && point.seconds < r1.end) || (point.seconds > r2.start && point.seconds < r2.end)){
      this.drawPoint(scaleX, scaleY, point, r * 2);
    }else{
      this.drawPoint(scaleX, scaleY, point, r* 1, '#d9d9d9');
    }

  });

  this.zoom_function = d3.zoom().scaleExtent([1, 20])
    .on('zoom', () => {
      const transform = d3.event.transform;
      this.context.save();
      this.drawPoints(transform);
      _this.lastTransform = transform;
      this.context.restore();
      this.draw_selected_points(transform);

    })
    .on('end', ()=>{});

  this.svgChart.call(this.zoom_function);
  // this.canvasChart.call(this.zoom_function);


  this.initializeOperation();
};


GradientScatter.prototype.drawPoints = function(transform){
  let timeRange = this.timeRange;
  console.log("Time range", this.timeRange);
  let start = -1;
  let end = Number.MAX_SAFE_INTEGER;
  if(timeRange != undefined && timeRange.start != undefined && timeRange.end != undefined){
    start = timeRange.start;
    end = timeRange.end;
  }
  let _this = this;
  this.lastTransform = transform;

  const scaleX = transform.rescaleX(this.xScale);
  const scaleY = transform.rescaleY(this.yScale);

  this.gxAxis.call(this.xAxis.scale(scaleX));
  this.gyAxis.call(this.yAxis.scale(scaleY));

  this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

  let k = transform.k;
  let r = k * 1 > 3 ? 3: k * 1;
  this.data.forEach(point => {
    if(point.seconds > start && point.seconds < end){
      this.drawPoint(scaleX, scaleY, point, r * 1.3);
    }else{
      this.drawPoint(scaleX, scaleY, point, r * 0.7, '#b3b3b3');
    }

  });
// '#d9d9d9'


  this.zoom_function = d3.zoom().scaleExtent([1, 20])
    .on('zoom', () => {
      const transform = d3.event.transform;
      this.context.save();
      this.drawPoints(transform);
      _this.lastTransform = transform;
      this.context.restore();
      this.draw_selected_points(transform);

    })
    .on('end', ()=>{});

  this.svgChart.call(this.zoom_function);
  // this.canvasChart.call(this.zoom_function);


  this.initializeOperation();
};

GradientScatter.prototype.drawPoint = function(scaleX, scaleY, point, r, color) {

  this.context.beginPath();


  const px = scaleX(point.x);
  const py = scaleY(point.y);
  this.context.fillStyle = color == undefined ? colorScaleRainbow(point[this.targetFeature]): color;
  this.context.strokeWidth = 0.3;
  this.context.strokeStyle = 'white';
  this.context.arc(px, py, r , 0, 2 * Math.PI, false);
  this.context.fill();
  // this.context.stroke();
};

GradientScatter.prototype.initializeOperation = function(){
  let _this = this;
  //Box Zoom
  const brush = d3.brush().extent([[0, 0], [this.width, this.height]])
    .on("start", () => { brush_startEvent(); })
    .on("brush", () => { brush_brushEvent(); })
    .on("end", () => { brush_endEvent(); })
    .on("start.nokey", function() {
      // d3.select(window).on("keydown.brush keyup.brush", null);
    });

  this.svgChart
    .append("g")
    .attr("class", "brush")
    .call(brush);

  let brushStartPoint = null;

  function brush_startEvent() {
    const sourceEvent = d3.event.sourceEvent;
    const selection = d3.event.selection;


    if (sourceEvent.type === 'mousedown') {
      brushStartPoint = {
        mouse: {
          x: sourceEvent.screenX,
          y: sourceEvent.screenY
        },
        x: selection[0][0],
        y: selection[0][1]
      }
    } else {
      brushStartPoint = null;
    }
  }


  function search(quadtree, x0, y0, x3, y3) {
    let selecting_points = [];

    quadtree.visit(function(node, x1, y1, x2, y2) {
      if (!node.length) {
        do {
          var d = node.data;
          d.selected = (d.x >= x0) && (d.x < x3) && (d.y >= y0) && (d.y < y3);
          if(d.selected == true){
            selecting_points.push(d);
          }
        } while (node = node.next);
      }
      return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    return selecting_points;
  }



  function brush_brushEvent() {
    var extent = d3.event.selection;

    let xScale =  _this.lastTransform.rescaleX(_this.xScale);
    let yScale =  _this.lastTransform.rescaleY(_this.yScale);
    _this.selecting_points = search(_this.quadtree,xScale.invert(extent[0][0]),yScale.invert(extent[0][1]),
      xScale.invert(extent[1][0]), yScale.invert(extent[1][1]));

    _this.draw_selected_points()
  }


  function brush_endEvent() {
    const s = d3.event.selection;
  }

};

GradientScatter.prototype.draw_selected_points = function (){

  this.selectingContainer.selectAll('.select_point').remove();
  let xScale =  this.lastTransform.rescaleX(this.xScale);
  let yScale =  this.lastTransform.rescaleY(this.yScale);
  if(this.selecting_points == undefined || this.selecting_points == null || this.selecting_points.length == 0) {}
  else{
    this.selectingContainer.selectAll('.select_point')
      .data(this.selecting_points)
      .enter()
      .append('circle')
      .attr('class', 'select_point')
      .attr('r', 3)
      .attr('cx', d=>xScale(d.x))
      .attr('cy', d=>yScale(d.y))
      .attr('stroke', 'steelblue')
      .attr('fill', 'none')
  }


  this.selectedContainer.selectAll('.select_point').remove();

  if(this.selected_points == undefined || this.selected_points == null || this.selected_points.length == 0) return
  this.selectedContainer.selectAll('.select_point')
    .data(this.selected_points)
    .enter()
    .append('circle')
    .attr('class', 'select_point')
    .attr('r', 3)
    .attr('cx', d=>xScale(d.x))
    .attr('cy', d=>yScale(d.y))
    .attr('stroke', 'black')
    .attr('stroke-width', '0.5')
    .attr('fill', 'none')
};

GradientScatter.prototype.addToSelection = function(){
  this.selecting_points.forEach((d)=>{
    this.selected_points.push(d)
  });
  this.selecting_points = [];

  this.draw_selected_points();

};

GradientScatter.prototype.getAllSelection = function(){
  return this.selected_points;
};

GradientScatter.prototype.clearSelection = function(){
  this.selected_points = [];
  this.selecting_points = [];

  this.draw_selected_points();
};
GradientScatter.prototype.reset = function(){
  const t = d3.zoomIdentity.translate(0, 0).scale(1);
  this.canvasChart.transition()
    .duration(200)
    .ease(d3.easeLinear)
    .call(this.zoom_function.transform, t)
};
GradientScatter.prototype.setInteraction = function(model){
  if(model == 'brush'){
    console.log('switch brush');
    // this.canvasChart.style("pointer-events", "auto");
    // this.svgChart.style("pointer-events", "auto");
    this.canvasChart.style("z-index", -1);
    this.svgChart.style("z-index", 9999);
  }else if(model == 'drag'){
    console.log('switch drag');
    //     this.canvasChart.style("pointer-events", "auto");
    // this.svgChart.style("pointer-events", "auto");
    this.canvasChart.style("z-index", 9999);
    this.svgChart.style("z-index", -1);
  }
};

export default GradientScatter
