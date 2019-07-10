/**
 * Created by qshen on 8/7/2019.
 */

import * as d3 from "d3";


let FeaturePCP = function(el){
  let _this = this;
  this.$el = el;
  this.canvas_width = this.$el.clientWidth;
  this.canvas_height = this.$el.clientHeight - 10;
  this.svg = d3.select(el).append('svg').attr('width', this.canvas_width).attr('height', this.canvas_height);
};

FeaturePCP.prototype.set_data = function(data){
  this.features = [];
  this.render_data(data);
};

FeaturePCP.prototype.render_data = function(data){
  this.render_parallel_coordinate(this.svg, data);
};

FeaturePCP.prototype.parse_attribute_name = function(attributes_name){
  let segs = attributes_name.split('_');
  let attr = segs[segs.length - 1];
  return attr;
};

let color_list_feature = ["#dc3912", "#3366cc", "#ff9900","#0099c6",  "#109618", "#66aa00", "#dd4477", "#990099",  "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
let feature_color = d3.scaleOrdinal().range(color_list_feature);
feature_color.domain(["CO", "NO2", "O3", "SO2", "PM10", "PM25", "AQHI", "AQHIER", "Temp", "Wind", "WindDirection", "RH", "SeaLevelPressure", "DewPt", "CloudCover", "StationPresure"]);

FeaturePCP.prototype.render_parallel_coordinate = function(_container, selected_feature_value){
  let data = selected_feature_value;
  let features = [];
  if(data.length >= 0){
    for(let r in data[0]) {
      if(r != 'seconds')
        features.push({
          'name':r,
          'type':this.parse_attribute_name(r)
        });
    }
  }

  let svg = this.svg;
  let margin = {top: 10, right: 10, bottom: 40, left: 10},
    margin2 = {top: this.canvas_height - 40, right: 10, bottom: 10, left: 10},
    width = this.canvas_width - margin.left - margin.right,
    height = this.canvas_height - margin.top - margin.bottom,
    height2 = this.canvas_height - margin2.top - margin2.bottom;


  let x = d3.scaleLinear().range([0, width]),
    x2 = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

  let brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("end", brushed);

  let get_feature_line = function(name){
    return d3.line()
      .x(function (d) { return x(d.seconds); })
      .y(function (d) { return y(d[name]); });
  };
  let line = get_feature_line('PM25');

  let line2 = d3.line()
    .x(function (d) { return x2(d.seconds); })
    .y(function (d) { return y2(d.PM25); });

  let clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", this.canvas_width)
    .attr("height", this.canvas_height)
    .attr("x", 0)
    .attr("y", 0);

  let Line_chart = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("clip-path", "url(#clip)");

  let focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
  context.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, x.range());

  x.domain(d3.extent(data, function(d) { return d.seconds; }));
  y.domain([0, 1]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  // focus.append("g")
  //   .attr("class", "axis axis--x")
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(xAxis);
  //
  // focus.append("g")
  //   .attr("class", "axis axis--y")
  //   .call(yAxis);
  let line_elements = [];
  for(let i = 0, ilen = features.length; i < ilen; i++){

    let line = get_feature_line(features[i]['name']);
    let line_path = Line_chart.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .attr('stroke', feature_color(features[i]['name']))
      .attr('fill', 'none')
      .attr('opacity', 0.4)
      .attr('stroke-width', 0.2);
    line_elements.push(line_path);
  };



  context.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line2)
    .attr('stroke', 'red')
    .attr('opacity', 0.5)
    .attr('fill', 'none')
    .attr('stroke-width', 0.5)

  //
  // svg.append("rect")
  //   .attr("class", "zoom")
  //   .attr("width", width)
  //   .attr("height", height)
  //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  //   .call(zoom);
  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    if(line_elements){
      for(let i = 0, ilen = features.length; i < ilen; i++){

        let line = get_feature_line(features[i]['name']);
        line_elements[i].attr("d", line);
      };
    }

    // Line_chart.select(".line").attr("d", line);
    // focus.select(".axis--x").call(xAxis);
    // svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
    //   .scale(width / (s[1] - s[0]))
    //   .translate(-s[0], 0));
  }

};


export default FeaturePCP

