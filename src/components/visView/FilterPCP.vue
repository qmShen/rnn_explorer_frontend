<template>
  <div style="height: 100%">
  </div>
</template>

<script>
  import * as echarts from 'echarts/dist/echarts.js';

  export default {
    name: "FilterPCP",
    props:["selected_feature_values"],
    mounted:function(){
      this.myChart = echarts.init(this.$el);
      console.log('pcp mounted');
      console.log(this.$el);
    },
    watch:{
      selected_feature_values:function(new_val){
        console.log('selected_feature_values:', new_val);
        let schema = [];
        var j = 0;
        for(var i in new_val[0]){
          // console.log(i);
          schema.push({"index":j,"name":i});
          j = j+1;
        }
        console.log("schema: ", schema);

        let lineStyle = {
          normal: {
            width: 1,
            opacity: 0.5
          }
        };

        let Axis = [];
        for(var i=0;i<schema.length;i++){
          Axis.push({"dim":i, "name":schema[i].name});
        }
        console.log("Axis: ", Axis);

        let data = [];
        for(var i=0;i<new_val.length;i++){
          var sample = [];
          for(var j in new_val[i]){
            sample.push(new_val[i][j]);
          }
          data.push(sample);
        }
        console.log("data: ", data);

        let option = {
          backgroundColor: '#333',
          // legend: {
          //   bottom: 30,
          //   data: ['KC_A'],
          //   itemGap: 20,
          //   textStyle: {
          //       color: '#fff',
          //       fontSize: 14
          //   }
          // },

          parallelAxis: Axis,

          parallel: {
            left: "10%",
            right: "10%",
            parallelAxisDefault:{
              type: 'value',
              name: 'features',
              namelocation: 'end',
              nameGap: 20,
              nameTextStyle: {
                color: '#fff',
                fontSize: 12
              },
              axisLine: {
                lineStyle: {
                  color: '#aaa'
                }
              },
              axisTick: {
                lineStyle: {
                  color: '#777'
                }
              },
              splitLine: {
                show:false
              },
              axisLabel: {
                textStyle: {
                  color: '#fff'
                }
              }
            }
          },
          series: [
            {
              name:'features',
              type: 'parallel',
              lineStyle: lineStyle,
              inactiveOpacity: 0,
              activeOpacity: 0.5,
              data: data
            }
          ]

        };
        this.myChart.setOption(option, true);
      }
    },

  }

</script>


<style scoped>
</style>