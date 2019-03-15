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
  console.log('update sequence data', data);
  let data_length = data.input_output_list.length;


  // Init render

  // Svg => container => sequence(element)
  let container = d3.select(this.$el).append('g')
    .attr('class', 'container');
  this.seq_n = data.input_output_list.length;
  this.seq_n = 7;
  this.seq_height = this.canvas_height / this.seq_n;

  let sequence_container = container.selectAll('.sequence')
    .data(data.input_output_list)
    .enter()
    .append('g')
    .attr('class', 'sequence')
    .attr('transform', (d,i)=>'translate(' + '0' + ',' + (i * this.seq_height) + ')');

  let gradient_stats_list = data['gradient_stats_list'];

  sequence_container.each(function(seqence_list, sequence_id){

    let gradient_seq = gradient_stats_list[sequence_id];

    let _container = d3.select(this);

    let cell_width = _this.canvas_width / seqence_list.length - 2 * _this.cell_margin;
    let cell_height = _this.seq_height  - 2 * _this.cell_margin;
    let back_rect = _container.append('rect')
      .attr('x', this.sequence_margin)
      .attr('y', this.sequence_margin)
      .attr('width', _this.canvas_width - 2 * _this.sequence_margin  )
      .attr('height', _this.seq_height  - 2 * _this.sequence_margin  )
      .attr('fill-opacity', 0.00)
      .attr('stroke', 'red').attr('stroke-width', 0.5)

    let cell_containers = _container
      .selectAll('.cell_container').data(seqence_list).enter().append('g').attr('class', 'cell_container')
      .attr('transform', (d, i) => 'translate(' + (i *  _this.canvas_width / seqence_list.length) + ',0)' );

    // let io_rect = cell_containers.append('rect')
    //   .attr('x', this.sequence_margin)
    //   .attr('y', this.sequence_margin)
    //   .attr('width', cell_width )
    //   .attr('height', _this.seq_height  - 2 * _this.sequence_margin  )
    //   .attr('fill-opacity', 0.00)
    //   .attr('stroke','orange')

    var YesColorScaleLegend = d3.scaleLinear()
      .domain([-1, -0.5, 0, 0.5, 1])
      .interpolate(d3.interpolateLab)
      .range(["#536be1", "#62A5CA", "#FFFFFF", "#E68A73", "#690020"]);

    // Draw units output matrix
    cell_containers.each(function(d){
      let unit_output = d.slice(-102 ,-2);
      let unit_cell_container = d3.select(this).append('g').attr('class', 'output_matrix');
      // Hard code
      unit_cell_container.selectAll('.unit_output')
        .data(unit_output).enter().append('rect')
        .attr('x', (d, i)=>parseInt(i / 10) * cell_width / 10 )
        .attr('y', (d, i)=>parseInt(i % 10) *  (_this.seq_height - 2 * _this.cell_margin_y)  / 10 + _this.cell_margin_y)
        .attr('width', cell_width  / 10)
        .attr('height',(_this.seq_height - 2 * _this.cell_margin_y)  / 10)
        .attr('stroke', 'white').attr('stroke-width', 0.1)
        .attr('fill', d=>YesColorScaleLegend(d));

    });
    //

    let gap = 10;
    let gradient_container = cell_containers.append('g').attr('class', 'gradient_container')
      .attr('transform',"translate(" + (-2 * _this.cell_margin) + ','+ _this.cell_margin_y   + ')');

    let states_sta_pre_rect = gradient_container.append('rect')
      .attr('y', gap )
      .attr('width', _this.cell_margin)
      .attr('height', _this.seq_height - 2 * _this.cell_margin_y - 2 * gap)
      .attr('fill-opacity', 0.00)
      .attr('stroke','grey').attr('stroke-opacity', 0.1)

    let feature_sta_pre_rect = gradient_container.append('rect')
      .attr('x',_this.cell_margin)
      .attr('y', gap)
      .attr('width', _this.cell_margin)
      .attr('height', _this.seq_height - 2 * _this.cell_margin_y - 2 * gap)
      .attr('fill-opacity', 0.00)
      .attr('stroke','grey').attr('stroke-opacity', 0.1);



    let y_scale = d3.scaleSqrt().domain([0, 1]).range([_this.seq_height - 2 * _this.cell_margin_y -gap, gap]);

    gradient_container.each(function(d, s_id){
      let unit_statics = gradient_seq['unit'][s_id];
      let feature_statics = gradient_seq['feature'][s_id];

      let scale_seq = ["min", "25%", "50%", "75%", "max"];
      let _container = d3.select(this).append('g').attr('class', 'scale_container');

      _container.selectAll('.unit_scale_line')
        .data(scale_seq).enter().append('line').attr('class', 'unit_scale_line')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('x1', (d, i)=> 1)
        .attr('x2', (d, i)=> _this.cell_margin)
        .attr('y1', (d, i)=> y_scale(Math.sqrt(unit_statics[d])))
        .attr('y2', (d, i)=> y_scale(Math.sqrt(unit_statics[d])))

      _container.selectAll('.feature_scale_line')
        .data(scale_seq).enter().append('line').attr('class', 'feature_scale_line')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('x1', (d, i)=> _this.cell_margin)
        .attr('x2', (d, i)=> _this.cell_margin * 2)
        .attr('y1', (d, i)=> y_scale(Math.sqrt(feature_statics[d])))
        .attr('y2', (d, i)=> y_scale(Math.sqrt(feature_statics[d])))
    })

  })
};

Sequence.prototype.update_features_render = function(data){
};

export default Sequence
