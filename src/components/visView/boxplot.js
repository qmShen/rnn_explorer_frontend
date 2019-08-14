/**
 * Created by qshen on 12/7/2019.
 */

import * as d3 from "d3";

let Boxplot = function(el){
  let _this = this;
  this.$el = el;
  this.canvas_width = this.$el.clientWidth;
  this.canvas_height = this.$el.clientHeight;
  this.svg = d3.select(el).append('svg').attr('width', this.canvas_width).attr('height', this.canvas_height);
};

Boxplot.prototype.render_data = function(item){

  let margin = {top: 10, right: 10, bottom: 20, left: 35};
  let renderHeight = this.canvas_height - (margin.top + margin.bottom);
  let renderWidth = this.canvas_width - (margin.left + margin.right);

  let temporal_statistics = item['temporal_statistics'];

  let time_stamp_num = temporal_statistics.length;

  let rootContainer = this.svg.append('g').attr('class', 'rootContainer');

  this.rootContainer = rootContainer;

  let allBoxContainer = rootContainer.append('g').attr('class', 'allboxcontainer')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


  // allBoxContainer.append('rect')
  //   .attr('width', renderWidth)
  //   .attr('height', renderHeight)
  //   .attr('fill', 'red')
  //   .attr('stroke-width', 0.3)
  //   .attr('stroke-opacity', 0.4)
  //   .attr('fill-opacity', 0.01)
  //   .attr('stroke', 'red');
  // console.log('item', item);

  let maxVal = d3.max(temporal_statistics, d=>d[1])
  let yScale = d3.scaleLinear()
    .domain([0, maxVal]).range([renderHeight, 0]);

  let xScale = d3.scaleLinear()
    .domain([0, temporal_statistics.length]).range([0, renderWidth]);


  this.yScale = yScale;
  this.xScale = xScale;


  let xAxis = d3.axisBottom().scale(xScale);
  let yAxis = d3.axisLeft().scale(yScale);


  allBoxContainer.append('g')
    .attr('class', 'xAxis')
    .call(xAxis)
    .attr('transform', 'translate('+[0, renderHeight] +')');

  allBoxContainer.append('g')
    .attr('class', 'yAxis')
    .call(yAxis);

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

  let boxMargin = 1;
  this.boxMargin = boxMargin;
  let boxWidth = renderWidth / temporal_statistics.length - boxMargin * 2;
  this.boxWidth = boxWidth;
  boxContainer.append('rect').attr('width', boxWidth)
    .attr('x', boxMargin)
    .attr('y', (d,i) => {
      return yScale(d[6])
    })
    .attr('height', d=> yScale(d[4]) - yScale(d[6]))
    .attr('stroke', 'black')
    .attr('stroke-width', 0.2)
    .attr('fill-opacity', 0.01)


  boxContainer.append('line')
    .style("stroke", "black")
    .attr("x1", d=> boxMargin + boxWidth / 2)
    .attr("y1", d=> yScale(d[1]))
    .attr("x2", d=> boxMargin + boxWidth / 2)
    .attr("y2", d=> yScale(d[0]))
    .style('stroke-width',1)
    .style('stroke', 'grey');


  boxContainer.append('line')
    .style("stroke", "black")
    .attr("x1", d=> boxMargin)
    .attr("y1", d=> yScale(d[5]))
    .attr("x2", d=> boxMargin + boxWidth)
    .attr("y2", d=> yScale(d[5]))
    .style('stroke-width',1)
    .style('stroke', 'grey');

  boxContainer.append('line')
    .style("stroke", "black")
    .attr("x1", d=> boxMargin)
    .attr("y1", d=> yScale(d[1]))
    .attr("x2", d=> boxMargin + boxWidth)
    .attr("y2", d=> yScale(d[1]))
    .style('stroke-width',1)
    .style('stroke', 'grey');


  boxContainer.append('line')
    .style("stroke", "black")
    .attr("x1", d=> boxMargin)
    .attr("y1", d=> yScale(d[0]))
    .attr("x2", d=> boxMargin + boxWidth)
    .attr("y2", d=> yScale(d[0]))
    .style('stroke-width',1)
    .style('stroke', 'grey');

};

Boxplot.prototype.set_data = function(item){
  let renderWidth = this.canvas_width ;
  this.features = [];
  this.featureName = item.feature_name;
  this.svg.append('text').text(item.feature_name).attr("font-size", "10").attr('y', '20').attr('x', renderWidth / 2);
  this.render_data(item);
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
  this.lineContainer.selectAll('path').attr('stroke-width', 1);
};

Boxplot.prototype.onSelect = function(seconds){
  seconds.forEach((second, i)=>{
    if(this.secondsMap[second] == undefined){
      console.log('No seconds select', second);
      return
    }
    d3.select(this.secondsMap[second]['render']['container']).selectAll('path').attr('stroke', 'red');
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


