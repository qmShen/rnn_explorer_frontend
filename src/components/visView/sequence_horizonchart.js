import * as d3 from "d3";

let Sequence = function(el){
  let _this = this;
  this.$el = el;
  this.target_features  = ['NO2', 'O3', 'SO2', 'PM10', 'PM25'];
  this.canvas_width = this.$el.clientWidth ;
  this.canvas_height = this.$el.clientHeight;
  this.sequence_margin = 2;
  this.cell_margin = 10;
  this.cell_margin_y = 25;

  this.default_feature = "PM25";
  this.sequence_height_min = 150;
  this.sequence_height_max = 150;


  this.left_margin = 10;

  // this.canvas_width = 400 ;
  this.sequence_width = this.canvas_width / 2 - 50;
  this.paral_width = 400 ;
  this.sequence_height_max = 150;
  this.init_render()
};

Sequence.prototype.render_circular_sequence = function(_container, sequence){

  sequence['cell_render'] = [];
  let cell_data_sequence = sequence['feature_cluster_gradient'];
  let n_cell = cell_data_sequence.length;
  let cell_width = (this.sequence_width - this.left_margin * 2) / n_cell;
  for(let i = 0, ilen = n_cell; i < ilen; i++){
    sequence['cell_render'].push({'off_x': i * cell_width, 'width':cell_width, 'height': this.sequence_height_min})
  }

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

  let gradient_T = [];
  for(let j  = 0, jlen = gradient[0].length; j < jlen; j++){
    let _cluster_gradient = [];
    for(let i = 0, ilen = gradient.length; i < ilen; i++){
      _cluster_gradient.push(gradient[i][j])
    }
    gradient_T.push({
      'cluster_id':j,
      'values':_cluster_gradient
    })
  }

  gradient_T.sort(function(a, b){
    return d3.max(b.values) - d3.max(a.values);
  });
  gradient_T.forEach((d, i)=>{
    d['render'] = {'offset_y': this.sequence_height_min / gradient[0].length * i}
  })

  //Define scales
  let numHorizons = 3;

  let xScale = d3.scaleLinear().range([0, (this.sequence_width - this.left_margin * 2) ]).domain([0, gradient_T[0].values.length - 1]);
  let xValue = function(d, i) { return xScale(i); };

  let yScale = d3.scaleLinear().clamp(true);

  let y0Value = function(d) { return yScale(0); };
  let y1Value = function(d) { return yScale(d); };

  let activityScale = d3.scaleBand().range([0, this.sequence_height_max]).padding(0.1);
  activityScale.domain(gradient_T.map(function(d) { return d.cluster_id; }));
  console.log('domain', gradient_T.map(function(d) { return d.cluster_id; }))

  yScale.range([activityScale.bandwidth(), 0]);

  var horizonScale = d3.scaleQuantize()
    .range(d3.range(numHorizons));
  let max_val = d3.max(gradient.map(function(d){return d3.max(d)}));

  horizonScale.domain([0, max_val]);
  let fill = function(d) { return d.yExtent[0] * 20; },
    fillScale = d3.scaleLinear().range(['lavender', 'purple']).interpolate(d3.interpolateHcl),
    fillValue = function(d) { return fillScale(fill(d)); };

  let area = d3.area()
    // .curve(d3.curveBasis)
    .x(xValue)
    .y0(y0Value)
    .y1(y1Value);

  function horizonData(d) {
    return horizonScale.range()
      .map(function(i) {
        return {
          yExtent: horizonScale.invertExtent(i),
          cluster_id: d.cluster_id,
          values: d.values
        };
      });
  }

  var hozirons_area_containers = _container.append('g').attr('class', 'horizons_area_container')
    .selectAll('.horizons_area').data(gradient_T)
    .enter().append('g')
    .attr('class', 'horizons_area_container')
    .attr('transform', function(d) {
      return 'translate(0,' + d.render.offset_y + ')';
    });

  var gHorizon = hozirons_area_containers.selectAll('.horizon').data(horizonData)
    .enter().append('path')
    .attr('class', 'horizon')
    .each(function(d, i) {
      yScale.domain(d.yExtent);
      d3.select(this)
        .attr('d', area(d.values))

    })
    .style('fill', fillValue)
  gHorizon.append('title').text(function(d){
    return d. cluster_id
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
};


Sequence.prototype.update_sequence_render = function(data){
  console.log('input sequence data', data);
  this.data = data;
  this.feature_cluster = data['cluster'];
  this.all_features = data['all_features'];
  this.feature_value = data['feature_value'];


  let _this = this;

  let left_margin = 10;
  let top_margin = 10;


  let sequence_list = data['feature_gradient_to_end'][this.default_feature];
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
    .attr('width', this.sequence_width - 2 * left_margin + 60).attr('height', this.sequence_height_max).attr('fill', 'white').attr('stroke', 'black').attr('stroke-width', 0.5);



  area_containers.each(function(d, i){
    d['index'] = i;
    let _container = d3.select(this).append('g').attr('class', 'c_container').attr('transform', ()=>'translate('+ (30 + 10) + ',' +  0 + ')');
    let rect = _container.append('rect').attr('stroke-width', 0.5).attr('stroke', 'orange')
      .attr('width', _this.sequence_width - 2 * left_margin).attr('height', 0)
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
          // d['render']['areaContainer'].selectAll('*').remove();
          d['render']['addContainer'].selectAll('*').remove();
          extend = false;
          return
        }else{
          d['render']['clicked'] = true;
          extend = true;
        }

        let _container = d3.select(this).append('g').attr('class', 'pcp_container').attr('transform', ()=>'translate('+ (30 + 10) + ',' +  _this.sequence_height_min + ')');
        let selected_feature_value = _this.feature_value;
        _this.render_parallel_coordinate(_container, selected_feature_value[i], null);
        d['render']['addContainer'] = _container;

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

};

Sequence.prototype.render_parallel_coordinate = function(_container, selected_feature_value, i){
  _container.selectAll('*').remove();
  let width =  (this.sequence_width - 2 * this.left_margin);
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
      _this.render_parallel_coordinate(_container, selected_feature_value[i], cluster_index);
    }

  });
};
export default Sequence
