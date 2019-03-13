<template>
  <div class = 'main'>
    <el-row :gutter="3" class="horizontal_stripe">
      <el-col :span="6" class="horizontal_stripe">
        <div class="bg-purple column">
          <ControlView></ControlView>
        </div>

      </el-col>
      <el-col :span="12" class="horizontal_stripe">
        <div class="grid-content bg-purple">
          <div class = 'sequence_container boundary'>
            <div class="mini_head">
              <div class = 'mini_title'>Sequence</div>
            </div>
          </div>
          <div class = 'temporal_container boundary'>
            <div class="mini_head">
              <div class = 'mini_title'>Temporal</div>
            </div>
            <LineChart class="linechart_container" :trend_data = 'trend_data_json'></LineChart>
          </div>

        </div>
      </el-col>

      <el-col :span="6" class="horizontal_stripe">
        <div class="grid-content bg-purple">
          <StatisticsView :input_scatter = 'input_scatter'
                          :trend_data = 'trend_data_json'
                          class = "statistics_container"></StatisticsView>
        </div>
      </el-col>

    </el-row>

  </div>
</template>


<script>
  import StatisticsView from './Statistics.vue'
  import ControlView from './Control.vue'

  import LineChart from './visView/LineChart.vue'

  import dataService from '../service/dataService.js'

  export default {
    name: "MainView",
    data() {
      return {
        trend_data_json: null,
        input_scatter: null

      }
    },
    mounted: function(){
      let _this = this;
      dataService.getTemporal(function(records){
        _this.trend_data_json = records
      });
      dataService.getInitScatter(function(records){
        _this.input_scatter = records
      });
      dataService.getUnitsStats('GRU_1',function(records){
        console.log('post', records)
      });

    },


    components: {
      StatisticsView,
      ControlView,
      LineChart

    },
    watch:{

    }
  }
</script>

<style scoped>
  .main{
    /*background: #efedf2;*/
    height: 100%;
  }

  .horizontal_stripe{
    height: 100%;
  }

  .bg-purple {

  }

  .grid-content {
    border-radius: 4px;
    height: 100%;

  }
  .column{
    height: 100%
  }
  /*.h_2{*/
  /*height: 75%*/
  /*}*/


  .sequence_container{
    height: calc(70%);
  }
  .temporal_container{
    height: calc(30%);
  }
  .statistics_container{
    height: calc(100%);
  }
  .linechart_container{
    height: calc(100% - 20px);
    width: 100%;
  }

</style>
