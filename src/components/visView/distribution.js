import * as d3 from "d3";
import { mapGetters } from "vuex";
// import { ElStep } from "element-ui/types/step";

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

  // this.select_call_back(this.selected_features, this.selected_units)
};


DistributionMatrix.prototype.bicluster_colorScale  = d3.scaleOrdinal(d3["schemeCategory20"]);
DistributionMatrix.prototype.bicluster_colorScale  = function(){
  return 'grey'
};
DistributionMatrix.prototype.feature_color = d3.scaleOrdinal(d3["schemeCategory20"]);
DistributionMatrix.prototype.feature_color.domain(["CO", "NO2", "O3", "SO2", "PM10", "PM25", "AQHI", "AQHIER", "Temp", "Wind", "WindDirection", "RH", "SeaLevelPressure", "DewPt", "CloudCover", "StationPresure"]);

DistributionMatrix.prototype.initialize_bicluster_render = function(feature_units_stats){
  let _this = this;
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
  let cluster_map = {};
  for(let cid in bicluster){
    let _obj = {
      'cid': cid,
      'size': bicluster[cid]['f_ids'].length + bicluster[cid]['u_ids'].length,
      'f_ids': bicluster[cid]['f_ids'],
      'u_ids': bicluster[cid]['u_ids']
    };
    cluster_map[cid] = _obj;
    cluster_groups.push(_obj);
  }

  this.cluster_groups = cluster_groups;
  this.cluster_map = cluster_map;
  this.cluster_weights = feature_units_stats['bicluster']['weights'];

  console.log('wiehgtsss', this.cluster_weights);
  this.link_region_width = this.canvas_width * 0.15;
  this.remain_width=  this.canvas_width - this.link_region_width;
  this.top_unit_width = this.remain_width * 0.15;
  this.top_feature_width = this.remain_width * 0.15;
  this.unit_region_width = this.remain_width * 0.3;
  this.feature_region_width = this.remain_width * 0.4;
  this.legend_container_height = this.canvas_height * 0.05;
  this.legend_container_width = this.canvas_width;
  this.remain_height = this.canvas_height - this.legend_container_height;

  this.root_container = this.svg.append('g').attr('class', 'root_container');

  this.legend_container = this.root_container.append('g').attr('class', 'legend_container');
  this.top_unit_container = this.root_container.append('g').attr('class', 'top_unit_container').attr('transform', 'translate(' + 0 + ',' + this.legend_container_height + ')');

  // this.top_unit_container.append('rect')
  //   .attr('width', this.top_unit_width).attr('height', this.canvas_height).attr('fill', 'none')
  //   .attr('stroke', 'blue').attr('stroke-width', 0.2);


  this.unit_container = this.root_container.append('g').attr('class', 'unit_container').attr('transform', 'translate(' + (this.top_unit_width) + ','+ this.legend_container_height + ')');
  // this.unit_container.append('rect')
  //   .attr('width', this.unit_region_width).attr('height', this.canvas_height).attr('fill', 'none')
  //   .attr('stroke', 'red').attr('stroke-width', 0.2);

  this.link_region_container = this.root_container.append('g').attr('class', 'link_region_container').attr('transform', 'translate(' + (this.top_unit_width + this.unit_region_width) + ','+ this.legend_container_height + ')');
  // this.link_region_container.append('rect')
  //   .attr('width', this.link_region_width).attr('height', this.canvas_height).attr('fill', 'none')
  //   .attr('stroke', 'blue').attr('stroke-width', 0.2);

  this.feature_container = this.root_container.append('g').attr('class', 'feature_container').attr('transform', 'translate(' + (this.top_unit_width + this.unit_region_width + this.link_region_width) + ','+ this.legend_container_height + ')');
  // this.feature_container.append('rect')
  //   .attr('width', this.feature_region_width).attr('height', this.canvas_height).attr('fill', 'none')
  //   .attr('stroke', 'red').attr('stroke-width', 0.2);

  this.selected_feature_container_outer = this.root_container.append('g').attr('class', 'top_feature_width')
    .attr('transform', 'translate(' + (this.top_unit_width + this.unit_region_width + this.link_region_width + this.feature_region_width) + ','+ (this.legend_container_height*2) + ')');

  this.selected_feature_container = this.selected_feature_container_outer.append('g');
  this.selected_feature_container.append('rect').attr('fill', 'white').attr('height', 2000).attr('width', 2000);

  // this.selected_feature_container.append('rect')
  //   .attr('x', 3)
  //   .attr('y', 3)
  //   .attr('width', this.top_feature_width - 2 * 3).attr('height', this.canvas_height - 2 * 3).attr('fill', 'none').attr('stroke-dasharray', '10,5')
  //   .attr('stroke', 'blue').attr('stroke-width', 0.2);

  this.selected_feature_plot_conatiner = this.selected_feature_container.append('g').attr('class', 'selected_feature_container').selectAll('.selected_feature');

  this.top_unit_plot_conatiner = this.top_unit_container.append('g').attr('class', 'top_unit_plot_conatiner').selectAll('.top_units');
  // this.selected_feature_plot_conatiner.selectAll('.selected_feature')
  this.calc_position(cluster_groups);

  var zoomer = d3.zoom().scaleExtent([1 / 2, 4]).on("zoom", zoom);
  this.selected_feature_container.call(zoomer);
  function zoom(){
    let y =  d3.event.transform['y'];

    _this.selected_feature_container.attr("transform", 'translate('+0 + ',' + y+')');
  }
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

  let u_cell_height = (this.remain_height - this.u_total_gap) / u_total_row;
  let f_cell_height = (this.remain_height - this.f_total_gap) / f_total_row;
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
  let highlight_outline = 1.8;
  this.single_unit_container.append('rect').attr('x', _margin).attr('y', _margin).attr('rx', 1).attr('ry', 1)
    .attr('class', 'unit_group_outline')
    .attr('width', d=>d.u_render.width - 2* _margin)
    .attr('height', d=>d.u_render.height -  2* _margin)
    .attr('fill', 'white')
    .attr('stroke', d=>this.bicluster_colorScale(d.cid))
    .attr('stroke-width', 1.5)
    .on('mouseover', function(d){
      // let uc_id = d.cid;
      // d3.select(this).attr('stroke-width', highlight_outline).attr('stroke', 'black');
      // d3.selectAll('.link').each(function(d){
      //   if(d['source']['uc_id'] != uc_id){
      //     d3.select(this).attr('stroke-opacity', 0)
      //   }
      //   else{
      //     let fc_id = d['target']['fc_id'];
      //     d3.selectAll('.feature_group').each(function(_d){
      //       if(fc_id == _d.cid){
      //         d3.select(this).select('.feature_group_outline').attr('stroke-width', highlight_outline).attr('stroke', 'black')
      //       }
      //     })
      //   }
      // });
      _this.highlight_unit_group(d.cid);
    })
    .on('mouseout', function(d){
      // let uc_id = d.cid;
      // d3.select(this).attr('stroke-width', 1.5).attr('stroke', d=>_this.bicluster_colorScale(d.cid));
      // d3.selectAll('.link').each(function(d){
      //   if(d['source']['uc_id'] != uc_id){
      //     d3.select(this).attr('stroke-opacity', 0.2)
      //   }
      // });
      // d3.selectAll('.feature_group_outline').attr('stroke-width', 1.5).attr('stroke', d=>_this.bicluster_colorScale(d.cid))
      _this.unhighlight_unit_group(d.cid);
    })



  this.single_feature_container = this.feature_container.selectAll('.feature_group').data(cluster_groups).enter().append('g').attr('class','feature_group')
    .attr('transform', (d, i) => 'translate(' + d.f_render.x + ',' + d.f_render.y +')');

  this.single_feature_container.append('rect').attr('x', _margin).attr('y', _margin).attr('rx', 1).attr('ry', 1)
    .attr('class', 'feature_group_outline')
    .attr('width', d=>d.f_render.width - 2 * _margin).attr('height', d=>d.f_render.height -  2* _margin)
    .attr('fill', 'white')
    .attr('stroke', d=>this.bicluster_colorScale(d.cid))
    .attr('stroke-width', 1.5)
    .on('mouseover', function(d){
      // let fc_id = d.cid;
      // d3.select(this).attr('stroke-width', highlight_outline).attr('stroke', 'black');
      // d3.selectAll('.link').each(function(d){
      //   if(d['target']['fc_id'] != fc_id){
      //     d3.select(this).attr('stroke-opacity', 0)
      //   }
      //   else{
      //     let uc_id = d['source']['uc_id'];
      //     d3.selectAll('.unit_group').each(function(_d){
      //       if(uc_id == _d.cid){
      //         d3.select(this).select('.unit_group_outline').attr('stroke-width', highlight_outline).attr('stroke', 'black')
      //       }
      //     })
      //   }
      // });
      _this.highlight_feature_group(d.cid);
    })
    .on('mouseout', function(d){
      // let fc_id = d.cid;
      // d3.select(this).attr('stroke-width', 1.5).attr('stroke', d=>_this.bicluster_colorScale(d.cid));
      // d3.selectAll('.link').each(function(d){
      //   if(d['target']['fc_id'] != fc_id){
      //     d3.select(this).attr('stroke-opacity', 0.2)
      //   }
        
      // });
      // d3.selectAll('.unit_group_outline').attr('stroke-width', 1.5).attr('stroke', d=>_this.bicluster_colorScale(d.cid))
      _this.unhighlight_feature_group(d.cid);
    })

};

// highlight unit_group
DistributionMatrix.prototype.highlight_unit_group = function(uc_id){
  let highlight_outline = 1.8
  d3.selectAll('.unit_group').each(function(_d){
    if(uc_id == _d.cid){
      d3.select(this).select('.unit_group_outline').attr('stroke-width', highlight_outline).attr('stroke', 'black')
    }
  });
  d3.select(this.$el).selectAll('.link').each(function(d){
    if(d['source']['uc_id'] != uc_id){
      d3.select(this).attr('stroke-opacity', 0)
    }
    else{
      let fc_id = d['target']['fc_id'];
      d3.selectAll('.feature_group').each(function(_d){
        if(fc_id == _d.cid){
          d3.select(this).select('.feature_group_outline').attr('stroke-width', highlight_outline).attr('stroke', 'black')
        }
      })
    }
  });
}
// unhighlight unit_group
DistributionMatrix.prototype.unhighlight_unit_group = function(uc_id){
  let _this = this;
  d3.selectAll('.unit_group_outline').attr('stroke-width', 1.5).attr('stroke', d=>_this.bicluster_colorScale(d.cid))
  d3.select(this.$el).selectAll('.link').each(function(d){
    if(d['source']['uc_id'] != uc_id){
      d3.select(this).attr('stroke-opacity', 0.2)
    }
  });
  d3.selectAll('.feature_group_outline').attr('stroke-width', 1.5).attr('stroke', d=>_this.bicluster_colorScale(d.cid))
}
// highlight feature_group
DistributionMatrix.prototype.highlight_feature_group = function(fc_id){
  let highlight_outline = 1.8
  d3.selectAll('.feature_group').each(function(_d){
    if(fc_id == _d.cid){
      d3.select(this).select('.feature_group_outline').attr('stroke-width', highlight_outline).attr('stroke', 'black')
    }
  });
  d3.select(this.$el).selectAll('.link').each(function(d){
    if(d['target']['fc_id'] != fc_id){
      d3.select(this).attr('stroke-opacity', 0);
    }
    else{
      let uc_id = d['source']['uc_id'];
      d3.selectAll('.unit_group').each(function(_d){
        if(uc_id == _d.cid){
          d3.select(this).select('.unit_group_outline').attr('stroke-width', highlight_outline).attr('stroke', 'black')
        }
      })
      // console.log(d['weight']);
    }
  });
}
// unhighlight feature_group
DistributionMatrix.prototype.unhighlight_feature_group = function(fc_id){
  let _this = this;
  d3.selectAll('.feature_group_outline').attr('stroke-width', 1.5).attr('stroke', d=>_this.bicluster_colorScale(d.cid))
  d3.select(this.$el).selectAll('.link').each(function(d){
    if(d['target']['fc_id'] != fc_id){
      d3.select(this).attr('stroke-opacity', 0.2)
    }
  });
  d3.selectAll('.unit_group_outline').attr('stroke-width', 1.5).attr('stroke', d=>_this.bicluster_colorScale(d.cid))
}

DistributionMatrix.prototype.distance_level = {0: 0, 10: 1, 30: 1, 100:3, 200: 4, 300: 4};

DistributionMatrix.prototype.features = ["CO", "NO2", "O3", "SO2", "PM10", "PM25", "AQHI", "AQHIER", "Temp", "Wind", "WindDirection", "RH", "SeaLevelPressure", "DewPt", "CloudCover", "StationPresure"];

DistributionMatrix.prototype.directions = {'E': 0,  'ES': 1, "S": 2, "SW": 3, "W": 4, "WN": 5, "N": 6, "NE": 7};

DistributionMatrix.prototype.parse_feature_name = function(feature_name){

  let name_arr = feature_name.split('_');
  if(name_arr.length == 1){
    return {
      distance: 0,
      direction: -1,
      feature: feature_name
    }
  }else{
    return {
      distance: parseInt(name_arr[0]),
      direction: name_arr[1],
      feature: name_arr[2]
    }
  }
};

// sort the features in each feature_group
DistributionMatrix.prototype.sort_features = function(d){
  let _this = this
  if(d == 'type'){
    var order = this.features;
    var parse = 'feature';
  }else if(d == 'direction'){
    var order = [-1, 'E', 'ES', 'S', 'SW', 'W', 'WN', 'N', 'NE'];
    var parse = 'direction'
  }else if(d == 'distance'){
    var order = [0, '10', '30', '100', '200', '300'];
    var parse = 'distance'
  }


  this.single_feature_container.each(function(d, i){
    let new_order = []
    order.forEach(function(item){
      d['f_ids'].forEach(function(feature){
        var name_obj = _this.parse_feature_name(feature);
        var tmp = name_obj[parse];
        if(tmp == item){
          new_order.push(feature);
        }
      })
    })
    d3.select(this).selectAll('.feature_cell').data(new_order);
  })

  this.update_feature_sorting_render();

  d3.selectAll('.feature_cell').each(function(_id){
    if(_this.selected_extend_units[_id] != undefined){
      if(_this.selected_extend_units[_id]['render']['clicked'] == true){
        d3.select(this).select('.feature_cell_outline').attr('stroke', 'black');
      }
    }
  });

};

// sort the features render
DistributionMatrix.prototype.update_feature_sorting_render = function(){
  let _this = this;
  d3.selectAll('.feature_cell').each(function(d){
    d3.select(this).selectAll('*').remove()
  })

  this.single_feature_container.each(function(d, i){
    let _margin = 2 ;
    let feature_cell_width = (d.f_render.width / _this.f_col_max_n) - 2 * _margin;
    let feature_cell_height = _this.f_cell_height - 2 * _margin;

    d3.select(this).selectAll('.feature_cell').each(function(_fid){

      let _container = d3.select(this);


      let _rect = _container.append('rect').attr('x', _margin).attr('y', _margin)
        .attr('width', (d.f_render.width / _this.f_col_max_n) - 2 * _margin)
        .attr('height', _this.f_cell_height - 2 * _margin)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', 'white')
        .attr('fill-opacity', 0.2)
        .attr('stroke','white');

      _rect.append('title').text(_id=>_this.id_map[_id].id);

      // ------------------------------------------------------------------------------
      let name_obj = _this.parse_feature_name(_this.id_map[_fid]['id']);
      let direction = name_obj['direction'];
      let distance = name_obj['distance'];
      let feature = name_obj['feature'];
      let distance_level = _this.distance_level[distance];



      let unit_width = feature_cell_width / 10;
      let unit_height = feature_cell_height / 10;
      let _x = _margin + (5- (distance_level + 1)) * unit_width ;
      let _y = _margin + (5- (distance_level + 1)) * unit_height ;
      let _w =  ((distance_level + 1)) * unit_width * 2;
      let _h = ((distance_level + 1)) * unit_height * 2;

      let boundary_color = 'white';
      let _rect_out = _container.append('rect')
        .attr('x', _x).attr('y', _y).attr('rx', 2).attr('ry', 2)
        .attr('fill', "rgb(228, 177, 146)").attr('width', _w).attr('height', _h)
        .append('title').text(_id=>_this.id_map[_id].id)


      // let _x2 = _margin + (4- (distance_level)) * unit_width ;
      // let _y2 = _margin + (4- (distance_level)) * unit_height ;
      let _x2 = _margin + (5- (distance_level)) * unit_width ;
      let _y2 = _margin + (5- (distance_level)) * unit_height ;

      let _w2 =  ((distance_level)) * unit_width * 2;
      let _h2 = ((distance_level)) * unit_height * 2;
      let _rect_in = _container.append('rect')
        .attr('x', _x2).attr('y', _y2)
        .attr('fill', boundary_color)
        .attr('rx', 2).attr('ry', 2)
        .attr('width', _w2).attr('height', _h2)
        .append('title').text(_id=>_this.id_map[_id].id)

      // outliner boundary
      let _outline_rect = _container.append('rect')
        .attr('class', 'feature_cell_outline')
        .attr('x', _margin).attr('y', _margin)
        .attr('width', feature_cell_width)
        .attr('height', feature_cell_height)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', _this.feature_color(feature))
        .attr('fill-opacity',0.4)
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
        });

      _outline_rect.append('title').text(_id=>_this.id_map[_id].id);

      if(direction == -1){
        return
      }
      let direction_pi = Math.PI / 4 * _this.directions[direction];

      let center_x =_margin + feature_cell_width / 2;
      let center_y = _margin + feature_cell_height / 2;
      let radius = Math.sqrt(feature_cell_height * feature_cell_height  + feature_cell_width * feature_cell_width) / 3;



      _container.append("line")
        .style("stroke", _this.feature_color(feature))
        .attr('stroke-width', 1.5)
        .attr("x1", center_x)
        .attr("y1",center_y)
        .attr("x2", _=>{
          return center_x + radius * Math.cos(direction_pi)
        })
        .attr("y2", center_y + radius * Math.sin(direction_pi))


    });
  })

  this.update_selected_units();

};


// mouseover 
DistributionMatrix.prototype.mouseover_unit = function(_id){
  let unit_id = Number(_id);
  d3.selectAll('.unit_cell').each(function(uid){
    if(uid == unit_id){
      d3.select(this).select('.unit_cell_outline').attr('stroke', 'black').attr('stroke-opacity', 1)
    }
  })
  d3.selectAll('.top_units').each(function(d){
    if(Number(d.id) == unit_id){
      d3.select(this).select('.top_unit_outline').attr('stroke','black').attr('stroke-opacity', 1)
    }
  })
}

DistributionMatrix.prototype.mouseover_feature = function(_id){
  let _this = this;
  d3.selectAll('.feature_cell').each(function(d){
    if(d == _id){
      d3.select(this).select('.feature_cell_outline').attr('stroke', 'black')
    }
  })
  d3.selectAll('.selected_feature').each(function(selected_f){
    if(selected_f.id == _id){
      d3.select(this).select('.selected_feature_outline').attr('stroke', 'black')
      .style("stroke-dasharray", "10,4").attr('stroke-opacity', 1);
    }
  })
}

// mouseout
DistributionMatrix.prototype.mouseout_unit = function(_id){
  let _this = this;
  let unit_id = Number(_id);
  d3.selectAll('.unit_cell').each(function(d){
    if(d == unit_id){
      d3.select(this).select('.unit_cell_outline').attr('stroke', d=>_this.bicluster_colorScale(d.cid)).attr('stroke-opacity', 0.8)
    }
  })
  d3.selectAll('.top_units').each(function(d){
    if(Number(d.id) == unit_id){
      d3.select(this).select('.top_unit_outline').attr('stroke','grey').attr('stroke-opacity', 0.5)
    }
  })
}

DistributionMatrix.prototype.mouseout_feature = function(_id){
  let _this = this;
  d3.selectAll('.feature_cell').each(function(d){
    if(d == _id){
      let cell_data = _this.id_map[_id];
      if(cell_data['render'] == undefined){
        cell_data['render'] = {'clicked': false};
      }
      if(cell_data['render']['clicked'] == false){
        d3.select(this).select('.feature_cell_outline').attr('stroke', 'white')
      }
    }
  })

  d3.selectAll('.selected_feature').each(function(selected_f){
    if(selected_f.id == _id){
      d3.select(this).select('.selected_feature_outline').attr('stroke', 'grey')
      .style("stroke-dasharray", "10,4").attr('stroke-opacity', 0.5);
    }
  })
}


// plot legend
DistributionMatrix.prototype.plot_legend = function(){
  let _this = this;
  let padding_x = this.legend_container_width * 0.05;
  let padding_y = this.legend_container_height * 0.1;
  let w = (this.legend_container_width - 2*padding_x)/(this.features.length+1);
  let h = this.legend_container_height - 2*padding_y;
  let legends = this.legend_container.selectAll('.single_legend').data(this.features).enter().append('g')
    .attr('class', 'single_legend')
    .attr('transform', (d, i)=> 'translate(' + (padding_x+i*w) + ',' + padding_y + ')')

  // sort button
  let sort_button = this.legend_container.append('g')
    .attr('class', 'sort_button')
    .attr('transform', 'translate(' + (padding_x+this.features.length*w) + ',' + 0 +')');

  sort_button.append('text')
    .attr('x', 4)
    .attr('y', 0)
    .attr('dy', '1em')
    .attr('fill', 'black')
    .attr('font-size', '10px')
    .text('Sort By');

  let sorts = ['type', 'direction', 'distance'];
  let buttons = sort_button.selectAll('.button_cell').data(sorts).enter().append('g')
    .attr('class', 'button_cell')
    .attr('transform', (d, i)=> 'translate(' + 0 + ',' + (15*(i+1)) + ')')

  buttons.each(function(d){
    let __this = this
    d3.select(this).append('rect')
      .attr('class', 'button_rect')
      .attr('x', 2)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('y', 2)
      .attr('width', w+padding_x-4)
      .attr('height', '13')
      .attr('fill', 'none')
      .attr('stroke', 'grey')
      .attr('stroke-width', '1');

    d3.select(this).append('text')
      .attr('x', 6)
      .attr('y', 2)
      .attr('dy', '1em')
      .attr('fill', 'black')
      .attr('font-size', '10px')
      .text(d)
      .on('click',function(d){
        _this.sort_features(d);

        d3.selectAll('.button_rect').attr('stroke', 'grey').attr('stroke-width', '1')
        d3.select(__this).select('.button_rect').attr('stroke', 'black').attr('stroke-width', '2')
      });
  })

  // legend
  let w_legend = w/2;
  let h_legend = h/2;
  legends.each(function(f){
    d3.select(this).append('rect')
      .attr('class', 'legend_rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('width', w_legend)
      .attr('height', h_legend)
      .attr('fill', _this.feature_color(f))
      .attr('fill-opacity',0.4)
      .append('title').text(f);

    d3.select(this).append('text')
      .text(function(f){
        if(f == 'WindDirection'){
          return 'WD'
        }else if(f == 'SeaLevelPressure'){
          return 'SLP'
        }else if(f == 'CloudCover'){
          return 'CC'
        }else if(f == 'StationPresure'){
          return 'SP'
        }else if(f == 'AQHIER'){
          return 'AR'
        }else if(f == 'DewPt'){
          return 'DP'
        }else{
          return f
        }
      })
      .attr('x', 0)
      .attr('y', h_legend)
      .attr('dy', '1em')
      .attr('fill', 'black')
      .attr('font-size', '10px');
  });

  d3.selectAll('.legend_rect').each(function(d){
    d3.select(this)
    .on('click',function(type){
      d3.selectAll('.feature_cell').each(function(_id){
        var name_obj = _this.parse_feature_name(_id);
        var name = name_obj['feature'];
        if(type == name){
          let cell_data = _this.id_map[_id];
          if(cell_data['render'] == undefined){
            cell_data['render'] = {'clicked': false};
          }
          if(cell_data['render']['clicked'] == false){
            cell_data['render']['clicked'] = true;
            _this.selected_extend_units[_id] = cell_data;
            d3.select(this).select('.feature_cell_outline').attr('stroke', 'black')
          }else{
            cell_data['render']['clicked'] = false;
            delete _this.selected_extend_units[_id];
            d3.select(this).select('.feature_cell_outline').attr('stroke', 'white')
          }
        }
      })
      _this.update_selected_units();
    })
  })

}

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
      .attr('class', 'unit_cell_outline')
      .attr('width', _cell_width)
      .attr('height', _cell_height)
      .attr('fill', 'none').attr('fill-opacity', 0.2)
      .attr('rx',3)
      .attr('ry',3)
      .attr('stroke',d=>_this.bicluster_colorScale(d.cid)).attr('stroke-opacity', 0.8)
      .attr('d', _=> _);

  });

  // Legend
  this.plot_legend();



  // Layout feature containers
  this.single_feature_container.each(function(d, i){
    let _margin = 2 ;
    let feature_cell_width = (d.f_render.width / _this.f_col_max_n) - 2 * _margin;
    let feature_cell_height = _this.f_cell_height - 2 * _margin;
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




    feature_cells.each(function(_fid){

      let _container = d3.select(this);


      let _rect = _container.append('rect').attr('x', _margin).attr('y', _margin)
        .attr('width', (d.f_render.width / _this.f_col_max_n) - 2 * _margin)
        .attr('height', _this.f_cell_height - 2 * _margin)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', 'white')
        .attr('fill-opacity', 0.2)
        .attr('stroke','white');

      _rect.append('title').text(_id=>_this.id_map[_id].id);

      // ------------------------------------------------------------------------------
      let name_obj = _this.parse_feature_name(_this.id_map[_fid]['id']);
      let direction = name_obj['direction'];
      let distance = name_obj['distance'];
      let feature = name_obj['feature'];
      let distance_level = _this.distance_level[distance];



      let unit_width = feature_cell_width / 10;
      let unit_height = feature_cell_height / 10;
      let _x = _margin + (5- (distance_level + 1)) * unit_width ;
      let _y = _margin + (5- (distance_level + 1)) * unit_height ;
      let _w =  ((distance_level + 1)) * unit_width * 2;
      let _h = ((distance_level + 1)) * unit_height * 2;

      let boundary_color = 'white';
      let _rect_out = _container.append('rect')
        .attr('x', _x).attr('y', _y).attr('rx', 2).attr('ry', 2)
        .attr('fill', "rgb(228, 177, 146)").attr('width', _w).attr('height', _h)
        .append('title').text(_id=>_this.id_map[_id].id)


      // let _x2 = _margin + (4- (distance_level)) * unit_width ;
      // let _y2 = _margin + (4- (distance_level)) * unit_height ;
      let _x2 = _margin + (5- (distance_level)) * unit_width ;
      let _y2 = _margin + (5- (distance_level)) * unit_height ;

      let _w2 =  ((distance_level)) * unit_width * 2;
      let _h2 = ((distance_level)) * unit_height * 2;
      let _rect_in = _container.append('rect')
        .attr('x', _x2).attr('y', _y2)
        .attr('fill', boundary_color)
        .attr('rx', 2).attr('ry', 2)
        .attr('width', _w2).attr('height', _h2)
        .append('title').text(_id=>_this.id_map[_id].id)

      // outliner boundary
      let _outline_rect = _container.append('rect')
        .attr('class', 'feature_cell_outline')
        .attr('x', _margin).attr('y', _margin)
        .attr('width', feature_cell_width)
        .attr('height', feature_cell_height)
        .attr('rx', 2)
        .attr('ry', 2)
        // .attr('fill', 'none')
        .attr('fill', _this.feature_color(feature))
        .attr('fill-opacity',0.4)
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
        });

      _outline_rect.append('title').text(_id=>_this.id_map[_id].id);

      if(direction == -1){
        return
      }
      let direction_pi = Math.PI / 4 * _this.directions[direction];

      let center_x =_margin + feature_cell_width / 2;
      let center_y = _margin + feature_cell_height / 2;
      let radius = Math.sqrt(feature_cell_height * feature_cell_height  + feature_cell_width * feature_cell_width) / 3;



      _container.append("line")
        .style("stroke", _this.feature_color(feature))
        .attr('stroke-width', 1.5)
        .attr("x1", center_x)
        .attr("y1",center_y)
        .attr("x2", _=>{
          return center_x + radius * Math.cos(direction_pi)
        })
        .attr("y2", center_y + radius * Math.sin(direction_pi))


    });



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
    d['render']['order'] = i+1;
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
    .attr('class', 'selected_feature_outline')
    .attr('x', margin_x)
    .attr('y', margin_y)
    .attr('width', d=> d.render.width - 2 * margin_x)
    .attr('height', d=>d.render.height - 2 * margin_y).attr('fill', 'none').attr('fill-opacity', 0.2)
    .attr('stroke', 'grey').style("stroke-dasharray", "10,4").attr('stroke-opacity', 0.5)
    .attr('stroke-width', 1.5);

  // order on selected feature linechart
  d3.selectAll('.selected_feature_order').remove();
  d3.selectAll('.selected_feature').append('text')
    .attr('class', 'selected_feature_order')
    .text(function(d){
      return d.render.order + ' ' + d.id;
    })
    .attr('x', margin_x)
    .attr('y', margin_y)
    .attr('dy', '1em')
    .attr('fill', 'black')
    .attr('font-size', '8px')
    .attr('opacity', '0.8')

  // order on feature glyph
  d3.selectAll('.glyph_order').remove()
  d3.selectAll('.selected_feature').each(function(d){
    d3.selectAll('.feature_cell').each(function(i){
      if(i == d.id){
        d3.select(this).append('text')
          .attr('class', 'glyph_order')
          .text(d.render.order)
          .attr('x', 4)
          .attr('y', 2)
          .attr('dy', '1em')
          .attr('fill', 'black')
          .attr('font-size', '8px')
          .attr('opacity', '0.8');
      }
    })

  })
  //------------------------------------------


  //---------------------------------------------------------------

  let cell_x = d3.scaleLinear().range([margin_x, select_cell_width - margin_x])


  let cell_y = d3.scaleLinear().range([select_cell_height - margin_y, margin_y])



  new_container.each(function(d){
    cell_x.domain([0, d['kde_point'].length]);
    cell_y.domain([0,  d3.max(d['kde_point'])]);
    let name_obj = _this.parse_feature_name(d['id']);
    let direction = name_obj['direction'];
    let distance = name_obj['distance'];
    let feature = name_obj['feature'];
    let line = d3.line()
      .x((d, i) => { return cell_x(i); })
      .y((d, i) => { return cell_y(d); });
    if(d == undefined || d == null || d['kde_point'] == undefined) return;

    d3.select(this).append('path')
      .datum(d['kde_point'])
      .attr("fill", "none")
      .attr("opacity", ".8")
      .attr("stroke", _this.feature_color(feature))
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
    .attr('class', 'top_unit_outline')
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

  // unit_id on top unit plots
  d3.selectAll('.id_top_units').remove()
  d3.selectAll('.top_units').append('text')
    .attr('class', 'id_top_units')
    .text(function(d){
      return d.id
    })
    .attr('x', 2)
    .attr('y', 2)
    .attr('dy', '1em')
    .attr('fill', 'black')
    .attr('opacity', '0.8')
    .attr('font-size', '10px');


  d3.selectAll('.id_units').remove()
  merged_units.forEach(function(d){
    d3.selectAll('.unit_cell').each(function(i){
      if(d.id == i){
        d3.select(this).append('text')
          .attr('class', 'id_units')
          .text(function(i){
            return i
          })
          .attr('x', 2)
          .attr('y', 2)
          .attr('dy', '1em')
          .attr('font-size', '8px')
          .attr('opacity', '0.8')
      }
    })
  });
};


DistributionMatrix.prototype.draw_linkage = function(){
  let _this = this;

  let linkages = [];

  this.cluster_groups.forEach(function(d){
    let source = {x: d.u_render.x, y: d.u_render.y + d.u_render.height / 2};
    let target = {x: d.f_render.x + _this.link_region_width, y: d.f_render.y + d.f_render.height / 2};
    linkages.push({
      'source':source,
      'target':target,
      'type': true
    })
  });


  linkages = [];

  this.cluster_weights.forEach((weight)=>{
    let uc_id = weight['uc_id'];
    let fc_id = weight['fc_id'];
    let s_cluster  = this.cluster_groups[uc_id];
    let t_cluster = this.cluster_groups[fc_id];

    let source = {"uc_id": uc_id, x: s_cluster.u_render.x, y: s_cluster.u_render.y + s_cluster.u_render.height / 2};
    let target = {"fc_id": fc_id, x: t_cluster.f_render.x + _this.link_region_width, y: t_cluster.f_render.y + t_cluster.f_render.height / 2};

    linkages.push({
      'source':source,
      'target':target,
      'weight':weight['mean_ks'],
      'type': true
    })
  });

  linkages.sort((a, b) => (a.source.uc_id > b.source.uc_id) ? 1 : -1);

  let sub_linkages = [];
  linkages.forEach(function(link_obj){
    if(link_obj['weight'] > 0.12 || (link_obj['target']['fc_id'] == link_obj['source']['uc_id'])){
      sub_linkages.push(link_obj);
    }
  });
  console.log('links, links, ', linkages);
  let link = d3.linkHorizontal()
    .x(function(d){return d.x})
    .y(function(d){return d.y});


  this.link_region_container.selectAll('.link').data(sub_linkages).enter().append('path').attr('class', 'link')
    .style("stroke", "grey")
    .attr('d', link)
    .attr('fill', 'none')
    .attr('stroke-width', function(d){
      let weight = d['weight'];
      if( weight >= 0 && weight < 0.1){
        // 1-3
        return weight * 20 + 1;
      }else if(weight >= 0.1 && weight < 0.2){
        // 3-5
        return weight * 20 + 1;
      }else if(weight >= 0.2 && weight <= 0.3){
        // 5-10
        return weight * 50 - 5;
      }
    })
    .attr('stroke-opacity', 0.2)
  

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
