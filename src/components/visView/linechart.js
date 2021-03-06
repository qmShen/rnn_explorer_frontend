import * as d3 from 'd3'

let BrushLineChart = function(el){

  let _this = this;
  this.$el = el;

  this.svg = d3.select(this.$el);
  this.canvas_clientWidth = this.$el.clientWidth;
  this.canvas_height = this.$el.clientHeight;
  this.margin = {top: 20, right: 100, bottom: 20, left: 40, gap: 25};

  this.focus_ratio = 0.7;

  this.focus_region = {
    top: this.margin.top,
    height: (this.canvas_height - this.margin.top - this.margin.bottom - this.margin.gap) * this.focus_ratio,
    left: this.margin.left,
    right: this.margin.right};

  this.overview_region = {
    top: this.focus_region.height + this.focus_region.top + this.margin.gap,
    height: (this.canvas_height - this.margin.top - this.margin.bottom - this.margin.gap) * (1 - this.focus_ratio),
    left: this.margin.left,
    right: this.margin.right};



  this.width = this.canvas_clientWidth - this.margin.left - this.margin.right;

  this.x = d3.scaleTime().range([0, this.width]);
  this.x2 = d3.scaleTime().range([0, this.width]);
  this.y = d3.scaleLinear().range([this.focus_region.height, 0]);
  this.y2 = d3.scaleLinear().range([this.overview_region.height, 0]);

  this.xAxis = d3.axisBottom(this.x);
  this.xAxis2 = d3.axisBottom(this.x2);
  this.yAxis = d3.axisLeft(this.y);



  this.brush = d3.brushX()
    .extent([[0, 0], [this.width, this.overview_region.height]])
    .on("brush end", brushed);
//
  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    _this.x.domain(s.map(_this.x2.invert, _this.x2));
    _this.Line_chart.select(".line").attr("d", _this.line);
    _this.pointsContainer.selectAll("circle")
      .attr('cx', (d, i) => _this.x(d.Date))
      .attr('cy', (d, i) => _this.y(d.PM25))

    _this.focus.select(".axis--x").call(_this.xAxis);
    _this.svg.select(".zoom").call(_this.zoom.transform, d3.zoomIdentity
      .scale(_this.width / (s[1] - s[0]))
      .translate(-s[0], 0));
  }
  this.zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [this.width, this.focus_region.height]])
    .extent([[0, 0], [this.width, this.focus_region.height]])
    .on("zoom", zoomed);

  function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    _this.x.domain(t.rescaleX(_this.x2).domain());
    _this.Line_chart.select(".line").attr("d", _this.line);
    _this.focus.select(".axis--x").call(_this.xAxis);
    _this.context.select(".brush").call(_this.brush.move, _this.x.range().map(t.invertX, t));
  }

  this.line = d3.line()
    .x(function (d) { return _this.x(d.Date); })
    .y(function (d) { return _this.y(d.Pre_PM25); });

  this.line2 = d3.line()
    .x(function (d) { return _this.x2(d.Date); })
    .y(function (d) { return _this.y2(d.Pre_PM25); });

};

BrushLineChart.prototype.update_render = function(data){

  for(let i = 0, ilen = data.length; i < ilen; i++){
    let d = data[i]
    d['Date'] = new Date(d['time']);
  }
  let render_data = data.slice(data.length - 2000);

  this.x.domain(d3.extent(render_data, function(d) { return d.Date; }));
  this.y.domain([0, d3.max(data, function (d) { return d.PM25; })]);
  this.x2.domain(this.x.domain());
  this.y2.domain(this.y.domain());

  this.svg.selectAll().remove();
  this.clip = this.svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", this.width)
    .attr("height", this.focus_region.height);



  this.Line_chart = this.svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + this.focus_region.left + "," + this.focus_region.top + ")")
    .attr("clip-path", "url(#clip)");


  this.pointsContainer = this.svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + this.focus_region.left + "," + this.focus_region.top + ")")
    .attr("clip-path", "url(#clip)");
//
  this.focus = this.svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + this.focus_region.left + "," + this.focus_region.top + ")");

  this.context = this.svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + this.overview_region.left + "," + this.overview_region.top + ")");


  this.focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + this.focus_region.height + ")")
    .call(this.xAxis);

  this.focus.append("g")
    .attr("class", "axis axis--y")
    .call(this.yAxis);

  this.Line_chart.append("path")
    .datum(render_data)
    .attr("class", "line")
    .attr("d", this.line)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', '1.5px');


  this.pointsContainer.selectAll('.point').data(render_data).enter()
    .append('circle')
    .attr('class', '.point')
    .attr('cx', (d, i) => this.x(d.Date))
    .attr('cy', (d, i) => this.y(d.PM25))
    .attr('fill', 'red')
    .attr('r',1)
  this.context.append("path")
    .datum(render_data)
    .attr("class", "line")
    .attr("d", this.line2)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', '1.5px');



  this.context.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + this.overview_region.height + ")")
    .call(this.xAxis2);

  this.context.append("g")
    .attr("class", "brush")
    .call(this.brush)
    .call(this.brush.move, this.x.range());

  this.svg.append("rect")
    .attr("class", "zoom")
    .attr("width", this.width)
    .attr("height", this.focus_region.height)
    .attr("transform", "translate(" + this.overview_region.left + "," + this.overview_region.top + ")")
    .attr('cursor', 'move')
    .attr('fill', 'none')
    // .attr('pointer-events','all') !!!!!! This is strange
    .call(this.zoom);


};

export default BrushLineChart
