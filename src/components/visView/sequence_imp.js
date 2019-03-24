import * as d3 from "d3";

let Sequence = function(el){
  let _this = this;
  this.$el = el;

  this.canvas_width = this.$el.clientWidth;
  this.canvas_height = this.$el.clientHeight;

  this.sequence_margin = 2;
  this.cell_margin = 10;
  this.cell_margin_y = 25;

};



Sequence.prototype.update_sequence_render = function(data){
  let _this = this;
  console.log('update sequence cluster', data);
  this.seq_n = data.cluster_io_list.length;
  this.seq_n = 7;
  this.seq_gap = 10;
  this.timestamp_n = data['cluster_io_list'][0][0].length;
  // this.timestamp_n = 10;
  this.seq_height = this.canvas_height / this.seq_n - this.seq_gap;
  this.timetsamp_width = this.canvas_width / this.timestamp_n;
  let gradient_io_ratio = 0.4;
  this.timestamp_ids = [];
  for(let i = 0, ilen = this.timestamp_n; i < ilen; i++){
    this.timestamp_ids.push(i);
  }
  // Init render


  let sequence_renders = [];

  this.seq_height = this.canvas_height / this.seq_n;
  for(let i = 0, ilen = data.cluster_gradient_list.length; i< ilen; i++){
    let render = {
      'x':0, 'y': this.seq_height * i,
      'height': this.seq_height - this.seq_gap, 'width': this.canvas_width,
      'io': data.cluster_io_list[i],
      'gradient': data.cluster_gradient_list[i]
    };
    sequence_renders.push(render);
  }


  // Svg => container => sequence(element)
  let container = d3.select(this.$el).append('g')
    .attr('class', 'container');

  let sequence_containers = container.selectAll('.sequence')
    .data(sequence_renders)
    .enter()
    .append('g')
    .attr('class', 'sequence')
    .attr('transform', (d,i)=>'translate(' + d.x + ',' + (d.y) + ')');


  sequence_containers.each(function(d, i){

    let mean_io_seq = [];
    for(let i = 0; i < _this.timestamp_n; i++){
      let timestamp_seq = [];
      for(let c_i = 0; c_i < d['io'].length; c_i++){
        timestamp_seq.push(d['io'][c_i][i][3])
      }
      mean_io_seq.push(timestamp_seq)
    }

    console.log('rr', d);
    console.log('rrr', mean_io_seq);

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

    console.log('ttt', gradient_seq);

    let _container = d3.select(this);
    _container.append('rect')
      .attr('width', d.width).attr('height', d.height).attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 1);

    let timestamp_containers = _container.selectAll('.timestamp_containers')
      .data(_this.timestamp_ids).enter()
      .append('g').attr('class', 'timestamp_containers')
      .attr('transform', (_,i)=>'translate(' + (_this.timetsamp_width * i) + ',' + (0) + ')');


    // ---------------------------------------------------------------------------------------------------------------------------------------- start
    // Render the output of hidden states
    let io_cell_width = (_this.timetsamp_width) * (1 - gradient_io_ratio);

    let ioContainer = timestamp_containers.append('g').attr('transform', (d,i)=>'translate(' + (_this.timetsamp_width * gradient_io_ratio) + ',' + (0) + ')');
    ioContainer.append('rect')
      .attr('width', io_cell_width)
      .attr('height', d.height)
      .attr('fill', 'none').attr('stroke', 'blue').attr('stroke-width', 0.5);
    ioContainer.each(function(t_id){
      let state_io = mean_io_seq[t_id];
      // console.log('state_io', state_io); len 15的activation
      let unit_height = d.height / state_io.length;
      let max_mean = 0.5;
      let _bar_container = d3.select(this);
      _bar_container.selectAll('.unit_cluster_bar')
        .data(state_io).enter().append('rect').attr('class', 'unit_cluster_bar')
        .attr('y', (m_val,j)=> j * unit_height)
        .attr('height', unit_height)
        .attr('width',(m_val)=>m_val / max_mean * io_cell_width )
        .attr('fill', 'grey').attr('stroke', 'white').attr('stroke-width', 1);
    });

    // ----------------------------------------------------------------------------------------------------------------------------------------- end




    let gradient_cell_width = (_this.timetsamp_width) * gradient_io_ratio
    let gradientContainer = timestamp_containers.append('g');

    gradientContainer.each(function(t_id){
      let gradient = gradient_seq[t_id]
      let _container = d3.select(this);

      // ------------------------------- rect
      _container.append('rect')
        .attr('width', gradient_cell_width)
        .attr('height', d.height)
        .attr('fill', 'none').attr('stroke', 'orange').attr('stroke-width', 0.5);

      // ------------------------------- end
      let linkages = [];
      let unit_height = d.height / gradient.length;
      for(let o_i = 0; o_i < gradient.length; o_i++){
        for(let i_i = 0; i_i < gradient[o_i].length; i_i++){
          linkages.push({
            'o': o_i,
            'i': i_i,
            'v': gradient[o_i][i_i],
            'source':{x: 0, y: o_i * unit_height + 0.5 * unit_height},
            'target':{x: gradient_cell_width, y: i_i * unit_height + 0.5 * unit_height}
          })
        }
      }

      linkages.sort((a, b) => (a.v > b.v) ? -1 : 1);
      let top_linkages = linkages.slice(0, 30);
      console.log('linkages', linkages);
      console.log('slice linkages', top_linkages);

      let link = d3.linkHorizontal()
        .x(function(d){return d.x})
        .y(function(d){return d.y});

      _container.selectAll('.link').data(top_linkages).enter().append('path').attr('class', 'link')
        .style("stroke", "grey")
        .attr('d', link)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.3)

    });



  })
};

Sequence.prototype.update_features_render = function(data){
};

export default Sequence
