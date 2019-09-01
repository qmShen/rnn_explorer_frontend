<template>
  <svg></svg>
</template>

<script>

  import BrushLineChart from './linechart.js'
  import pipeService from '../../service/pipeService.js'
  export default {
    name: "LineChart",
    props:['trend_data'],
    mounted:function(){
      this.LineChart = new BrushLineChart(this.$el);
      this.LineChart.update_render(this.trend_data);
      this.LineChart.setInteraction('brush_select', this.select_time_range);
    },
    watch:{
      trend_data: function(new_data, d2){
        if(new_data != null){
          this.LineChart.setInteraction('brush_select', this.select_time_range);
          this.update_line_chart(new_data)
        }
      }
    },
    methods:{
      update_line_chart(data){
        // CCC
        this.LineChart.update_render(data);
      },
      select_time_range(start, end){

        pipeService.emitTimeRangeSelected({
          'start': start,
          'end': end
        })
      }
    }
  }
</script>


<style scoped>
  /*svg{*/
  /*height: 100%;*/
  /*width: 100%*/
  /*}*/
  .line {

  }
  .zoom {
    cursor: move;
    fill: none;
    pointer-events: all;
  }
</style>
