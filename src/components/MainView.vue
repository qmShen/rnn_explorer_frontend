<template>
  <div class = 'main'>
    <el-row :gutter="3" class="horizontal_stripe">
      <el-col :span="6" class="horizontal_stripe">
        <div class="bg-purple column">
          <!--<ControlView class = 'left_top boundary'></ControlView>-->
          <!--<StatisticsView :input_scatter = 'input_scatter'-->
          <!--:trend_data = 'trend_data_json'-->
          <!--class = "left_top"></StatisticsView>-->


          <ConfusionMatrix class="projection_container"
                           :trend_data = "trend_data_json">
          </ConfusionMatrix>


          <DistributionView class="distribution_container boundary "
                            :all_feature_stats="all_feature_stats"
                            :all_units_stats="all_units_stats"
                            :allStats="allStats"

          ></DistributionView>

        </div>

      </el-col>


      <el-col :span="18" class="horizontal_stripe">
        <div class="grid-content bg-purple">

          <div class = 'temporal_container boundary'>
            <el-row :gutter="3" class="horizontal_stripe">
              <!--<subgroupo></subgroupo>-->
              <!--<el-col :span="4" class="table_horizontal_stripe boundary">-->
                <!--<div class="mini_head">-->
                  <!--<div class = 'mini_title'>Subgroup</div>-->
                <!--</div>-->
                <!--<SubGroupTable :colors="groupColors"></SubGroupTable>-->
                <!--&lt;!&ndash;<LineChart class="linechart_container" :trend_data = 'trend_data_json'></LineChart>&ndash;&gt;-->

              <!--</el-col>-->
              <el-col :span="9" class="horizontal_stripe">
                <div class="mini_head">
                  <div class = 'mini_title'>Projection</div>
                </div>
                <!--<LineChart class="linechart_container" :trend_data = 'trend_data_json'></LineChart>-->
                <Scatter :selected_sequence="selected_sequence" :colors="groupColors" class="scatter_container" ></Scatter>
              </el-col>



              <el-col :span="11" class="horizontal_stripe">
                <div class="mini_head">
                  <div class = 'mini_title'>Time</div>
                </div>
                <!--<LineChart class="linechart_container" :trend_data = 'trend_data_json'></LineChart>-->

                <!--<ConfusionMatrix class="linechart_container matrix_container"-->
                <!--:trend_data = "trend_data_json">-->
                <!--</ConfusionMatrix>-->

                <!--<el-tabs class="horizontal_stripe"  v-model="activeName">-->
                <!--<el-tab-pane class="horizontal_stripe" label="Temporal" name="first">-->

                <!--<LineChart class="linechart_container" :trend_data = 'trend_data_json'></LineChart>-->
                <!--</el-tab-pane>-->

                <!--<el-tab-pane class="horizontal_stripe" label="Confusion Matrix" name="second">-->
                <!--<ConfusionMatrix :trend_data = "trend_data_json"-->
                <!--class='matrix_container'>-->
                <!--</ConfusionMatrix>-->
                <!--&lt;!&ndash;<StatisticsView :input_scatter = 'input_scatter'&ndash;&gt;-->
                <!--&lt;!&ndash;:trend_data = 'trend_data_json'&ndash;&gt;-->
                <!--&lt;!&ndash;class = "statistics_container"></StatisticsView>&ndash;&gt;-->
                <!--</el-tab-pane>-->
                <!--</el-tabs>-->

              </el-col>
            </el-row>
          </div>


          <!--<div class = 'temporal_container boundary'>-->
          <!--<div class="mini_head">-->
          <!--<div class = 'mini_title'>Temporal</div>-->
          <!--</div>-->
          <!--&lt;!&ndash;<LineChart class="linechart_container" :trend_data = 'trend_data_json'></LineChart>&ndash;&gt;-->
          <!--<Scatter :selected_sequence="selected_sequence" class="scatter_container" ></Scatter>-->
          <!--</div>-->

          <div class = 'individual_container boundary'>
            <!--<el-col :span="8" class="horizontal_stripe boundary">-->
            <!--<div class="mini_head">-->
            <!--<div class = 'mini_title'>Scatter</div>-->
            <!--</div>-->
            <!---->
            <!--<Scatter :selected_sequence="selected_sequence" class="scatter_container" ></Scatter>-->
            <!--</el-col>-->

            <el-col :span="24" class="horizontal_stripe" style ='overflow-y: auto'>
              <div class="mini_head">
                <div class = 'mini_title'>Sequence</div>
              </div>
              <SequenceView class="sequence_container" :gradients_io="gradients_io" :gradients_io_cluster="gradients_io_cluster"></SequenceView>
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
  import SubGroupTable from './visView/SubGroupTable.vue'
  import ConfusionMatrix from './visView/ConfusionMatrix.vue'

  export default {
    name: "MainView",
    data() {
      return {
        trend_data_json: null,
        input_scatter: null,
        all_feature_stats: null,
        all_units_stats: null,
        gradients_io: null,
        gradients_io_cluster: null,
        biClusterMap: null,
        allStats: null,
        selected_sequence:[],
        activeName:'second',
        groupColors: ['#4BA453', '#239FFC', '#CE373E',  '#9B4EE2', '#996F4A',  '#2C922D', '#FDB150', '#326598']

      }
    },
    mounted: function(){
      let _this = this;
      //
      // pipeService.onSequenceSelected(function(selected_ids){
      //   console.log('sequence selected', selected_ids);
      //   dataService.getGradientsAndIO('GRU_1',
      //     selected_ids,function(records){
      //
      //       _this.gradients_io = records;
      //     });
      // });

      pipeService.onSequenceSelected(function(selected_data){
        let selected_ids = selected_data['seq_ids'];
        let selected_timestamps = selected_data['selected_timestamps'];
        let colors = selected_data['colors'];
        dataService.getFeatureSequenceGradientClusterToEnd('GRU_1',
          selected_ids,function(records){
            records['sequence_time'] = selected_ids;
            records['selected_timestamp'] = selected_timestamps;
            records['colors'] = colors;
            _this.gradients_io_cluster = records;
          });
      });


      dataService.getTemporal(function(records){
        _this.trend_data_json = records
      });
      dataService.getInitScatter(function(records){
        _this.input_scatter = records
      });
      //test
      dataService.getAllStats('GRU_1','15', function(records){
        _this.allStats = records;
      });


      //  For test

      pipeService.emitSequenceSelected({
        'seq_ids': [1519801200, 1518681600, 1519038000],
        'selected_timestamps': null,
        'colors': _this.colors
      });

    },
    components: {
      StatisticsView,
      ControlView,
      LineChart,
      DistributionView,
      SequenceView,
      Scatter,
      SubGroupTable,
      ConfusionMatrix
    },
    watch:{
      selected_sequence:function(new_data, old_data){
        console.log('selected changed', new_data, old_data);
      }
    }
  }
</script>

<style>
  .main{
    /*background: #efedf2;*/
    height: 100%;
  }

  .horizontal_stripe{
    height: 100%;
  }
  .table_horizontal_stripe{
    height: 100%;
    overflow-y: auto;
    overflow-x: auto;
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
    /*height: calc(100% - 20px);*/
    width: 100%;

  }
  .temporal_container{
    height: calc(50%);
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

  .projection_container{
    height: calc(30%);
  }
  .distribution_container{
    height: calc(70%);
  }
  .scatter_container{
    height: calc(100%);


  }

  .el-tabs__content{
    height: calc(100% - 50px);
    font-family: 'monospace';
    font-size: 13px;

  }
  .el-tabs__nav-wrap is-top{
    max-height: 10px;
    font-family: 'monospace';

  }
  .el-tabs__item{
    height: 13px;
    line-height: 13px;
    font-family: 'monospace';
    font-size: 13px;
  }
  .el-tabs__nav-scroll{
    background: rgb(243,243,243);
  }
</style>
