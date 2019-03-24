<template>
  <div class = 'main'>
    <el-row :gutter="3" class="horizontal_stripe">
      <el-col :span="7" class="horizontal_stripe">
        <div class="bg-purple column">
          <!--<ControlView class = 'left_top boundary'></ControlView>-->
          <StatisticsView :input_scatter = 'input_scatter'
                          :trend_data = 'trend_data_json'
                          class = "left_top"></StatisticsView>
          <DistributionView class="distribution_container boundary "
                            :all_feature_stats="all_feature_stats"
                            :all_units_stats="all_units_stats"
                            :allStats="allStats"

          ></DistributionView>

        </div>

      </el-col>


      <el-col :span="17" class="horizontal_stripe">
        <div class="grid-content bg-purple">

          <div class = 'temporal_container boundary'>
            <div class="mini_head">
              <div class = 'mini_title'>Temporal</div>
            </div>
            <LineChart class="linechart_container" :trend_data = 'trend_data_json'></LineChart>
          </div>

          <div class = 'individual_container boundary'>
            <el-col :span="8" class="horizontal_stripe boundary">
              <div class="mini_head">
                <div class = 'mini_title'>Scatter</div>
              </div>
              <!--<SequenceView class="sequence_container" :gradients_io="gradients_io" ></SequenceView>-->
              <Scatter :selected_sequence="selected_sequence" class="scatter_container" ></Scatter>
            </el-col>

            <el-col :span="16" class="horizontal_stripe">
              <div class="mini_head">
                <div class = 'mini_title'>Sequence</div>
              </div>
              <SequenceView class="sequence_container" :gradients_io="gradients_io" ></SequenceView>
            </el-col>

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
  import Scatter from './visView/Scatter.vue'

  import LineChart from './visView/LineChart.vue'
  import DistributionView from './visView/DistributionView.vue'
  import SequenceView from './visView/SequenceView.vue'
  import dataService from '../service/dataService.js'
  import pipeService from '../service/pipeService.js'


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
        selected_sequence:[],

      }
    },
    mounted: function(){
      let _this = this;
      pipeService.onSequenceSelected(function(selected_ids){
        console.log('sequence selected', selected_ids);
        dataService.getGradientsAndIO('GRU_1',
          selected_ids,function(records){
            _this.gradients_io = records;
          });
      });

      pipeService.getSequenceClusterData(function(selected_ids){
        console.log('sequence selected', selected_ids);
        dataService.getGradientsAndIO('GRU_1',
          selected_ids,function(records){
            console.log("recieved sequence", records);
          });
      });


      dataService.getTemporal(function(records){
        _this.trend_data_json = records
      });
      dataService.getInitScatter(function(records){
        _this.input_scatter = records
      });

      dataService.getAllStats('GRU_1','15', function(records){
        _this.allStats = records;
      });

    },
    components: {
      StatisticsView,
      ControlView,
      LineChart,
      DistributionView,
      SequenceView,
      Scatter
    },
    watch:{
      selected_sequence:function(new_data, old_data){
        console.log('selected changed', new_data, old_data);
      }
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
    height: calc(80%);
  }

  .sequence_container{
    height: calc(100% - 20px);
    width: 100%;
  }
  .temporal_container{
    height: calc(20%);
  }
  .statistics_container{
    height: calc(100%);
  }
  .linechart_container{
    height: calc(100% - 20px);
    width: 100%;
  }
  .left_top{
    height: calc(20%);
  }
  .distribution_container{
    height: calc(80%);
  }
  .scatter_container{
    height: calc(60%);

  }


</style>
