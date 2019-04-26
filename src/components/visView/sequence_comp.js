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
  let cluster_io_list = data['cluster_io_list'];
  let cluster_gradient_list = data['feature_cluster_gradient_list'];
  this.cluster_io_list = cluster_io_list;
  this.cluster_gradient_list = cluster_gradient_list;
  console.log('unit_gradient', data['unit_cluster_gradient_list']);
  console.log("feature_gradient", data['feature_cluster_gradient_list'])
  let seq_n = cluster_io_list.length;

  if(seq_n ==0 || seq_n == undefined)
    return null;
  let u_c_n = cluster_io_list[0].length;
  let timestamp_n = cluster_io_list[0][0].length;
  this.timestamp_n = timestamp_n;
  console.log('data', data);
  console.log('seq_n', seq_n);
  console.log('u_c_n', u_c_n);
  console.log('timestamp_n', timestamp_n);

  // let cluster_column_ids = [0,1,2,3,4,5,6,7,8,9,10,11];
  // let cluster_row_ids = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
  let cluster_column_ids = [];
  let cluster_row_ids = [];

  data['unit_cluster_gradient_list'][0][0].forEach((d,i)=>{
    cluster_column_ids.push(i)
  });

  data['feature_cluster_gradient_list'][0][0].forEach((d,i)=>{
    cluster_row_ids.push(i)
  });
  this.init_render(cluster_column_ids, cluster_row_ids)
};

Sequence.prototype.init_render = function(cluster_column_ids, cluster_row_ids){
  // cluster_column_ids: target_ids, cluster_row_ids: source_ids
  let _this = this;
  let top_margin = 2;
  let left_margin = 10;
  let right_margin = 10;
  let container_width = this.canvas_width - left_margin - right_margin;

  container_width = container_width / 2;
  let chart_cell_width = container_width / cluster_column_ids.length;

  let io_height = 50;

  let io_width = container_width;

  let gradient_width = io_width;
  let gradient_height = chart_cell_width;
  d3.select(this.$el).selectAll('.container').remove();
  let root_container = d3.select(this.$el).append('g').attr('class', 'container')
    .attr('transform', 'translate('+ left_margin + ',' + top_margin + ')');


  let io_chart_container = root_container.append('g');
  // io_chart_contaienr.append('rect')
  //   .attr('width', io_width).attr('height', io_height).attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 1);
  let io_charts = io_chart_container.selectAll('.io_charts')
    .data(cluster_column_ids)
    .enter().append('g').attr('class', 'io_charts').attr('transform', (d, i) =>  'translate('+ (i *chart_cell_width)  + ',' + top_margin + ')');

  io_charts.append('rect').attr('width', chart_cell_width).attr('height', io_height).attr('fill', 'none').attr('stroke', 'green').attr('stroke-width', 0.5);


  let x = d3.scaleLinear()
    .domain([0, this.timestamp_n])
    .range([0, chart_cell_width])
    .clamp(true);

  let y = d3.scaleLinear()
    .domain([0, 0.8])
    .range([io_height, 0])

  let link = d3.line()
    .x(function(d, i){
      return x(i)})
    .y(function(d){return y(d[3])});

  io_charts.each(function(cluster_id){
    let _chart_container = d3.select(this);
    let io_links_data = [];
    _this.cluster_io_list.forEach((cluster_io, i)=>{
      io_links_data.push(cluster_io[cluster_id]);
    });

    _chart_container.selectAll('.link').data(io_links_data).enter().append('path').attr('class', 'link')
      .style("stroke", "grey")
      .attr('d', link)
      .attr('fill', 'none');
  });

  //----------------------------------------------------------------------------
  let gradient_margin_top = 10;
  let gradient_cell_height = chart_cell_width;
  let gradient_cell_width = chart_cell_width;

  let gradient_chart_container = root_container.append('g').attr('class', 'gradient_chart_container').attr('transform', 'translate('+ 0 + ',' + (io_height + gradient_margin_top)  + ')');
  let gradient_charts = gradient_chart_container.selectAll('.row_gradient_chart')
    .data(cluster_row_ids)
    .enter().append('g').attr('class', 'row_gradient_chart')
    .attr('transform', (d, i) => {
      return 'translate('+ 0 + ',' + (gradient_height * i + gradient_margin_top)  + ')'
    });

  gradient_charts.append('rect').attr('width', gradient_width).attr('height', gradient_height)
    .attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 1)



  let gx = d3.scaleLinear()
    .domain([0, this.timestamp_n])
    .range([0, gradient_cell_width])
    .clamp(true);

  let gy = d3.scaleLinear()
    .domain([0, 0.2])
    .range([gradient_cell_height, 0]);

  let glink = d3.line()
    .x(function(d, i){
      return gx(i)})
    .y(function(d){return gy(d)});

  console.log('cluster_gradient_list', this.cluster_gradient_list);
  gradient_charts.each(function(source_cluster_id){
    let _gradient_container = d3.select(this);
    let gradient_chart_cell = _gradient_container.selectAll('.gradient_chart')
      .data(cluster_column_ids).enter().append('g').attr('class', 'gradient_chart')
      .attr('transform', (d, i)=> 'translate(' +(i * gradient_cell_width)+',' + 0+')')

    gradient_chart_cell.append('rect')
      .attr('width', gradient_cell_width).attr('height', gradient_cell_height)
      .attr('fill', 'none').attr('stroke', 'green').attr('stroke-width', 0.5);

    gradient_chart_cell.each(function(target_cluster_id){
      let _cell_container = d3.select(this);
      let _s_t_list = [];
      _this.cluster_gradient_list.forEach((gradient)=>{
        _s_t_list.push(gradient[target_cluster_id][source_cluster_id])
      });

      _cell_container.selectAll('.link').data(_s_t_list).enter().append('path').attr('class', 'link')
        .style("stroke", "grey")
        .attr('d', glink)
        .attr('fill', 'none');
    });
    // let source_target_gradient_list = [];
    // _this.cluster_gradient_list.forEach((cluster_gradient, i)=>{
    //   //  cluster_gradient: target_id, source_id
    //   let row_data = [];
    //   cluster_column_ids.forEach((target_cluster_id)=>{
    //     row_data.push(cluster_gradient[target_cluster_id, source_cluster_id])
    //   });
    //   source_target_gradient_list.push(row_data)
    // });

    // _gradient_container.selectAll('')


    // source_target_gradient_list.forEach(())
    // _gradient_container.selectAll('.gradient_chart_container').data(source_target)
    // console.log('dd', source_target_gradient_list);
  })
};

Sequence.prototype.render_dependency = function(){

};
export default Sequence
