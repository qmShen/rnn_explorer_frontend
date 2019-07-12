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
  let time_stamp_num = 24;
  let margin = {top: 10, right: 10, bottom: 25, left: 30};
  let renderHeight = this.canvas_height - (margin.top + margin.bottom);
  let renderWidth = this.canvas_width - (margin.left + margin.right);

  let rootContainer = this.svg.append('g').attr('class', 'rootContainer');

  let boxContainer = rootContainer.append('g').attr('class', 'boxcontainer')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


  boxContainer.append('rect')
    .attr('width', renderWidth)
    .attr('height', renderHeight)
    .attr('fill', 'red')
    .attr('stroke-width', 0.3)
    .attr('stroke-opacity', 0.4)
    .attr('fill-opacity', 0.01)
    .attr('stroke', 'red');

  let yScale = d3.scaleLinear()
    .domain([0, 1]).range([renderHeight, 0]);

  let xScale = d3.scaleLinear()
    .domain([0, 23]).range([0, renderWidth]);

  let xAxis = d3.axisBottom().scale(xScale);
  let yAxis = d3.axisLeft().scale(yScale);


  boxContainer.append('g')
    .attr('class', 'xAxis')
    .call(xAxis)
    .attr('transform', 'translate('+[0, renderHeight] +')');

  boxContainer.append('g')
    .attr('class', 'yAxis')
    .call(yAxis);
};

Boxplot.prototype.set_data = function(item){
  this.features = [];
  this.svg.append('text').text(item.feature_name).attr("font-size", "20").attr('y', '20');
  this.render_data(item);
};

export default Boxplot
