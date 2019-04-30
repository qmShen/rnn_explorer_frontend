import * as d3 from "d3";

let Sequence = function(el){
  let _this = this;
  this.$el = el;
  this.target_features  = ['NO2', 'O3', 'SO2', 'PM10', 'PM25'];
  this.canvas_width = this.$el.clientWidth;
  this.canvas_height = this.$el.clientHeight;
  this.sequence_margin = 2;
  this.cell_margin = 10;
  this.cell_margin_y = 25;

  this.default_feature = "PM10"
  this.sequence_height_min = 80;
  this.sequence_height_max = 400;
  console.log('height', this.canvas_height);

  this.left_margin = 10;
  this.init_render()
};



Sequence.prototype.update_sequence_render = function(data){
  this.feature_cluster = data['cluster'];
  console.log('sequence data', data);
  let _this = this;

  let left_margin = 10;
  let top_margin = 10;


  let sequence_list = data['feature_gradient_to_end'][this.default_feature];

  // console.log('feature', this.feature_cluster)
  if(sequence_list.length == 0)return;

  this.root_container.selectAll('*').remove();

  console.log('seuqnce', sequence_list);
  for(let i = 0, ilen = sequence_list.length; i < ilen; i++){
    let sequence = sequence_list[i];
    sequence.render = {offset_y: i * this.sequence_height_min};
  }

  let sequence_container = this.root_container
    .selectAll('.sequence_container').data(sequence_list).enter().append('g').attr('class', 'sequence_container')
    .attr('transform', (d,i)=>'translate('+ left_margin + ',' + d.render.offset_y + ')');

  let area_containers = sequence_container.append('g').attr('class', 'circular_container');
  let rects = area_containers.append('rect')
    .attr('width', this.canvas_width - 2 * left_margin).attr('height', this.sequence_height_min).attr('fill', 'white').attr('stroke', 'blue').attr('stroke-width', 0.5);

  rects.on('click', function(_d, index){
    let extend = null;
    sequence_container.each(function(d, i){
      if(i == index){
        if(d['render']['clicked'] == true){
          d['render']['clicked'] = undefined;
          d['render']['areaContainer'].selectAll('*').remove();
          extend = false;
          return
        }else{
          d['render']['clicked'] = true;
          extend = true;
        }
        let _container = d3.select(this).append('g').attr('class', 'area_container').attr('transform', ()=>'translate('+ 0 + ',' +  _this.sequence_height_min + ')');
        let rect = _container.append('rect').attr('stroke-width', 0.5).attr('stroke', 'orange')
          .attr('width', _this.canvas_width - 2 * left_margin).attr('height', 0)
        rect.transition().attr('height', _this.sequence_height_max).attr('fill', 'white').duration(450);
        d['render']['areaContainer'] = _container;
        _this.render_area_sequence(_container, d);


      }else if(i > index){
        let _container = d3.select(this);
        d['render']['offset_y'] = extend == true ? d['render']['offset_y'] + _this.sequence_height_max: d['render']['offset_y'] - _this.sequence_height_max;
        _container.transition().attr('transform', ()=>'translate('+ left_margin + ',' + d.render.offset_y + ')')
          .duration(450);
      }
    })
  });

  sequence_container.each(function(d){
    let circular_sequence_container = d3.select(this).append('g').attr('class','circular_container');
    _this.render_circular_sequence(circular_sequence_container, d)

  })
};

Sequence.prototype.render_circular_sequence = function(_container, sequence){
  console.log('sequence----', sequence);
  sequence['cell_render'] = [];
  let cell_data_sequence = sequence['feature_cluster_gradient'];
  let n_cell = cell_data_sequence.length;
  let cell_width = (this.canvas_width - this.left_margin * 2) / n_cell;
  for(let i = 0, ilen = n_cell; i < ilen; i++){
    sequence['cell_render'].push({'off_x': i * cell_width, 'width':cell_width, 'height': this.sequence_height_min})
  }

  let cell_containers = _container.selectAll('.cell_container').data(sequence['cell_render']).enter().append('g').attr('class', 'cell_container')
    .attr('transform', (d, i)=>'translate('+ d['off_x'] + ',' + 0 + ')');
  cell_containers.append('rect').attr('width', d => d['width']).attr('height', d=>d['height'])
    .attr('fill', 'none').attr('stroke', 'purple').attr('stroke-width', 0.5);

  console.log('circular_container', _container, sequence);
};
Sequence.prototype.render_area_sequence = function(_container, sequence){
  let cluster_gradient = sequence['feature_gradient'];
  // this.feature_cluster
  // let cluster_gradient = []
  console.log('clsuter_gradient', cluster_gradient);
  console.log('area_container', sequence, cluster_gradient);


  let keys = [];
  for(let i = 0,ilen = cluster_gradient[0].length; i < ilen; i++){
    keys.push(i)
  }
  let stack_data = d3.stack()
    .keys(d3.range(cluster_gradient[0].length))//.offset(d3.stackOffsetWiggle)
  (cluster_gradient);
  console.log('canvas width', this.canvas_width - 2 * this.left_margin,cluster_gradient.length);


  var x = d3.scaleLinear()
    .domain([0, cluster_gradient.length])
    .range([ 0, this.canvas_width - 2 * this.left_margin]);
  console.log('data', stack_data);
  let min_val = d3.min(stack_data, function(layer) { return d3.min(layer, function(d) { return d[0]; }); });
  let max_val = d3.max(stack_data, function(layer) { return d3.max(layer, function(d) { return d[1]; }); });
  min_val = -0.2;
  max_val = 10;
  var y = d3.scaleLinear()
    .domain([0,max_val])
    .range([ this.sequence_height_max, 0 ]);
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']);


  _container
    .selectAll("mylayers")
    .data(stack_data)
    .enter()
    .append("path")
    .style("fill", function(d, i) {  return color(i); })
    .attr("d", d3.area()
      .x(function(d, i) {
        return x(i);
      })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); })
    ).append('title').text((d, i) => i);
  console.log('stack_data', stack_data);

};
Sequence.prototype.init_render = function(){
  // cluster_column_ids: target_ids, cluster_row_ids: source_ids
  this.root_container = d3.select(this.$el).append('g').attr('class', 'root_container').attr('transform', 'translate('+ 0 + ',' + 0 + ')');
  this.root_container.append('rect')
    .attr('width', this.canvas_width).attr('height', this.canvas_height).attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 1);

};

Sequence.prototype.render_dependency = function(){

};
export default Sequence
