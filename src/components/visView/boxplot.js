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

  let margin = {top: 10, right: 10, bottom: 25, left: 30};
  let renderHeight = this.canvas_height - (margin.top + margin.bottom);
  let renderWidth = this.canvas_width - (margin.left + margin.right);


  let temporal_statistics = item['temporal_statistics'];

  let time_stamp_num = temporal_statistics.length;

  let rootContainer = this.svg.append('g').attr('class', 'rootContainer');

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

  let yScale = d3.scaleLinear()
    .domain([0, 0.2]).range([renderHeight, 0]);

  let xScale = d3.scaleLinear()
    .domain([0, temporal_statistics.length]).range([0, renderWidth]);

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

  // boxContainer.append('rect')
  //   .attr('width', renderWidth / time_stamp_num)
  //   .attr('height', renderHeight)
  //   .attr('stroke', 'red')
  //   .attr('stroke-width', 0.2)
  //   .attr('fill-opacity', 0)

  let boxMargin = 1;

  let boxWidth = renderWidth / temporal_statistics.length - boxMargin * 2;
  boxContainer.append('rect').attr('width', boxWidth)
    .attr('x', boxMargin)
    .attr('y', (d,i) => {
      // console.log('yscale', yScale(d[6]))
      return yScale(d[6])
    })
    .attr('height', d=> yScale(d[4]) - yScale(d[6]))
    .attr('stroke', 'red')
    .attr('stroke-width', 0.2)
    .attr('fill-opacity', 0.2)


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
    .style('stroke', 'red');


  boxContainer.append('line')
    .style("stroke", "black")
    .attr("x1", d=> boxMargin)
    .attr("y1", d=> yScale(d[0]))
    .attr("x2", d=> boxMargin + boxWidth)
    .attr("y2", d=> yScale(d[0]))
    .style('stroke-width',1)
    .style('stroke', 'blue');

};

Boxplot.prototype.set_data = function(item){
  let renderWidth = this.canvas_width ;
  this.features = [];
  this.svg.append('text').text(item.feature_name).attr("font-size", "10").attr('y', '20').attr('x', renderWidth / 2);
  this.render_data(item);
};

export default Boxplot
