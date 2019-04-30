<template>
  <div></div>
</template>

<script>
  import * as echarts from 'echarts/dist/echarts.js';
  import pipeService from '../../service/pipeService'

  export default {
    name: "Scatter",
    props: ['scatter',"selected_sequence", 'colors'],
    data() {
      return {
        scatter_data: null,
        selected_timestamps: null,
        option: null,
        // colors: ['#4BA453', '#239FFC', '#CE373E',  '#9B4EE2', '#996F4A',  '#2C922D', '#FDB150', '#326598']
      }
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
          objs.push(_this.scatter_data[index]);
          let _tid = _this.scatter_data[index][4];
          if(time_map[_tid] == undefined){
            seq_ids.push(_tid);
            time_map[_tid] = 1;
          }



        });

        // seq_ids
        // seq_ids  = [1514736000, 1514858400, 1514764800, 1514782800, 1514815200, 1514836800];
        // seq_ids  = [1514736000, 1514858400];

        pipeService.emitSequenceSelected({
          'seq_ids': seq_ids,
          'selected_timestamps': _this.selected_timestamps,
          'colors': _this.colors
        });
        console.log('sequencssss', seq_ids, _this.selected_timestamps)
      }
    },
    watch:{
      scatter_data:function(new_val, old_val) {
        let _this = this;
        if(!new_val) return;

        if(this.myChart) this.myChart.dispose();

        this.myChart = echarts.init(this.$el);
        this.option.series[0]['data'] = new_val;
        this.myChart.setOption(this.option);
        this.myChart.on('click', function(params){
          console.log('click', params);
        });

        _this.myChart.on('brushselected', function(params){
          if (_this.x) clearTimeout(_this.x);
          _this.x = setTimeout(function(){
            _this.handleSelected(params)
          }, 800);
        });
      }
    },

    mounted: function(){
      let _this = this;
      pipeService.onSelectedScatterPlot(function(d){
        _this.scatter_data = d['data'];
        _this.selected_timestamps = d['selected_timestamps'];
      });

      let colors = this.colors;

      let  option = {
        xAxis: {},
        yAxis: {},
        brush: {
          // outOfBrush: {
          //   color: '#fdf8ff'
          // },
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
        grid:{
          top: 30,
          bottom: 50,
          right: 30
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
          symbolSize: 4,
          data: [],
          type: 'scatter',
          itemStyle: {
            normal: {
              color: function (param) {
                return colors[param['data'][2]];
              },
              opacity: 0.5,
            }
          },
        }],

      };
      this.option = option;


    },
  }



</script>

<style scoped>

</style>
