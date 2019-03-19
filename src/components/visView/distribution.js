import * as d3 from "d3";

let DistributionMatrix = function(el){

  let _this = this;
  this.$el = el;
  this.svg = d3.select(this.$el).select('svg');

  this.canvas_width = this.svg.node().getBoundingClientRect().width;
  this.canvas_height = this.svg.node().getBoundingClientRect().height;

  // var element = this.node().getBoundingClientRect().width;
  // element.getBoundingClientRect().width;

  // this.f_u_gap = this.canvas_height / 20;

  this.f_u_gap = 5;
  this.cell_margin_y = 2;
  this.cell_margin_x = 2;

  this.feature_box = {'x':0,
    'y': 0,
    'width': this.canvas_width,
    'height':this.canvas_height / 2 - this.f_u_gap};

  this.unit_box = {'x':0,
    'y': this.feature_box.height + (2 * this.f_u_gap),
    'width': this.canvas_width,
    'height':this.canvas_height / 2 - this.f_u_gap
  };




  this.selected_features = {};
  this.selected_units = {};

  this.selected_extend_units = {};

  this.units_data_sign = false;
  this.feature_data_sign = false;
};


DistributionMatrix.prototype.register_function = function(select_call_back){
  this.select_call_back = select_call_back
};
DistributionMatrix.prototype.register_selected_data = function(domain, d){

  this.selected_features[d['id']] = null;

  if(d['fid'] != undefined){
    if(domain == 0)
      delete this.selected_features[d['id']];
    else
      this.selected_features[d['id']] = [parseInt(domain[0]), Math.ceil(domain[1])];
  }else{
    if(domain == 0)
      delete this.selected_units[d['id']];
    else
      this.selected_units[d['id']] = [int(domain[0]), Math.ceil(domain[1])];
  }
  console.log('rrrrr', this.selected_units, this.selected_features);
  // this.select_call_back(this.selected_features, this.selected_units)
};


DistributionMatrix.prototype.bicluster_colorScale  = d3.scaleOrdinal(d3["schemeCategory20"]);

DistributionMatrix.prototype.initialize_bicluster_render = function(feature_units_stats){
  console.log('Get all distribution');
  console.log('data',feature_units_stats);


  this.id_map = {};

  let features = feature_units_stats['features'];
  let units = feature_units_stats['units'];

  features.forEach(d=>{
    if(this.id_map[d['id']] != undefined){
      console.log('id', d['id'], 'existed!')
    }
    this.id_map[d['id']] = d;
  });

  units.forEach(d=>{
    if(this.id_map[d['id']] != undefined){
      console.log('id', d['id'], 'existed!')
    }
    this.id_map[d['id']] = d;
  });


  let bicluster = feature_units_stats['bicluster']['bi_clusters'];


  let cluster_groups = [];
  for(let cid in bicluster){
    let _obj = {
      'cid': cid,
      'size': bicluster[cid]['f_ids'].length + bicluster[cid]['u_ids'].length,
      'f_ids': bicluster[cid]['f_ids'],
      'u_ids': bicluster[cid]['u_ids']
    };

    cluster_groups.push(_obj);
  }

  this.cluster_groups = cluster_groups;

  this.link_region_width = this.canvas_width * 0.15;
  this.remain_width=  this.canvas_width - this.link_region_width;
  this.top_unit_width = this.remain_width * 0.15;
  this.top_feature_width = this.remain_width * 0.15;
  this.unit_region_width = this.remain_width * 0.3;
  this.feature_region_width = this.remain_width * 0.4;

  this.root_container = this.svg.append('g').attr('class', 'root_container');

  this.top_unit_container = this.root_container.append('g').attr('class', 'top_unit_container');

  // this.top_unit_container.append('rect')
  //   .attr('width', this.top_unit_width).attr('height', this.canvas_height).attr('fill', 'none')
  //   .attr('stroke', 'blue').attr('stroke-width', 0.2);


  this.unit_container = this.root_container.append('g').attr('class', 'unit_container').attr('transform', 'translate(' + (this.top_unit_width) + ','+ 0 + ')');
  // this.unit_container.append('rect')
  //   .attr('width', this.unit_region_width).attr('height', this.canvas_height).attr('fill', 'none')
  //   .attr('stroke', 'red').attr('stroke-width', 0.2);

  this.link_region_container = this.root_container.append('g').attr('class', 'link_region_container').attr('transform', 'translate(' + (this.top_unit_width + this.unit_region_width) + ','+ 0 + ')');
  // this.link_region_container.append('rect')
  //   .attr('width', this.link_region_width).attr('height', this.canvas_height).attr('fill', 'none')
  //   .attr('stroke', 'blue').attr('stroke-width', 0.2);

  this.feature_container = this.root_container.append('g').attr('class', 'feature_container').attr('transform', 'translate(' + (this.top_unit_width + this.unit_region_width + this.link_region_width) + ','+ 0 + ')');
  // this.feature_container.append('rect')
  //   .attr('width', this.feature_region_width).attr('height', this.canvas_height).attr('fill', 'none')
  //   .attr('stroke', 'red').attr('stroke-width', 0.2);

  this.selected_feature_container = this.root_container.append('g').attr('class', 'top_feature_width').attr('transform', 'translate(' + (this.top_unit_width + this.unit_region_width + this.link_region_width + this.feature_region_width) + ','+ 0 + ')');
  // this.selected_feature_container.append('rect')
  //   .attr('x', 3)
  //   .attr('y', 3)
  //   .attr('width', this.top_feature_width - 2 * 3).attr('height', this.canvas_height - 2 * 3).attr('fill', 'none').attr('stroke-dasharray', '10,5')
  //   .attr('stroke', 'blue').attr('stroke-width', 0.2);

  this.selected_feature_plot_conatiner = this.selected_feature_container.append('g').attr('class', 'selected_feature_container').selectAll('.selected_feature');

  this.top_unit_plot_conatiner = this.top_unit_container.append('g').attr('class', 'top_unit_plot_conatiner').selectAll('.top_units');
  // this.selected_feature_plot_conatiner.selectAll('.selected_feature')
  this.calc_position(cluster_groups)
};

DistributionMatrix.prototype.calc_position = function(cluster_groups){
  let _this = this;
  this.f_col_max_n = 10;
  this.u_col_max_n = 5;

  console.log('f_col_max_n', this.f_col_max_n);
  console.log('u_col_max_n', this.u_col_max_n);

  this.u_cell_gap = 10;
  this.f_cell_gap = 10;

  this.u_total_gap = this.u_cell_gap * (cluster_groups.length + 1);
  this.f_total_gap = this.f_cell_gap * (cluster_groups.length + 1);


  let u_total_row = 0;
  let f_total_row = 0;
  cluster_groups.forEach(cluster=>{
    u_total_row += Math.ceil(cluster['u_ids'].length / this.u_col_max_n);
    f_total_row += Math.ceil(cluster['f_ids'].length / this.f_col_max_n);
  });

  let u_cell_height = (this.canvas_height - this.u_total_gap) / u_total_row;
  let f_cell_height = (this.canvas_height - this.f_total_gap) / f_total_row;
  this.u_cell_height = u_cell_height;
  this.f_cell_height = f_cell_height;


  let u_c_y = this.u_cell_gap;
  let f_c_y = this.f_cell_gap;

  cluster_groups.forEach((cluster, i)=>{
    let _u_height = Math.ceil(cluster['u_ids'].length / this.u_col_max_n) * u_cell_height;
    let _f_height = Math.ceil(cluster['f_ids'].length / this.f_col_max_n) * f_cell_height;
    cluster.u_render = {
      x: 0,
      y: u_c_y,
      height: _u_height,
      width: this.unit_region_width
    };
    cluster.f_render = {
      x: 0,
      y: f_c_y,
      height: _f_height,
      width: this.feature_region_width
    };
    u_c_y += (_u_height + this.u_cell_gap);
    f_c_y += (_f_height + this.f_cell_gap);
  });


  this.single_unit_container = this.unit_container.selectAll('unit_group').data(cluster_groups).enter().append('g').attr('class', 'unit_group')
    .attr('transform', (d, i) => 'translate(' + d.u_render.x + ',' + d.u_render.y +')');

  let _margin = 0;
  this.single_unit_container.append('rect').attr('x', _margin).attr('y', _margin).attr('rx', 1).attr('ry', 1)
    .attr('width', d=>d.u_render.width - 2* _margin)
    .attr('height', d=>d.u_render.height -  2* _margin)
    .attr('fill', 'none')
    .attr('stroke', d=>this.bicluster_colorScale(d.cid)).attr('stroke-width', 1.5);

  this.single_feature_container = this.feature_container.selectAll('.feature_group').data(cluster_groups).enter().append('g').attr('class','feature_group')
    .attr('transform', (d, i) => 'translate(' + d.f_render.x + ',' + d.f_render.y +')');

  this.single_feature_container.append('rect').attr('x', _margin).attr('y', _margin).attr('rx', 1).attr('ry', 1)
    .attr('width', d=>d.f_render.width - 2 * _margin).attr('height', d=>d.f_render.height -  2* _margin).attr('fill', 'none')
    .attr('stroke', d=>this.bicluster_colorScale(d.cid)).attr('stroke-width', 1.5);

};

DistributionMatrix.prototype.layout_cells = function(){
  let _this = this;

  // Layout unit containers

  this.single_unit_container.each(function(d, i){

    let _unit_group_container = d3.select(this);
    let _uids = d['u_ids'];
    let _margin = 2 ;


    let _cell_width = (d.u_render.width / _this.u_col_max_n) - 2 * _margin;
    let _cell_height = _this.u_cell_height - 2 * _margin

    let cell_x = d3.scaleLinear().range([_margin, _cell_width - _margin]);

    let cell_y = d3.scaleLinear().range([_cell_height, _margin]);


    let line = d3.line()
      .x((d, i) => { return cell_x(i); })
      .y((d, i) => { return cell_y(d); });

    let unit_cells = _unit_group_container.selectAll('.unit_cell').data(_uids).enter()
      .append('g')
      .attr('class','unit_cell')
      .attr('transform', (_, i) =>{
        let _x = i % _this.u_col_max_n * (d.u_render.width / _this.u_col_max_n);
        let _y = parseInt(i / _this.u_col_max_n ) * _this.u_cell_height;
        return 'translate(' + _x + ',' + _y +')';
      });

    unit_cells.each(function(uid){
      let d = _this.id_map[uid];
      if(d == undefined || d == null || d['kde_point'] == undefined) return;

      cell_x.domain([0, d['kde_point'].length]);

      cell_y.domain([0,  d3.max(d['kde_point'])]);
      d3.select(this).append('path')
        .datum(d['kde_point'])
        .attr("fill", "none")
        .attr("opacity", ".8")
        .attr("stroke", _this.bicluster_colorScale(d.cid))
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d",line)
    });

    unit_cells.append('rect').attr('x', _margin).attr('y', _margin)
      .attr('width', _cell_width)
      .attr('height', _cell_height)
      .attr('fill', 'none').attr('fill-opacity', 0.2)
      .attr('rx',3)
      .attr('ry',3)
      .attr('stroke',d=>_this.bicluster_colorScale(d.cid)).attr('stroke-opacity', 0.8)
      .attr('d', _=> _);

  });

  // Layout feature containers
  this.single_feature_container.each(function(d, i){
    let _feature_group_container = d3.select(this);
    let _fids = d['f_ids'];

    let feature_cells = _feature_group_container.selectAll('.feature_cell').data(_fids).enter()
      .append('g')
      .attr('class','feature_cell')
      .attr('transform', (_, i) =>{
        let _x = i % _this.f_col_max_n * (d.f_render.width / _this.f_col_max_n);
        let _y = parseInt(i / _this.f_col_max_n ) * _this.f_cell_height
        return 'translate(' + _x + ',' + _y +')'
      });

    let _margin = 2 ;
    let _rects = feature_cells.append('rect').attr('x', _margin).attr('y', _margin)
      .attr('width', (d.f_render.width / _this.f_col_max_n) - 2 * _margin)
      .attr('height', _this.f_cell_height - 2 * _margin)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', 'green').attr('fill-opacity', 0.2)
      .attr('stroke','white')
      .on('click', function(_id){
        let cell_data = _this.id_map[_id];
        if(cell_data['render'] == undefined){
          cell_data['render'] = {'clicked': false};

        }
        if(cell_data['render']['clicked'] == false){
          cell_data['render']['clicked'] = true;
          d3.select(this).attr('stroke', 'black');
          _this.selected_extend_units[_id] = cell_data;
        }else{
          cell_data['render']['clicked'] = false;
          d3.select(this).attr('stroke', 'white');
          delete _this.selected_extend_units[_id];
          delete _this.selected_features[_id];
        }

        _this.update_selected_units();
      })

    _rects.append('title').text(_id=>_this.id_map[_id].id)

  })

};

DistributionMatrix.prototype.update_selected_units = function(){
  // Container

  let margin_x = 2;
  let margin_y = 3;

  let _this = this;
  let selected_extend_units_list = [];
  for(let _id in this.selected_extend_units){
    selected_extend_units_list.push(this.selected_extend_units[_id]);
  }

  console.log('selected_extend_units', selected_extend_units_list);

  let select_cell_width = (this.top_feature_width - margin_x * 5);
  let select_cell_height = select_cell_width / 5 * 3;

  selected_extend_units_list.forEach(function(d, i){
    if(d['render'] == undefined){
      d['render'] = {};
    }
    d['render']['selected_x'] = 0;
    d['render']['selected_y'] = i * select_cell_height;
    d['render']['height'] = select_cell_height;
    d['render']['width'] = select_cell_width;
  });

  this.selected_feature_plot_conatiner = this.selected_feature_plot_conatiner.data(selected_extend_units_list, function(d){
    return d.id;
  });

  this.selected_feature_plot_conatiner.exit().remove();

  let new_container = this.selected_feature_plot_conatiner.enter()
    .append("g")
    .attr('class', 'selected_feature');

  this.selected_feature_plot_conatiner = new_container.merge(this.selected_feature_plot_conatiner)
    .attr('transform', d=>{return 'translate(' + margin_x * 2 + ',' + d.render.selected_y + ')'})

  new_container.append("rect")
    .attr('x', margin_x)
    .attr('y', margin_y)
    .attr('width', d=> d.render.width - 2 * margin_x)
    .attr('height', d=>d.render.height - 2 * margin_y).attr('fill', 'none').attr('fill-opacity', 0.2)
    .attr('stroke', 'grey').style("stroke-dasharray", "10,4").attr('stroke-opacity', 0.5)
    .attr('stroke-width', 1.5);

  //------------------------------------------


  //---------------------------------------------------------------

  let cell_x = d3.scaleLinear().range([margin_x, select_cell_width - margin_x])


  let cell_y = d3.scaleLinear().range([select_cell_height - margin_y, margin_y])



  new_container.each(function(d){
    cell_x.domain([0, d['kde_point'].length]);
    cell_y.domain([0,  d3.max(d['kde_point'])]);

    let line = d3.line()
      .x((d, i) => { return cell_x(i); })
      .y((d, i) => { return cell_y(d); });
    if(d == undefined || d == null || d['kde_point'] == undefined) return;

    d3.select(this).append('path')
      .datum(d['kde_point'])
      .attr("fill", "none")
      .attr("opacity", ".8")
      .attr("stroke", _this.bicluster_colorScale(d.cid))
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d",line)

  });

  //  --------------------------------

  var brush = d3.brushX()
    .extent([[margin_x, margin_y], [select_cell_width - margin_x, select_cell_height - margin_y]])
    .on("start brush", brushmoved)
    .on("end", function(d){
      let range = d3.event.selection;
      if(range){
        let domain = range.map(cell_x.invert);
        // console.log('ddd',d, range, domain)
        _this.register_selected_data(domain, d);
      }else{
        // console.log('else',d, range, domain)
        _this.register_selected_data(0, d);
      }
    });
  //
  //
  //
  function brushmoved(x){

    var s = d3.event.selection;
    if (s == null) {
      // handle.attr("display", "none");
    } else {
      // console.log('x',s, sx);
      // _this.register_selected_data(x, sx);
    }
  }
  let brush_containers = new_container.append('g')
  // .attr('transform', 'translate(' + this.cell_render_config['offset_x'] +',' +this.cell_render_config['offset_y'] +')')
    .attr('transform', 'translate(' + 0 +',' + 0 +')')
    .attr('class', 'brush').call(brush);

  brush_containers.append('title').text(d=>d.uid)

};

DistributionMatrix.prototype.get_selected_data = function(){

  return [this.selected_features, this.selected_units]
};



DistributionMatrix.prototype.update_units_distributionV2 = function(updated_units_stats){
  console.log('updated_units_statsx', updated_units_stats);

  let _this = this;
  let new_arr = [];
  updated_units_stats.forEach(function(d){
    if(d == null){
      return
    }
    new_arr.push(d);
  });
  updated_units_stats = new_arr;
  updated_units_stats.sort(function(a,b) {
    if(a == null || b == null){
      return -1;
    }
    return parseFloat(b.dif) - parseFloat(a.dif)});
  let max_top_units_n = 15;
  let new_units = updated_units_stats.slice(0, max_top_units_n);
  let merged_units = [];

  new_units.forEach((unit, i)=>{
    let template_unit = this.id_map[unit["id"]];
    template_unit['new_unit'] = unit;
    merged_units.push(template_unit);
  });

  // Container

  let margin_x = 2;
  let margin_y = 3;

  console.log('selected_extend_units', merged_units);

  let select_cell_width = (this.top_unit_width - margin_x * 5);
  let select_cell_height = select_cell_width / 5 * 3;

  merged_units.forEach(function(d, i){
    if(d['render'] == undefined){
      d['render'] = {};
    }
    d['render']['selected_x'] = 0;
    d['render']['selected_y'] = i * select_cell_height;
    d['render']['height'] = select_cell_height;
    d['render']['width'] = select_cell_width;
  });



  this.top_unit_plot_conatiner = this.top_unit_plot_conatiner.data(merged_units, function(d){
    return d.id;
  });

  this.top_unit_plot_conatiner.exit().remove();

  let new_container = this.top_unit_plot_conatiner.enter()
    .append("g")
    .attr('class', 'top_units');

  this.top_unit_plot_conatiner = new_container.merge(this.top_unit_plot_conatiner);


  this.top_unit_plot_conatiner.attr('transform', d=>{return 'translate(' + margin_x * 2 + ',' + d.render.selected_y + ')'})
    .transition()
    .duration(2000);        // apply it over 4000 milliseconds

  new_container.append("rect")
    .attr('x', margin_x)
    .attr('y', margin_y)
    .attr('width', d=> d.render.width - 2 * margin_x)
    .attr('height', d=>d.render.height - 2 * margin_y).attr('fill', 'none').attr('fill-opacity', 0.2)
    .attr('stroke', 'grey').style("stroke-dasharray", "10,4").attr('stroke-opacity', 0.5)
    .attr('stroke-width', 1.5);

  //------------------------------------------

  //---------------------------------------------------------------

  let cell_x = d3.scaleLinear().range([margin_x, select_cell_width - margin_x])

  let cell_y = d3.scaleLinear().range([select_cell_height - margin_y, margin_y])



  new_container.each(function(d){
    cell_x.domain([0, d['kde_point'].length]);
    cell_y.domain([0,  d3.max(d['kde_point'].concat(d['new_unit']['kde_point']))]);

    let line = d3.line()
      .x((d, i) => { return cell_x(i); })
      .y((d, i) => { return cell_y(d); });
    if(d == undefined || d == null || d['kde_point'] == undefined) return;

    d3.select(this).append('path')
      .datum(d['kde_point'])
      .attr("fill", "none")
      .attr("opacity", ".8")
      .attr("stroke", _this.bicluster_colorScale(d.cid))
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d",line);

    d3.select(this).append('path')
      .datum(d['new_unit']['kde_point'])
      .attr("fill", "none")
      .attr("opacity", ".8")
      .attr("stroke", _this.bicluster_colorScale(d.cid))
      .attr("stroke-width", 1).style("stroke-dasharray", "10,4").attr('stroke-opacity', 0.5)
      .attr("stroke-linejoin", "round")
      .attr("d",line);

  });

};


DistributionMatrix.prototype.draw_linkage = function(){
// data this.cluster_groups
  this.cluster_groups;
  let _this = this;
  console.log('draw_linkage', this.cluster_groups);
  // .attr("d", d3.linkRadial()
  //         .angle(d => d.x)
  //         .radius(d => d.y));
  let linkages = [];

  this.cluster_groups.forEach(function(d){
    let source = {x: d.u_render.x, y: d.u_render.y + d.u_render.height / 2};
    let target = {x: d.f_render.x + _this.link_region_width, y: d.f_render.y + d.f_render.height / 2};
    linkages.push({
      'source':source,
      'target': target
    })
  });
  console.log('link', linkages);

  this.link_region_container.selectAll('.link').data(linkages).enter().append('line').attr('class', 'link')
    .style("stroke", "black")
    .attr("x1", d=>d.source.x)     // x position of the first end of the line
    .attr("y1", d=>d.source.y)      // y position of the first end of the line
    .attr("x2", d=>d.target.x)     // x position of the second end of the line
    .attr("y2", d=>d.target.y);    // y position of the second end of the line

};
////////Not now
DistributionMatrix.prototype.color = function(d){
  const scale = d3.scaleOrdinal(d3.schemeCategory20);
  return scale(d.cid);
};

DistributionMatrix.prototype.render_untis = function(){

  let n_cell= this.units_stats_data.length;

  this.row_num = 8;
  this.column_num = Math.ceil(n_cell / this.row_num);

  this.cell_height = this.unit_box.height / this.row_num;
  this.cell_width = this.unit_box.width / this.column_num;


  this.cell_render_config = {
    offset_x: this.cell_margin_x,
    offset_y: this.cell_margin_y,
    height: (this.unit_box.height / this.row_num) - 2 * this.cell_margin_y,
    width: (this.unit_box.width / this.column_num) - 2 * this.cell_margin_x
  };

  for(let i = 0, ilen = data.length; i < ilen; i++){
    let r_index = i % this.row_num;
    let c_index = parseInt(i / this.row_num)
    data[i]['render_config'] = {
      'x': c_index * this.cell_width,
      'y': r_index * this.cell_height
    }
  }
  this.unit_cell_container = this.unitContainer.selectAll('.cell_container').data(data)
    .enter()
    .append('g')
    .attr('class', 'cell_container')
    .attr('transform', d=>'translate(' + d['render_config']['x']+ ',' + d['render_config']['y'] + ')')




  let boundary_rect = this.unit_cell_container.append('rect').attr('class' ,'container_rect')
    .attr('x', this.cell_render_config['offset_x'])
    .attr('y', this.cell_render_config['offset_y'])
    .attr('width', this.cell_render_config['width'])
    .attr('height', this.cell_render_config['height'])
    .attr('fill', 'white').attr('stroke', 'red').attr('stroke-opacity', '0.2')
    .attr('rx', 5)
    .attr('ry', 5)
  boundary_rect.append('title').text(d=>d.uid)

  let cell_x = d3.scaleLinear()

    .range([this.cell_margin_x, this.cell_render_config['width']- this.cell_margin_x])

  let cell_y = d3.scaleLinear()

    .range([this.cell_render_config['height'], this.cell_margin_y + 2]);

  let line = d3.line()
    .x((d, i) => { return cell_x(i); })
    .y((d, i) => { return cell_y(d); });

  this.unit_cell_container.each(function(d){
    if(!d['kde_point']){
      return
    }

    cell_x.domain([0, d['kde_point'].length])

    cell_y.domain([0,  d3.max(d['kde_point'])])


    d3.select(this).append('path')
      .datum(d['kde_point'])
      .attr("fill", "none")
      .attr("opacity", ".8")
      .attr("stroke", "#08b5fa")
      .attr("stroke-width", 1)
      .style("stroke-dasharray", "4,4")
      .attr("stroke-linejoin", "round")
      .attr("d",line)
  })
};

DistributionMatrix.prototype.initialize_render = function(){

  // Initialize
  this.featureContainer = this.svg.append('g').attr('class', 'feature_container')
    .attr('transform', 'translate(' + this.feature_box['x']+ ',' + this.feature_box['y'] + ')');
  this.unitContainer = this.svg.append('g').attr('class', 'unit_container')
    .attr('transform', 'translate(' + this.unit_box['x']+ ',' + this.unit_box['y'] + ')');

  // render the boundary, remove latter
  this.featureContainer.append('rect')
    .attr('width', this.feature_box['width'])
    .attr('height', this.feature_box['height'])
    .attr('stroke', 'red').attr('stroke-width', 0.2).attr('fill', 'none');

  this.unitContainer.append('rect')
    .attr('width', this.unit_box['width']).attr('height', this.feature_box['height']).attr('fill', 'none')
    .attr('stroke', 'blue').attr('stroke-width', 0.2).attr('stroke', 'blue');

};

//Old version
DistributionMatrix.prototype.update_units_render = function(data){
  this.unit_statistics = data;
  let n_cell= data.length;
  let _this = this;
  this.row_num = 8;
  this.column_num = Math.ceil(n_cell / this.row_num);

  this.cell_height = this.unit_box.height / this.row_num;
  this.cell_width = this.unit_box.width / this.column_num;


  this.cell_render_config = {
    offset_x: this.cell_margin_x,
    offset_y: this.cell_margin_y,
    height: (this.unit_box.height / this.row_num) - 2 * this.cell_margin_y,
    width: (this.unit_box.width / this.column_num) - 2 * this.cell_margin_x
  };

  for(let i = 0, ilen = data.length; i < ilen; i++){
    let r_index = i % this.row_num;
    let c_index = parseInt(i / this.row_num)
    data[i]['render_config'] = {
      'x': c_index * this.cell_width,
      'y': r_index * this.cell_height
    }
  }
  this.unit_cell_container = this.unitContainer.selectAll('.cell_container').data(data)
    .enter()
    .append('g')
    .attr('class', 'cell_container')
    .attr('transform', d=>'translate(' + d['render_config']['x']+ ',' + d['render_config']['y'] + ')')

  let boundary_rect = this.unit_cell_container.append('rect').attr('class' ,'container_rect')
    .attr('x', this.cell_render_config['offset_x'])
    .attr('y', this.cell_render_config['offset_y'])
    .attr('width', this.cell_render_config['width'])
    .attr('height', this.cell_render_config['height'])
    .attr('stroke', d=>_this.bicluster_colorScale(d.cid)).attr('stroke-width', 0.5)
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('fill', d=>_this.bicluster_colorScale(d.cid)).attr('fill-opacity', 0.5)
    .attr('fill', 'white')

  boundary_rect.append('title').text(d=>d.uid)

  let cell_x = d3.scaleLinear()

    .range([this.cell_margin_x, this.cell_render_config['width']- this.cell_margin_x])

  let cell_y = d3.scaleLinear()

    .range([this.cell_render_config['height'], this.cell_margin_y + 2]);

  let line = d3.line()
    .x((d, i) => { return cell_x(i); })
    .y((d, i) => { return cell_y(d); });

  this.unit_cell_container.each(function(d){
    if(!d['kde_point']){
      return
    }

    cell_x.domain([0, d['kde_point'].length]);

    cell_y.domain([0,  d3.max(d['kde_point'])]);


    d3.select(this).append('path')
      .datum(d['kde_point'])
      .attr("fill", "none")
      .attr("opacity", ".8")
      .attr("stroke", _this.bicluster_colorScale(d.cid))
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d",line)
  })

};

DistributionMatrix.prototype.update_features_render = function(data){
  let _this = this;
  let n_cell= data.length;

  this.row_num = 15;
  this.column_num = Math.ceil(n_cell / this.row_num);

  this.cell_height = this.feature_box.height / this.row_num;
  this.cell_width = this.feature_box.width / this.column_num;


  this.cell_render_config = {
    offset_x: this.cell_margin_x,
    offset_y: this.cell_margin_y,
    height: (this.feature_box.height / this.row_num) - 2 * this.cell_margin_y,
    width: (this.feature_box.width / this.column_num) - 2 * this.cell_margin_x
  };

  //Can be reused!
  for(let i = 0, ilen = data.length; i < ilen; i++){
    let r_index = i % this.row_num;
    let c_index = parseInt(i / this.row_num)
    data[i]['render_config'] = {
      'x': c_index * this.cell_width,
      'y': r_index * this.cell_height
    }
  }




  //


  this.feature_cell_containers = this.featureContainer.selectAll('.cell_container').data(data)
    .enter()
    .append('g')
    .attr('class', 'cell_container')
    .attr('transform', d=>'translate(' + d['render_config']['x']+ ',' + d['render_config']['y'] + ')');

  this.feature_cell_containers.append('text').text(function(d){
    let title_list = d.id.split('_')
    if(title_list.length >=2){
      let feature = d.id.split('_')[2];
      if(feature == 'SeaLevelPressure'){
        feature = "SLP"
      }else if(feature == 'StationPresure'){
        feature = "SP"
      }else if(feature == "WindDirection"){
        feature = "WD"
      }else if(feature == "CloudCover"){
        feature = "CC"
      }
      return feature

    }else{
      return d.id
    }

  }).style("font-size", "8px")
    .attr('y', this.cell_render_config['height'] - 8)
    .attr('x', 2);

  let boundary_rect = this.feature_cell_containers.append('rect').attr('class' ,'container_rect')
    .attr('x', this.cell_render_config['offset_x'])
    .attr('y', this.cell_render_config['offset_y'])
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('width', this.cell_render_config['width'])
    .attr('height', this.cell_render_config['height'])
    .attr('stroke', d=>_this.bicluster_colorScale(d.cid)).attr('stroke-opacity', 1)
    .attr('fill', 'none');
  // .attr('fill', d=>_this.bicluster_colorScale(d.cid)).attr('fill-opacity', 0.0)

  boundary_rect.append('title').text(d=>d.fid);

  let cell_x = d3.scaleLinear()
    .domain([0, 50])
    .range([this.cell_margin_x, this.cell_render_config['width'] - this.cell_margin_x])

  let cell_y = d3.scaleLinear()
    .range([this.cell_render_config['height'], this.cell_margin_y + 2]);

  let line = d3.line()
    .x((d, i) => { return cell_x(i); })
    .y((d, i) => { return cell_y(d); });

  this.feature_cell_containers.each(function(d){
    if(!d['kde_point']){
      return
    }
    cell_y.domain([0,  d3.max(d['kde_point'])])


    d3.select(this).append('path')
      .datum(d['kde_point'])
      .attr("fill", "none")
      .attr("opacity", ".8")
      // .attr("stroke", "#08b5fa")
      .attr("stroke", _this.bicluster_colorScale(d.cid))
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d",line)
  });

  var brush = d3.brushX()
    .extent([[0, 0], [this.cell_render_config['width'], this.cell_render_config['height']]])
    .on("start brush", brushmoved)
    .on("end", function(d){
      let range = d3.event.selection;
      if(range){
        let domain = range.map(cell_x.invert);
        _this.register_selected_data(domain, d);
      }else{
        _this.register_selected_data(0, d);
      }
    });



  function brushmoved(x){

    var s = d3.event.selection;
    if (s == null) {
      // handle.attr("display", "none");

    } else {

      // console.log('x',s, sx);
      // _this.register_selected_data(x, sx);
    }
  }
  let brush_containers = this.feature_cell_containers.append('g')
    .attr('transform', 'translate(' + this.cell_render_config['offset_x'] +',' +this.cell_render_config['offset_y'] +')')
    .attr('class', 'brush').call(brush);

  brush_containers.append('title').text(d=>d.uid)
};

DistributionMatrix.prototype.update_units_distribution_difference = function(updated_units_stats){
  if(updated_units_stats == null || updated_units_stats.length == 0){
    return
  }
  let _this = this;

  // Reformat data
  let unitid2stats = {};
  for(let i = 0, ilen = updated_units_stats.length; i < ilen; i++){
    if(updated_units_stats[i])
      unitid2stats[updated_units_stats[i]['id']] = updated_units_stats[i];
  }

  this.unit_statistics.forEach(function(d){
    d['update_records'] = unitid2stats[d['id']]
  });
  console.log("unit_statistics.", this.unit_statistics);



  this.cell_render_config = {
    offset_x: this.cell_margin_x,
    offset_y: this.cell_margin_y,
    height: (this.unit_box.height / this.row_num) - 2 * this.cell_margin_y,
    width: (this.unit_box.width / this.column_num) - 2 * this.cell_margin_x
  };


  let cell_x = d3.scaleLinear()

    .range([this.cell_margin_x, this.cell_render_config['width']- this.cell_margin_x])

  let cell_y = d3.scaleLinear()

    .range([this.cell_render_config['height'], this.cell_margin_y + 2]);

  let line = d3.line()
    .x((d, i) => { return cell_x(i); })
    .y((d, i) => { return cell_y(d); });

  this.unit_cell_container.each(function(d){
    if(!d['kde_point']){
      return
    }
    let update_stats = d['update_records'];
    cell_x.domain([0, update_stats['kde_point'].length]);

    cell_y.domain([0,  d3.max(update_stats['kde_point'])]);

    d3.select(this).select('.update_path').remove();
    d3.select(this).append('path')
      .datum(update_stats['kde_point'])
      .attr("fill", "none")
      .attr('class', 'update_path')
      .attr("opacity", ".8")
      .attr("stroke",  _this.bicluster_colorScale(d.cid))
      .attr("stroke-width", 0.8)
      .style("stroke-dasharray", "2,2")
      // .attr("stroke-linejoin", "round")
      .attr("d",line)
  })

  // DistributionMatrix.prototype.add_feature_stats = function(data){
  //   this.feature_stats_data = data;
  //   this.feature_data_sign = true;
  //   if(this.units_data_sign == true){
  //     console.log('udpate add_feature_stats');
  //     this.update_render();
  //   }
  // };
};

export default DistributionMatrix
