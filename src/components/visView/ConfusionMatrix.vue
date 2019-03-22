<template>
  <!--<svg class = 'vis_container'></svg>-->
  <div> </div>
</template>

<script>

  import * as echarts from 'echarts/dist/echarts.js';

  export default {
    name: "ConfusionMatrix",
    props:["trend_data"],
    watch:{
      trend_data:function(new_val, old_val){

        if(!new_val){
          return
        }

        // console.log('new_val', new_val);
        let values = [];
        for(let i = 0, ilen = new_val.length; i < ilen; i++){
          let item = new_val[i];
          values.push([item['Pre_PM25'],item['PM25']])
        }

        let option = {
          xAxis: {
            scale: true,
            name:"Prediction"
          },
          yAxis: {
            scale: true,
            name:"Groundtruth"
          },
          grid:{
            top: 50,
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

            },
            {
              type: 'inside',
              yAxisIndex: [0],

            }
          ],
          series: [{
            symbolSize: 2,
            data: values,
            type: 'scatter'
          }]
        };


        this.myChart.setOption(option);


      }
    },

    mounted: function(){
      this.myChart = echarts.init(this.$el);

    }
  }
</script>

<style scoped>

</style>
