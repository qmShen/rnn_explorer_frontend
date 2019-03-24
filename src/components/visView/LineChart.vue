<template>
  <svg></svg>
</template>

<script>

  import BrushLineChart from './linechart.js'

  export default {
    name: "LineChart",
    props:['trend_data'],
    mounted:function(){
      this.LineChart = new BrushLineChart(this.$el);
    },
    watch:{
      trend_data: function(new_data, d2){
        if(new_data != null){
          this.update_line_chart(new_data)
        }

      }
    },
    methods:{
      update_line_chart(data){
        // CCC
        // this.LineChart.update_render(data)
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
