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

          <!--<div class = 'boundary temporal_container'>-->

            <!--<el-col style = 'height: 100%'>-->
              <!--<div class="mini_head">-->
                <!--<div class = 'mini_title'>Temporal Feature</div>-->
              <!--</div>-->
              <!--<FeaturePCP class="feature_value" :feature_values_scaled="feature_values_scaled"></FeaturePCP>-->
              <!--&lt;!&ndash;<LineChart class="linechart_container" :trend_data = 'trend_data_json'></LineChart>&ndash;&gt;-->
            <!--</el-col>-->

          <!--</div>-->

          <div class = 'boundary FC_container'>
            <el-col style="width: 100%; height: 100%;overflow-x: scroll;  " class="scrollstyle">
              <div class="mini_head" style="width: calc(56000px)">
                <div class = 'mini_title'>FC distribution</div>
              </div>
              <div style="height: calc(100% - 20px); width: calc(56000px); ">
                <FeatureBoxplot class="boundary" style="display:inline-block; width: 200px; height: calc(100% - 15px)"  v-for="item in input_feature_gradient_statistics.feature_statics"
                                v-bind:key="item.feature_name"
                                v-bind:item="item"></FeatureBoxplot>
              </div>
            </el-col>

          </div>


          <!--<div class = 'individual_container boundary'>-->
          <!--<el-col :span="24" class="horizontal_stripe" style ='overflow-y: auto'>-->
          <!--<div class="mini_head">-->
          <!--<div class = 'mini_title'>Sequence</div>-->
          <!--</div>-->
          <!--<SequenceView class="sequence_container " :gradients_io="gradients_io" :gradients_io_cluster="gradients_io_cluster"></SequenceView>-->
          <!--</el-col>-->
          <!--</div>-->
          <div class = 'individual_container boundary'>
            <el-col :span="24" class="horizontal_stripe" style ='overflow-y: auto;'>
              <div class="mini_head">
                <div class = 'mini_title'>Sequence List</div>
              </div>
              <div style="height: calc(100% - 20px);  ">
                <IndividualSequenceView class="boundary" style="display:inline-block; width: calc(100% / 4 - 2px); height: 400px"
                     v-for="item in featureGradientObjs" v-bind:key="item.timestamp" v-bind:item="item"></IndividualSequenceView>
              </div>
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


  import FeaturePCP from './visView/FeaturePCP.vue'

  import FeatureBoxplot from './visView/InputFeatureBoxplot.vue'
  import IndividualSequenceView from './visView/individual_sequence/IndividualSequenceView.vue'

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
        groupColors: ['#4BA453', '#239FFC', '#CE373E',  '#9B4EE2', '#996F4A',  '#2C922D', '#FDB150', '#326598'],
        feature_values_scaled:null,
        input_feature_gradient_statistics: {feature_statics:[]},
        featureGradientObjs: []
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
      let splitGroup = function(record){
        let timestamps = record['sequence_time'];
        let featureGradientObjs = [];
        for(let i = 0, ilen = timestamps.length; i < ilen; i++){
          let gradientObj = {};
          for(let feature in record['feature_gradient_to_end']){
            gradientObj[feature] = record['feature_gradient_to_end'][feature][i];
          }
          featureGradientObjs.push({
            'allFeature': record['all_features'],
            'timestamp': timestamps[i],
            'featureValue': record['feature_value'][i],
            'featureGradientToEnd': gradientObj
          })
        }
        return featureGradientObjs
      };
      pipeService.onSequenceSelected(function(selected_data){
        let selected_ids = selected_data['seq_ids'];
        let selected_timestamps = selected_data['selected_timestamps'];
        let colors = selected_data['colors'];
        dataService.getFeatureSequenceGradientClusterToEnd('GRU_1',
          selected_ids, function(records){
            // Old version
            records['sequence_time'] = selected_ids;
            records['selected_timestamp'] = selected_timestamps;
            records['colors'] = colors;
            _this.gradients_io_cluster = records;

            // New version

            _this.featureGradientObjs = splitGroup(records);
//            console.log('gradient', _this.featureGradientObjs);
          });
      });

      let start_time = new Date();

      // Unit feature cluster
      dataService.getAllStats('GRU_1','15', function(records){
        _this.allStats = records;
//        console.log('1', new Date() - start_time);
      });


      // Gradient scatter
      dataService.getTemporal(function(records){
//          console.log('records',records);
//        _this.trend_data_json = records;
//        console.log('2', new Date() - start_time);
      });

      // Feature trend
//      dataService.getFeatureValues('GRU_1',this.selected_features, function(records){
//        _this.feature_values = records;
//        console.log('all feature values', records)
//        console.log('3', new Date() - start_time);
//      });

      // Feature trend test removed, render the feature value
//      dataService.getFeatureValuesScaled( function(records){
//        _this.feature_values_scaled = records;
//        console.log('4', new Date() - start_time);
//      });


      // Feature gradient
      dataService.getInputFeatureGradientStatistics('GRU_1','PM25', function(records){
        _this.input_feature_gradient_statistics = records;
//        console.log('log', records);
      });
//      dataService.getInitScatter(function(records){
//        _this.input_scatter = records
//        console.log('2', new Date() - start_time);
//      });

      //  For test

      pipeService.emitSequenceSelected({
        'seq_ids': [1519801200,
//          1519801200 + 3600 * 24,
//          1519801200 + 3600 * 24 * 2,
          1519801200 + 3600 * 24 * 3],
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
      ConfusionMatrix,
      FeaturePCP,
      FeatureBoxplot,
      IndividualSequenceView
    },
    watch:{
      selected_sequence:function(new_data, old_data){
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
    height: calc(80%);
  }

  .sequence_container{
    /*height: calc(100% - 20px);*/
    width: 100%;

  }
  .temporal_container{
    height: calc(20%);
  }
  .feature_value{
    height: 100%
  }
  .FC_container{
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

  .scrollstyle{
    scrollbar-width: thin;
  }

  .scrollstyle::-webkit-scrollbar-track
  {
    -webkit-box-shadow: inset 0 0 2px rgba(0,0,0,0.3);
    background-color: #F5F5F5;
  }

  .scrollstyle::-webkit-scrollbar
  {
    /*width: 2px;*/
    background-color: #F5F5F5;
  }

  .scrollstyle::-webkit-scrollbar-thumb
  {
    background-color: #98a1a5;

    /*width: 2px;*/
  }


</style>
