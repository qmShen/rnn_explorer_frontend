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

Sequence.prototype.init_render = function(){
  // cluster_column_ids: target_ids, cluster_row_ids: source_ids
  this.root_container = d3.select(this.$el).append('g').attr('class', 'root_container').attr('transform', 'translate('+ 0 + ',' + 0 + ')');
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


Sequence.prototype.update_sequence_render = function(){

};

export default Sequence
