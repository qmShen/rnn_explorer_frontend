<template>
  <!--<svg class = 'vis_container'></svg>-->
  <div> </div>
</template>

<script>

  import * as echarts from 'echarts/dist/echarts.js';
  import pipeService from '../../service/pipeService.js';

  export default {
    name: "ConfusionMatrix",
    props:["trend_data"],
    data(){
      return {
        option: null
      }
    },
    watch:{
      trend_data:function(new_val, old_val){
        let _this = this;
        if(!new_val){
          return
        }

        let values = [];
        for(let i = 0, ilen = new_val.length; i < ilen; i++){
          let item = new_val[i];
          values.push([item['Pre_PM25'],item['PM25']])
        }

        this.myChart = echarts.init(this.$el);

        let option = {
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
          },
          xAxis: {
            // scale: true,
            name:"Prediction"
          },
          yAxis: {
            // scale: true,
            name:"Groundtruth"
          },
          grid:{
            top: 40,
            bottom: 30,
            right: 80
          },
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
              start: 100,
              // dataZoomIndex: 100,
              end: 0

            },
            {
              type: 'inside',
              yAxisIndex: [0],
              // dataZoomIndex: 100,
              start: 100,
              end: 0
            }
          ],
          series: [{
            symbolSize: 3,
            opacity: 0.5,
            data: values,
            type: 'scatter'
          }]
        };


        this.myChart.setOption(option);

        _this.myChart.on('brushselected', function(params){
          if (_this.x) clearTimeout(_this.x);
          _this.x = setTimeout(function(){
            _this.handleSelected(params)
          }, 800);
        });
      }
    },

    mounted: function(){


    },
    methods:{
      handleSelected(params){
        let _this = this;
        let dataIndex = params.batch[0].selected[0]['dataIndex'];
        console.log('brushed', dataIndex);
        let objs = [];
        let seq_ids = [];
        let time_map = {};
        dataIndex.forEach(function(index){
          let _tid = _this.trend_data[index]['timestamp'];
          seq_ids.push(_tid - 3600 * 3);
        });

        // seq_ids
        // seq_ids  = [1514736000, 1514858400, 1514764800, 1514782800, 1514815200, 1514836800];
        // seq_ids  = [1514736000, 1514858400];

        pipeService.emitSequenceSelected({
          'seq_ids': seq_ids,
          'selected_timestamps': [],
          'colors': []
        });
      }
    }
  }
</script>

<style scoped>

</style>
