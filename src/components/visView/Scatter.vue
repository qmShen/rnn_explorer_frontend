<template>
  <div>123123</div>
</template>

<script>
  import * as echarts from 'echarts/dist/echarts.js';
  import pipeService from '../../service/pipeService'

  export default {
    name: "Scatter",
    props: ['scatter',"selected_sequence"],
    data() {
      return {
        scatter_data: null,

      }
    },
    watch:{

      scatter_data:function(new_val, old_val) {
        let colors = ['red', 'blue'];

        let  option = {
          xAxis: {},
          yAxis: {},
          brush: {
            outOfBrush: {
              color: '#abc'
            },
            brushStyle: {
              borderWidth: 2,
              color: 'rgba(0,0,0,0.2)',
              borderColor: 'rgba(0,0,0,0.5)',
            },
            // seriesIndex: [0, 1],
            throttleType: 'debounce',
            throttleDelay: 300,
            geoIndex: 0
          }

          ,
          dataZoom: [
            // {
            //   type: 'slider',
            //   show: true,
            //   xAxisIndex: [0],
            //   start: 1,
            //   end: 35
            // },
            // {
            //   type: 'slider',
            //   show: true,
            //   yAxisIndex: [0],
            //   left: '93%',
            //   start: 29,
            //   end: 36
            // },
            {
              type: 'inside',
              xAxisIndex: [0],
              start: 1,
              end: 35
            },
            {
              type: 'inside',
              yAxisIndex: [0],
              start: 1,
              end: 35
            }
          ],

          series: [{
            symbolSize: 5,
            data: new_val,
            type: 'scatter',
            itemStyle: {
              normal: {
                color: function (param) {
                  return colors[param['data'][2]];
                }
              }
            },
          }],

        };
        this.myChart.setOption(option);

      }
    },
    mounted: function(){
      let _this = this;
      pipeService.onSelectedScatterPlot(function(d){

        _this.scatter_data = d;
      });


      this.myChart = echarts.init(this.$el);

      this.myChart.on('click', function(params){
        console.log('click', params);
      });
      this.myChart.on('brushselected', function(params){
        let dataIndex = params.batch[0].selected[0]['dataIndex'];
        console.log('brushed', dataIndex);
        let objs = [];
        let seq_ids = [];
        dataIndex.forEach(function(index){
          objs.push(_this.scatter_data[index]);
          seq_ids.push(_this.scatter_data[index][4]);
        });
        // _this.selected_sequence = seq_ids;
        pipeService.emitSequenceSelected(seq_ids);
      });
    },
  }



</script>

<style scoped>

</style>
