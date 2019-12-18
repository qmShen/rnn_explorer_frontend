/**
 * Created by qshen on 12/7/2019.
 * ['min', 'max', 'mean', 'std', '25', '50', '75']
 */

import * as d3 from "d3";

let Boxplot = function(el){
  let _this = this;
  this.$el = el;
  this.canvas_width = this.$el.clientWidth;
  this.canvas_height = this.$el.clientHeight;
  this.svg = d3.select(el).append('svg').attr('width', this.canvas_width).attr('height', this.canvas_height);

};

let color_list_feature = ["#dc3912", "#3366cc", "#ff9900","#0099c6",  "#109618", "#66aa00", "#b82e2e", "#290095", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
let feature_color = d3.scaleOrdinal().range(color_list_feature);
feature_color.domain(["CO", "NO2", "O3", "SO2", "PM10", "PM25",  "Temp", "Wind", "WindDirection", "RH", "SeaLevelPressure", "DewPt", "CloudCover", "StationPresure"]);

let parse_attribute_name = function(attributes_name){
  let segs = attributes_name.split('_');
  let attr = segs[segs.length - 1];
  return attr;
};

Boxplot.prototype.render_data = function(item){
  console.log('items', item);
  let margin = {top: 10, right: 10, bottom: 20, left: 40};
  this.margin = margin;
  let renderHeight = this.canvas_height - (margin.top + margin.bottom);
  let renderWidth = this.canvas_width - (margin.left + margin.right);

  let temporal_statistics = item['temporal_statistics'];

  let time_stamp_num = temporal_statistics.length;

  let rootContainer = this.svg.append('g').attr('class', 'rootContainer');

  this.rootContainer = rootContainer;

  let allBoxContainer = rootContainer.append('g').attr('class', 'allboxcontainer')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  let _this = this;
  this.svg.attr('id', 'feature_' + item.feature_name)
  // allBoxContainer.append('rect')
  //   .attr('width', renderWidth)
  //   .attr('height', renderHeight)
  //   .attr('fill', 'red')
  //   .attr('stroke-width', 0.3)
  //   .attr('stroke-opacity', 0.4)
  //   .attr('fill-opacity', 0.01)
  //   .attr('stroke', 'red');
  // console.log('item', item);

  let ceil = 0.10;
  let maxVal = d3.max(temporal_statistics, d=>d[1])

  ceil = maxVal < ceil ? maxVal: ceil
  let _yScale = d3.scaleLinear()
    .domain([0, ceil]).range([renderHeight, 0]);
  let yScale = function(d){
    if(d > ceil) return _yScale(ceil);
    else return _yScale(d);
  };
  let xScale = d3.scaleLinear()
    .domain([0, temporal_statistics.length]).range([0, renderWidth]);


  this.yScale = yScale;
  this.xScale = xScale;


  let xAxis = d3.axisBottom().scale(xScale);
  let yAxis = d3.axisLeft().scale(_yScale).ticks(4);


  let xAxisContainer = allBoxContainer.append('g')
    .attr('class', 'xAxis')
    .call(xAxis)
    .attr('transform', 'translate('+[0, renderHeight] +')');
  xAxisContainer.selectAll('path').attr('stroke-width', 0.2);
  xAxisContainer.selectAll('line').attr('stroke-width', 0.2);
  xAxisContainer.selectAll('text').attr('opacity', 0.8);


  let yAxisContainer = allBoxContainer.append('g')
    .attr('class', 'yAxis')
    .call(yAxis);
  yAxisContainer.selectAll('path').attr('stroke-width', 0.2);
  yAxisContainer.selectAll('line').attr('stroke-width', 0.2);
  yAxisContainer.selectAll('text').attr('opacity', 0.8);


  let boxContainer = allBoxContainer.selectAll('.boxContainer').data(temporal_statistics).enter().append('g').attr('class', 'boxContainer')
    .attr('transform', (d, i)=>{ return 'translate('+[xScale(i), 0] +')'});

  this.allBoxContainer = allBoxContainer;

  this.lineContainer = this.allBoxContainer.append('g').attr('class', 'lineContainer');
  // boxContainer.append('rect')
  //   .attr('width', renderWidth / time_stamp_num)
  //   .attr('height', renderHeight)
  //   .attr('stroke', 'red')
  //   .attr('stroke-width', 0.2)
  //   .attr('fill-opacity', 0)

  let boxMargin = 2;
  this.boxMargin = boxMargin;
  let boxWidth = renderWidth / temporal_statistics.length - boxMargin * 2;
  this.boxWidth = boxWidth;
  boxContainer.append('rect').attr('width', boxWidth)
    .attr('x', boxMargin)
    .attr('y', (d,i) => {
      return yScale(d[6])
    })
    .attr('height', d=> yScale(d[4]) - yScale(d[6]))
    .attr('fill', this.feature_color)
    .attr('stroke', this.feature_color)
    .attr('stroke-width', 1)
    .attr('fill-opacity', 0.3)


  let line_width = 1;
  let line_opacity = 0.8;

  boxContainer.append('line')
    .attr("x1", d=> boxMargin + boxWidth / 2)
    .attr("y1", d=> yScale(d[1]))
    .attr("x2", d=> boxMargin + boxWidth / 2)
    .attr("y2", d=> yScale(d[0]))
    .style('stroke-width',line_width)
    .style('stroke-opacity',line_opacity)
    .style('stroke', this.feature_color);


  boxContainer.append('line')

    .attr("x1", d=> boxMargin)
    .attr("y1", d=> yScale(d[5]))
    .attr("x2", d=> boxMargin + boxWidth)
    .attr("y2", d=> yScale(d[5]))
    .style('stroke-width',line_width)
    .style('stroke-opacity',line_opacity)
    .style('stroke', this.feature_color);


  boxContainer.append('line')

    .attr("x1", d=> boxMargin)
    .attr("y1", d=> yScale(d[1]))
    .attr("x2", d=> boxMargin + boxWidth)
    .attr("y2", d=> yScale(d[1]))
    .style('stroke-width',line_width)
    .style('stroke-opacity',line_opacity)
    .style('stroke', this.feature_color);


  boxContainer.append('line')
    .attr("x1", d=> boxMargin)
    .attr("y1", d=> yScale(d[0]))
    .attr("x2", d=> boxMargin + boxWidth)
    .attr("y2", d=> yScale(d[0]))
    .style("stroke", this.feature_color)
    .style('stroke-opacity',line_opacity)
    .style('stroke-width',line_width)


  boxContainer.each(function(d){
    let _container = d3.select(this);
    if(d[1] > ceil){
      _container.append("path").attr('class', '444444')
        .attr("d", d3.symbol()
          .size(function(d) { return 50; } )
          .type(function(d) { return d3.symbolDiamond}))
        .attr("transform", (shape, i) => "translate(" + [boxMargin + boxWidth / 2,0] + ")")
        .attr('fill', _this.feature_color)
        .attr('fill-opacity', 0.3 + (d[1] - ceil) * 4)
        .append('title').text(parseInt(d[1] * 100) / 100)
    };
  });
  // if(maxVal > ceil){
  //   boxContainer.append('circle')
  //     .attr('cx', xScale())
  // }
};

Boxplot.prototype.set_data = function(item){
  let renderWidth = this.canvas_width ;
  this.features = [];
  this.featureName = item.feature_name;

  // get the information of feature name
  this.feature_type = parse_attribute_name(item.feature_name);
  this.feature_color = feature_color(this.feature_type);

  this.render_data(item);
  this.svg.append('text').text(item.feature_name).attr("font-size", "13").attr('y', this.margin.top + 10).attr('x', this.margin.left + 5).style('opacity', 0.7);

};

Boxplot.prototype.set_selected_data = function(selectedData){
  // console.log('data------------data', selectedData[this.featureName]);
  let gradientValues = selectedData[this.featureName]['gradientList'];
  // console.log('gradientValues', gradientValues);
  this.secondsMap = {};
  gradientValues.forEach((d,i)=>{
    this.secondsMap[d['timestamp']] = d;
  });
  // console.log('secondsmap', this.secondsMap);
  let line = d3.line()
    .x( (d, i)=>{ return this.xScale(i) + this.boxWidth / 2 + this.boxMargin; })
    .y( (d, i)=>{ return this.yScale(d);});

  this.lineContainer.selectAll('.line').remove();

  let lines = this.lineContainer.selectAll('.line')
    .data(gradientValues)
    .enter()
    .append('g').attr('class', 'line');

  lines.each(function(d){
    let lineContainer = d3.select(this);
    lineContainer.append('path')
      .datum(d['gradient'])
      .attr('d', line)
      .attr('stroke', (d, i) => { return 'grey'; })
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .attr('stroke-width', 1);
    if(d['render'] == undefined){
      d['render'] = {};
    }
    d['render']['container'] = this;
  })
};

Boxplot.prototype.onHoverOn = function(second){
  if(this.secondsMap == undefined || this.secondsMap[second] == undefined){
    console.log('No seconds hover', second);
    return
  }
  d3.select(this.secondsMap[second]['render']['container']).selectAll('path').attr('stroke-width', 3)

};

Boxplot.prototype.onHoverOut = function(){
  this.lineContainer.selectAll('path').attr('stroke-width', 0.3);
};

Boxplot.prototype.onSelect = function(seconds){
  seconds.forEach((second, i)=>{
    if(this.secondsMap[second] == undefined){
      console.log('No seconds select', second);
      return
    }
    d3.select(this.secondsMap[second]['render']['container']).selectAll('path').attr('stroke', 'red').attr('stroke-width', 3);
  })
};
Boxplot.prototype.removeSelect = function(){
  this.lineContainer.selectAll('path').attr('stroke', 'grey');
};

Boxplot.prototype.on = function(eventName, method){
  if(eventName == 'mouseover') {
    this.mouseover = method;
    this.svg.on('mouseover', this.mouseover);
  }else if(eventName == 'mouseout'){
    this.mouseout = method;
    this.svg.on('mouseout', this.mouseout);
  }
};

export default Boxplot;


