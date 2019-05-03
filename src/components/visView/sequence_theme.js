import * as d3 from "d3";
import DistributionMatrix from "./distribution";

let Sequence = function(el){
  let _this = this;
  this.$el = el;
  this.target_features  = ['NO2', 'O3', 'SO2', 'PM10', 'PM25'];
  this.canvas_width = this.$el.clientWidth * 0.7;
  this.canvas_height = this.$el.clientHeight;
  this.sequence_margin = 2;
  this.cell_margin = 10;
  this.cell_margin_y = 25;

  this.default_feature = "PM25";
  this.sequence_height_min = 150;
  this.sequence_height_max = 100;


  this.left_margin = 10;

  this.canvas_width = 400 ;
  this.paral_width = 400 ;
  this.sequence_height_max = 150;
  this.init_render()
};

Sequence.prototype.render_circular_sequence = function(_container, sequence){

  sequence['cell_render'] = [];
  let cell_data_sequence = sequence['feature_cluster_gradient'];
  let n_cell = cell_data_sequence.length;
  let cell_width = (this.canvas_width - this.left_margin * 2) / n_cell;
  for(let i = 0, ilen = n_cell; i < ilen; i++){
    sequence['cell_render'].push({'off_x': i * cell_width, 'width':cell_width, 'height': this.sequence_height_min})
  }
  // let cell_containers = _container.selectAll('.cell_container').data(sequence['cell_render']).enter().append('g').attr('class', 'cell_container')
  //   .attr('transform', (d, i)=>'translate('+ d['off_x'] + ',' + 0 + ')');
  // cell_containers.append('rect').attr('width', d => d['width']).attr('height', d=>d['height'])
  //   .attr('fill', 'none').attr('stroke', 'purple').attr('stroke-width', 0.5);
};


Sequence.prototype.render_area_chart = function(_container, sequence, cluster_index = null){
  _container.selectAll('*').remove();
  let gradient = null;

  if(cluster_index == null){
    gradient = sequence['feature_cluster_gradient'];
  }else{
    let _gradient = sequence['feature_gradient'];
    let cluster_ids = this.feature_cluster[cluster_index];
    let cluster_inner_list = [];
    for(let i = 0, ilen =_gradient.length; i < ilen; i++){
      let _list = [];
      for(let j = 0, jlen = cluster_ids.length; j < jlen; j++){
        _list.push(_gradient[i][cluster_ids[j]])
      }
      cluster_inner_list.push(_list);
    }
    gradient = cluster_inner_list;
  }

  let vertical_margin = 20;
  let stack_data = d3.stack()
    .keys(d3.range(gradient[0].length))
    .order(d3.stackOrderAscending)
    .offset(d3.stackOffsetSilhouette)
    (gradient);

  var x = d3.scaleLinear()
    .domain([0, gradient.length])
    .range([ 0, this.canvas_width - 2 * this.left_margin]);

  let min_val = d3.min(stack_data, function(layer) { return d3.min(layer, function(d) { return d[0]; }); });
  let max_val = d3.max(stack_data, function(layer) { return d3.max(layer, function(d) { return d[1]; }); });
  // min_val = -0.2;
  var y = d3.scaleLinear()
    .domain([min_val,max_val])
    .range([ this.sequence_height_max - vertical_margin, vertical_margin ]);
  let color = d3.scaleOrdinal()
    .domain(d3.range(gradient[0].length))
    .range(color_list_feature);

  _container.append("g")
    .call(d3.axisLeft(y));
  _container.append("g")
    .attr("transform", "translate(0," + (this.sequence_height_max - vertical_margin) + ")")
    .call(d3.axisBottom(x).ticks(5));

  let area = _container
    .selectAll(".mylayers")
    .data(stack_data)
    .enter()
    .append("path").attr('class', 'mylayers');
  area
  // .style('stroke', function(d, i) {  return color(i); })
    .style("fill", function(d, i) {  return color(i); })
    .style('fill-opacity', 0.4)
    // .style('stroke-opacity', 0.4)
    .attr("d", d3.area()
      .x(function(d, i) {
        return x(i);
      })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); })
    );
  area.append('title').text((d, i) => {
    if(sequence.render.level == 'cluster' || sequence.render.level == undefined){
      return  "cluster " + i
    }else{
      let cluster_ids = this.feature_cluster[cluster_index];
      return this.all_features[cluster_ids[i]]
    }
  });
  area.on('click', (d, i)=>{
    if(sequence.render.level == undefined){
      // console.log('--------1---------', sequence.render.level);
      sequence.render.level = 'cluster';
      console.log('here', _container_id)
      this.render_area_chart(_container, sequence, null);
      this.update_single_parallel_coordinate(_container_id, null)
    }else if(sequence.render.level == 'feature'){
      // console.log('--------2---------', sequence.render.level);
      sequence.render.level = 'cluster';
      this.render_area_chart(_container, sequence, null);
      this.update_single_parallel_coordinate(_container_id, null)
    }
    else if(sequence.render.level == 'cluster'){
      // console.log('--------3---------', sequence.render.level);
      sequence.render.level = 'feature';
      this.render_area_chart(_container, sequence, i);

      this.update_single_parallel_coordinate(_container_id, i)
    }else{
      console.log('--------4---------', sequence.render.level);
      console.log('nonnon');
    }

  })
};
let color_list_feature = ["#dc3912", "#3366cc", "#ff9900","#0099c6",  "#109618", "#66aa00", "#dd4477", "#990099",  "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];

let feature_color = d3.scaleOrdinal().range(color_list_feature);
feature_color.domain(["CO", "NO2", "O3", "SO2", "PM10", "PM25", "AQHI", "AQHIER", "Temp", "Wind", "WindDirection", "RH", "SeaLevelPressure", "DewPt", "CloudCover", "StationPresure"]);
Sequence.prototype.render_area_sequence = function(_container, sequence){

  this.render_area_chart(_container, sequence);


};
Sequence.prototype.init_render = function(){
  // cluster_column_ids: target_ids, cluster_row_ids: source_ids
  this.root_container = d3.select(this.$el).append('g').attr('class', 'root_container').attr('transform', 'translate('+ 0 + ',' + 0 + ')');
  this.root_container.append('rect')
    .attr('width', this.canvas_width).attr('height', this.canvas_height).attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 1);

};


Sequence.prototype.update_sequence_render = function(data){

  this.data = data;
  this.feature_cluster = data['cluster'];
  this.all_features = data['all_features'];
  this.feature_value = data['feature_value'];

  console.log('data_list', data);
  console.log('feature_value', this.feature_value);
  let _this = this;

  let left_margin = 10;
  let top_margin = 10;


  let sequence_list = data['feature_gradient_to_end'][this.default_feature];
  // sequence_list.forEach((d,i)=>{
  //
  // }
  console.log('sequence_list', sequence_list);

  // console.log('feature', this.feature_cluster)
  if(sequence_list.length == 0)return;

  this.root_container.selectAll('*').remove();


  for(let i = 0, ilen = sequence_list.length; i < ilen; i++){
    let sequence = sequence_list[i];
    sequence.render = {offset_y: i * this.sequence_height_min};
  }

  let sequence_container = this.root_container
    .selectAll('.sequence_container').data(sequence_list).enter().append('g').attr('class', 'sequence_container')
    .attr('transform', (d,i)=>'translate('+ left_margin + ',' + d.render.offset_y + ')');

  let area_containers = sequence_container.append('g').attr('class', 'area_container');
  let rects = area_containers.append('rect')//.attr('x', 30)
    .attr('width', this.canvas_width - 2 * left_margin + 30).attr('height', this.sequence_height_max).attr('fill', 'white').attr('stroke', 'black').attr('stroke-width', 0.5);


  // .attr('width', this.canvas_width - 2 * left_margin + 30).attr('height', this.sequence_height_max).attr('fill', 'white').attr('stroke', 'black').attr('stroke-width', 0.5);
  area_containers.each(function(d, i){
    d['index'] = i;
    let _container = d3.select(this).append('g').attr('class', 'c_container').attr('transform', ()=>'translate('+ (30 + 10) + ',' +  0 + ')');
    let rect = _container.append('rect').attr('stroke-width', 0.5).attr('stroke', 'orange')
      .attr('width', _this.canvas_width - 2 * left_margin).attr('height', 0)
    rect.transition().attr('height', _this.sequence_height_max).attr('fill', 'white').duration(450).on('end', function () {
      _this.render_area_sequence(_container, d);
    });
  });


  rects.on('click', function(seq, index){
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
        let _container = d3.select(this).append('g').attr('class', 'area_container').attr('transform', ()=>'translate('+ (30 + 10) + ',' +  _this.sequence_height_min + ')');
        let rect = _container.append('rect').attr('stroke-width', 0.5).attr('stroke', 'orange')
          .attr('width', _this.canvas_width - 2 * left_margin).attr('height', 0)
        rect.transition().attr('height', _this.sequence_height_max).attr('fill', 'white').duration(450).on('end', function () {
          _this.render_area_sequence(_container, d, seq);
        });
        d['render']['areaContainer'] = _container;



      }else if(i > index){
        let _container = d3.select(this);
        d['render']['offset_y'] = extend == true ? d['render']['offset_y'] + _this.sequence_height_max: d['render']['offset_y'] - _this.sequence_height_max;
        _container.transition().attr('transform', ()=>'translate('+ left_margin + ',' + d.render.offset_y + ')')
          .duration(450)
      }
    })
  });

  sequence_container.each(function(d){
    let circular_sequence_container = d3.select(this).append('g').attr('class','circular_container').attr('transform', ()=>'translate('+ 30 + ',' +  0 + ')')
    _this.render_circular_sequence(circular_sequence_container, d)
  });


  let parall_container = sequence_container.append('g').attr('class', 'parall_container')
    .attr('transform', 'translate(' + (this.canvas_width - 2 * left_margin + 30) + ',0)')

  parall_container.append('rect')
    .attr('width', (this.canvas_width - 2 * left_margin + 30) * 2)
    .attr('height', this.sequence_height_max).attr('fill', 'white').attr('stroke', 'green').attr('stroke-width', 0.5);

  parall_container.each(function(d, i){
    let _container = d3.select(this);
    let selected_feature_value = _this.feature_value;
    console.log('ddd', selected_feature_value);
    _this.render_parallel_coordiate(_container, selected_feature_value[i], null);
  });

  this.parall_container = parall_container;

};

Sequence.prototype.render_parallel_coordiate = function(_container, selected_feature_value, i){
  _container.selectAll('*').remove();
  let width =  (this.canvas_width - 2 * 30) * 1.5;
  let height = this.sequence_height_max;
  let values = selected_feature_value.value;

  if(i!= null){
    console.log('i----------i', i)
    values = selected_feature_value.value;
  }else{
    values = selected_feature_value.value;
  }
  let feature_statistics = [];
  let dimensions = d3.range(values.length);
  for(let i = 0, ilen = values[0].length; i < ilen; i++){
    let feature_obj = {'name': this.all_features[i]}
    for(let j = 0, jlen = values.length; j < jlen; j++){
      feature_obj[j] = values[j][i];
    }
    feature_statistics.push(feature_obj);
  }
  let line = d3.line();
  let x = d3.scaleLinear().range([0, width]);
  x.domain([0, 23]);

  let y = d3.scaleLinear()
    .domain([0, 1])
    .range([height - 10, 10]);
  var yAxis = d3.axisLeft();

  var container = _container;
  container.selectAll('.dimension').data(dimensions).enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })

  let background = container.append("g")
    .attr("class", "background")
    .selectAll("path")
    .data(feature_statistics)
    .enter().append("path")
    .attr("d", path)
    .style('fill', 'none')
    .attr('stroke', (d,i)=>{
      let name = d['name'];
      let segs = name.split('_')
      return feature_color(segs[segs.length - 1])
      return 'grey'
    })
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 0.2);

  function path(d) {
    return line(dimensions.map(function(p) { return [x(p), y(d[p])]; }));
  }

};

Sequence.prototype.update_single_parallel_coordinate = function(container_index, cluster_index){
  let _this = this;
  this.parall_container.each(function(d, i){
    if(i == container_index){
      let _container = d3.select(this);
      let selected_feature_value = _this.feature_value;
      console.log('ddd', selected_feature_value);
      _this.render_parallel_coordiate(_container, selected_feature_value[i], cluster_index);
    }

  });
};
export default Sequence
