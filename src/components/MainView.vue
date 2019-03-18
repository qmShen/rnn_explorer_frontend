<template>
  <div class = 'main'>
    <el-row :gutter="3" class="horizontal_stripe">
      <el-col :span="9" class="horizontal_stripe">
        <div class="bg-purple column">
          <!--<ControlView class = 'left_top boundary'></ControlView>-->

          <DistributionView class="distribution_container boundary "
                            :all_feature_stats="all_feature_stats"
                            :all_units_stats="all_units_stats"
                            :allStats="allStats"


          ></DistributionView>
          <!--<StatisticsView :input_scatter = 'input_scatter'-->
                          <!--:trend_data = 'trend_data_json'-->
                          <!--class = "left_top"></StatisticsView>-->
        </div>

      </el-col>


      <el-col :span="15" class="horizontal_stripe">
        <div class="grid-content bg-purple">
          <div class = 'individual_container boundary'>
            <div class="mini_head">
              <div class = 'mini_title'>Sequence</div>
            </div>
            <SequenceView class="sequence_container" :gradients_io="gradients_io" ></SequenceView>

          </div>
          <div class = 'temporal_container boundary'>
            <div class="mini_head">
              <div class = 'mini_title'>Temporal</div>
            </div>
            <LineChart class="linechart_container" :trend_data = 'trend_data_json'></LineChart>
          </div>

        </div>
      </el-col>

      <!--<el-col :span="6" class="horizontal_stripe">-->
      <!--<div class="grid-content bg-purple">-->
      <!--<StatisticsView :input_scatter = 'input_scatter'-->
      <!--:trend_data = 'trend_data_json'-->
      <!--class = "statistics_container"></StatisticsView>-->
      <!--</div>-->
      <!--</el-col>-->

    </el-row>

  </div>
</template>


<script>
  import StatisticsView from './Statistics.vue'
  import ControlView from './Control.vue'

  import LineChart from './visView/LineChart.vue'
  import DistributionView from './visView/DistributionView.vue'
  import SequenceView from './visView/SequenceView.vue'
  import dataService from '../service/dataService.js'

  export default {
    name: "MainView",
    data() {
      return {
        trend_data_json: null,
        input_scatter: null,
        all_feature_stats: null,
        all_units_stats: null,
        gradients_io: null,
        biClusterMap: null,
        allStats: null,

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

      dataService.getAllStats('GRU_1','15', function(records){
        _this.allStats = records;
      });
      dataService.getGradientsAndIO('GRU_1',
        [
          // "1514736000",
          // "1514757600",
          // "1514804400",
          // "1514808000",
          // "1514811600",
          // "1514815200",
        ],function(records){
          _this.gradients_io = records;
        });
    },
    components: {
      StatisticsView,
      ControlView,
      LineChart,
      DistributionView,
      SequenceView
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
  .individual_container{
    height: calc(70%);
  }

  .sequence_container{
    height: calc(100% - 20px);
    width: 100%;
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
  .left_top{
    height: calc(30%);
  }
  .distribution_container{
    height: calc(100%);
  }


</style>
