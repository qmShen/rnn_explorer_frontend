import * as d3 from "d3";

let Sequence = function(el){
  let _this = this;
  this.$el = el;

  this.canvas_width = this.$el.clientWidth;
  this.canvas_height = this.$el.clientHeight;
  this.canvas_height = 550;
  this.sequence_margin = 2;
  this.cell_margin = 10;
  this.cell_margin_y = 25;
  console.log('height', this.canvas_height);
};



Sequence.prototype.update_sequence_render = function(data){
  let _this = this;
  console.log('update sequence cluster', data);
  this.seq_n = data.cluster_io_list.length;
  this.seq_n = 5;
  this.seq_gap = 20;
  if(data['cluster_io_list'].length == 0){
    return
  }
  let time_list = data['sequence_time'];
  let sort_time_obj_list = [];
  time_list.forEach(function(t, i){sort_time_obj_list.push({'t':parseInt(t), 'i': i})});
  sort_time_obj_list.sort((a, b) => (a.t > b.t) ? 1 : -1);

  this.timestamp_n = data['cluster_io_list'][0][0].length;
  // this.timestamp_n = 10;
  this.seq_height = this.canvas_height / this.seq_n - this.seq_gap;
  this.timetsamp_width = this.canvas_width / this.timestamp_n;
  let gradient_io_ratio = 0.4;

  //red colors

  this.colors = data['colors'];
  // Generate sequence map
  let selected_time_stamps = data['selected_timestamp'];
  _this.sequence_time_map = {};

  let all_selected_records = [];
  selected_time_stamps.forEach((selected_records, class_id)=> {
    selected_records.forEach((record)=>{
      record.push(class_id);
      all_selected_records.push(record);
    })
  });

  let start_time = new Date();
  for(let i =0 ,ilen = all_selected_records.length; i < ilen; i++){
    let seq_record = all_selected_records[i];
    let sequence_time = seq_record[1];
    if(_this.sequence_time_map[sequence_time] == undefined) _this.sequence_time_map[sequence_time] = {};
    for(let j = 0, jlen = all_selected_records.length; j < jlen; j++){
      let unit_record = all_selected_records[j];
      let unit_time = unit_record[0];
      let class_id = unit_record[3];
      if(Math.abs(sequence_time - unit_time) < 22 * 3600){
        if(_this.sequence_time_map[sequence_time][unit_time] == undefined){
          _this.sequence_time_map[sequence_time][unit_time] = {'unit_time': unit_time, 'sequence_time':sequence_time, 'class_ids':[class_id]}
        }else{
          _this.sequence_time_map[sequence_time][unit_time]['class_ids'].push(class_id);
        }
      }
    }
  }
  console.log('date', new Date() - start_time);

  // for(let sequence_time in _this.sequence_time_map){
  //   _this.sequence_time_map[sequence_time] = Object.values(_this.sequence_time_map[sequence_time]);
  // }

  // Generate sequence map ------ Finished!
  this.timestamp_ids = [];
  for(let i = 0, ilen = this.timestamp_n; i < ilen; i++){
    this.timestamp_ids.push(i);
  }
  // Init render


  let sequence_renders = [];

  this.seq_height = this.canvas_height / this.seq_n;
  if(data.cluster_io_list.length > this.seq_n){
    console.log('123', data.cluster_io_list.length);
    d3.select(this.$el).attr('height', data.cluster_io_list.length / 7 *  this.canvas_height);
  }

  for(let i = 0, ilen = sort_time_obj_list.length; i < ilen; i++){
    let _index = sort_time_obj_list[i]['i'];
    let render = {
      'x':0, 'y': this.seq_height * i,
      'height': this.seq_height - this.seq_gap, 'width': this.canvas_width,
      'io': data.cluster_io_list[_index],
      'gradient': data.cluster_gradient_list[_index],
      'sequence_time': time_list[_index]
    };
    sequence_renders.push(render);
  }


  // Svg => container => sequence(element)

  d3.select(this.$el).selectAll('.container').remove();
  let container = d3.select(this.$el).append('g')
    .attr('class', 'container');

  let sequence_containers = container.selectAll('.sequence')
    .data(sequence_renders)
    .enter()
    .append('g')
    .attr('class', 'sequence')
    .attr('transform', (d,i)=>'translate(' + d.x + ',' + (d.y) + ')');


  sequence_containers.each(function(d, time_index){
    let sequence_time = d['sequence_time'];
    let unit_times = [];
    let selected_timestamp_obj = _this.sequence_time_map[sequence_time];
    if(selected_timestamp_obj == undefined){
      console.log('error')
    }



    for(let i = 0, ilen = 23; i<ilen; i++){
      unit_times.push(sequence_time - (23 - 1 -  i) * 3600 );
    }


    let mean_io_seq = [];
    for(let i = 0; i < _this.timestamp_n; i++){
      let timestamp_seq = [];
      for(let c_i = 0; c_i < d['io'].length; c_i++){
        timestamp_seq.push(d['io'][c_i][i][3])
      }
      mean_io_seq.push(timestamp_seq)
    }
    let difference_io_seq = [];

    for(let i = 0; i < mean_io_seq.length; i++){

      let current_stamp = mean_io_seq[i];
      let current_dif = [];
      if(i ==0){
        for(let j = 0, jlen = mean_io_seq[i].length; j < jlen; j++){
          current_dif.push(mean_io_seq[i][j])
        }
      }else{
        for(let j = 0, jlen = mean_io_seq[i].length; j < jlen; j++){
          current_dif.push(mean_io_seq[i][j] - mean_io_seq[i-1][j])
        }
      }
      difference_io_seq.push(current_dif);
    }
    console.log('current ', difference_io_seq);

    let gradient_seq = [];
    for(let i = 0; i < _this.timestamp_n;i ++){
      let timestamp_seq = [];
      for(let out_i = 0; out_i < d['gradient'].length; out_i++){
        let out_gradient = [];
        for(let in_i = 0; in_i <  d['gradient'][out_i].length; in_i++){
          let gradient_oi =  d['gradient'][out_i][in_i][i];
          out_gradient.push(gradient_oi);
        }
        timestamp_seq.push(out_gradient)
      }
      gradient_seq.push(timestamp_seq);
    }


    let _container = d3.select(this);

    // _container.append('rect')
    //   .attr('width', d.width).attr('height', d.height).attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 1);

    let timestamp_containers = _container.selectAll('.timestamp_containers')
      .data(_this.timestamp_ids).enter()
      .append('g').attr('class', 'timestamp_containers')
      .attr('transform', (_,i)=>'translate(' + (_this.timetsamp_width * i) + ',' + (0) + ')');


    // ---------------------------------------------------------------------------------------------------------------------------------------- start
    // Render the output of hidden states
    let io_cell_width = (_this.timetsamp_width) * (1 - gradient_io_ratio);

    let ioContainer = timestamp_containers.append('g').attr('transform', (d,i)=>'translate(' + (_this.timetsamp_width * gradient_io_ratio) + ',' + (0) + ')');


    console.log('mean_io_seq', mean_io_seq);


    ioContainer.each(function(t_id){
      let state_io = mean_io_seq[t_id];

      let unit_height = d.height / state_io.length;
      let max_mean = 0.7;
      let _bar_container = d3.select(this);
      _bar_container.selectAll('.unit_cluster_bar')
        .data(state_io).enter().append('rect').attr('class', 'unit_cluster_bar')
        .attr('y', (m_val,j)=> j * unit_height)
        .attr('height', unit_height)
        .attr('width',(m_val)=>m_val / max_mean * io_cell_width )
        .attr('fill', 'grey').attr('stroke', 'white').attr('stroke-width', 0.2);
    });

    // ----------------------------------------------------------------------------------------------------------------------------------------- end

    let gradient_cell_width = (_this.timetsamp_width) * gradient_io_ratio
    let gradientContainer = timestamp_containers.append('g');

    gradientContainer.each(function(t_id){
      if(t_id == 0){
        return
      }
      let gradient = gradient_seq[t_id];
      let state_io = mean_io_seq[t_id];

      let _container = d3.select(this);

      // ------------------------------- rect
      // _container.append('rect')
      //   .attr('width', gradient_cell_width)
      //   .attr('height', d.height)
      //   .attr('fill', 'none').attr('stroke', 'orange').attr('stroke-width', 0.5);

      // ------------------------------- end
      let linkages = [];
      let unit_height = d.height / gradient.length;
      for(let o_i = 0; o_i < gradient.length; o_i++){
        for(let i_i = 0; i_i < gradient[o_i].length; i_i++){
          linkages.push({
            'o': o_i,
            'i': i_i,
            'v': gradient[o_i][i_i],
            'source':{x: 0, y: i_i * unit_height + 0.5 * unit_height},
            'target':{x: gradient_cell_width, y: o_i * unit_height + 0.5 * unit_height}
          })
        }
      }

      linkages.sort((a, b) => (a.v > b.v) ? -1 : 1);
      let top_linkages = linkages.slice(0, 30);
      top_linkages = [];

      linkages.forEach(d=>{
        if(d['v'] > 0.075){
          top_linkages.push(d)
        }
      });


      let link = d3.linkHorizontal()
        .x(function(d){return d.x})
        .y(function(d){return d.y});

      _container.selectAll('.link').data(top_linkages).enter().append('path').attr('class', 'link')
        .style("stroke", "grey")
        .attr('d', link)
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.5)

    });

    // _container.append('rect')
    //   .attr('width', d.width).attr('height', d.height).attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 1);

    timestamp_containers.append('rect')
      .attr('width', _this.timetsamp_width)
      .attr('height', d.height)
      .attr('fill-opacity', 0.05)
      .attr('fill', (io, i)=>{
        let _u_t = unit_times[i];
        if(!selected_timestamp_obj) return 'white'
        if(selected_timestamp_obj[_u_t] == undefined){
          return 'white'
        }else{
          let class_id = selected_timestamp_obj[_u_t]['class_ids'][0];
          return _this.colors[parseInt(class_id)]
        }
      })
      .attr('stroke', (io, i)=>{
        let _u_t = unit_times[i];
        if(!selected_timestamp_obj) return 'grey'
        if(selected_timestamp_obj[_u_t] == undefined){
          return 'grey'
        }else{
          let class_id = selected_timestamp_obj[_u_t]['class_ids'][0];
          return _this.colors[parseInt(class_id)]
        }
      })
      .attr('stroke-width', (io, i)=>{

        let _u_t = unit_times[i];
        if(!selected_timestamp_obj) return 0.5
        if(selected_timestamp_obj[_u_t] == undefined){
          return 0.5
        }else{
          return 1.5
        }
      })


    let text = _container.append('text').text(sort_time_obj_list[time_index]['t']).attr('font-size', 10).attr('y', 10)

    var bbox = text.node().getBBox();
    var padding = 2;
    var rect = _container.insert("rect", "text")
      .attr("x", bbox.x - padding)
      .attr("y", bbox.y - padding)
      .attr("width", bbox.width + (padding*2))
      .attr("height", bbox.height + (padding*2))
      .style("fill", "white");
  })
};

Sequence.prototype.update_features_render = function(data){
};

export default Sequence
