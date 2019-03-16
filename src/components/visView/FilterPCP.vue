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
      this.render_pcp(this.selected_feature_values);
    },
    watch:{
      selected_feature_values:function(new_val){
        console.log('selected_feature_values:', new_val);
        this.render_pcp(new_val);
        // let schema = [];
        // var j = 0;
        // for(var i in new_val[0]){
        //   // console.log(i);
        //   if(i != "seconds"){
        //     schema.push({"index":j,"name":i});
        //     j = j+1;
        //   }
        // }
        // console.log("schema: ", schema);

        // let lineStyle = {
        //   normal: {
        //     width: 1,
        //     opacity: 0.1,
        //     color: '#FF6347'
        //   }
        // };

        // let Axis = [];
        // for(var i=0;i<schema.length;i++){
        //   if(schema[i].name == 'time'){
        //     Axis.push({"dim":i, "name":schema[i].name, "type": "category"});
        //   }
        //   else{
        //     Axis.push({"dim":i, "name":schema[i].name, scale: true});
        //   } 
        // }
        // console.log("Axis: ", Axis);

        // let data = [];
        // for(var i=0;i<new_val.length;i++){
        //   var sample = [];
        //   for(var j in new_val[i]){
        //     sample.push(new_val[i][j]);
        //   }
        //   data.push(sample);
        // }
        // console.log("data: ", data);

        // let option = {
        //   backgroundColor: '#DDD',
        //   parallelAxis: Axis,

        //   parallel: {
        //     left: "5%",
        //     right: "15%",
        //     bottom: "5%",
        //     parallelAxisDefault:{
        //       type: 'value',
        //       name: 'features',
        //       namelocation: 'end',
        //       nameGap: 20,
        //       nameRotate: 50,
        //       nameTextStyle: {
        //         color: '#000',
        //         fontSize: 8
        //       },
        //       axisLine: {
        //         lineStyle: {
        //           color: '#000'
        //         }
        //       },
        //       axisTick: {
        //         lineStyle: {
        //           color: '#000'
        //         }
        //       },
        //       splitLine: {
        //         show:false
        //       },
        //       axisLabel: {
        //         textStyle: {
        //           color: '#000'
        //         }
        //       }
        //     }
        //   },
        //   series: [
        //     {
        //       name:'features',
        //       type: 'parallel',
        //       lineStyle: lineStyle,
        //       inactiveOpacity: 0,
        //       activeOpacity: 0.5,
        //       data: data
        //     }
        //   ]

        // };
        // this.myChart.setOption(option, true);
      }
    },
    methods:{
      render_pcp(new_val){
        let schema = [];
        var j = 0;
        for(var i in new_val[0]){
          if(i != "seconds"){
            schema.push({"index":j,"name":i});
            j = j+1;
          }
        }
        console.log("schema: ", schema);

        let lineStyle = {
          normal: {
            width: 1,
            opacity: 0.1,
            color: '#FF6347'
          }
        };

        let Axis = [];
        for(var i=0;i<schema.length;i++){
          if(schema[i].name == 'time'){
            Axis.push({"dim":i, "name":schema[i].name, "type": "category"});
          }
          else{
            Axis.push({"dim":i, "name":schema[i].name, scale: true});
          } 
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
          backgroundColor: '#DDD',
          parallelAxis: Axis,

          parallel: {
            left: "5%",
            right: "15%",
            bottom: "5%",
            parallelAxisDefault:{
              type: 'value',
              name: 'features',
              namelocation: 'end',
              nameGap: 20,
              nameRotate: 50,
              nameTextStyle: {
                color: '#000',
                fontSize: 8
              },
              axisLine: {
                lineStyle: {
                  color: '#000'
                }
              },
              axisTick: {
                lineStyle: {
                  color: '#000'
                }
              },
              splitLine: {
                show:false
              },
              axisLabel: {
                textStyle: {
                  color: '#000'
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
    }
  }

</script>


<style scoped>
</style>