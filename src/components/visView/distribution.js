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


  this.selected_features = {};
  this.selected_units = {};


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
      delete this.selected_features[d['id']]
    else
      this.selected_features[d['id']] = [parseInt(domain[0]), Math.ceil(domain[1])];
  }else{
    if(domain == 0)
      delete this.selected_units[d['id']]
    else
      this.selected_units[d['id']] = [int(domain[0]), Math.ceil(domain[1])];
  }
  // this.select_call_back(this.selected_features, this.selected_units)
};



DistributionMatrix.prototype.add_feature_stats = function(data){
  this.feature_stats_data = data;
  this.feature_data_sign = true;
  if(this.units_data_sign == true){
    console.log('udpate add_feature_stats');
    this.update_render();
  }
};
DistributionMatrix.prototype.color = function(d){
  const scale = d3.scaleOrdinal(d3.schemeCategory20);
  return scale(d.cid);
};

DistributionMatrix.prototype.bicluster_colorScale  = d3.scaleOrdinal(d3["schemeCategory20"]);




DistributionMatrix.prototype.set_feature_and_unit_states = function(feature_units_stats){
  console.log('Get all distribution');
  console.log('data',feature_units_stats);

  let bicluster = feature_units_stats['bicluster']['bi_clusters'];
  this.group_n_column = 14;

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

  this.calc_position(cluster_groups);

  console.log('size', cluster_groups);

};

DistributionMatrix.prototype.calc_position = function(cluster_groups){
  let _this = this;
  let canvas_width = this.canvas_width;
  let canvas_height = this.canvas_height;
  let row_n = 0;
  cluster_groups.forEach(function(cluster){
    row_n += Math.ceil(cluster['size'] / _this.group_n_column)
  });
  console.log('row_n', row_n);
};

DistributionMatrix.prototype.get_selected_data = function(){
  return [this.selected_features, this.selected_units]
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
};


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

export default DistributionMatrix
