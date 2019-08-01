<template>
  <div class = 'main'>
    <el-row :gutter="3" class="horizontal_stripe">
      <el-col :span="6" class="horizontal_stripe">
        <div class="bg-purple column">
          <!--<ControlView class = 'left_top boundary'></ControlView>-->
          <!--<StatisticsView :input_scatter = 'input_scatter'-->
          <!--:trend_data = 'trend_data_json'-->
          <!--class = "left_top"></StatisticsView>-->

          <!--Left top -->
          <!--<ConfusionMatrix class="projection_container"-->
          <!--:trend_data = "trend_data_json">-->
          <!--</ConfusionMatrix>-->

          <!---->
          <!--<div class="projection_container">-->
          <!--<div class="mini_head">-->
          <!--<el-dropdown @command="handleCommand">-->
          <!--<span class="el-dropdown-link " style="font-family: monospace">-->
          <!--Select Model<i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>-->
          <!--</span>-->
          <!--<el-dropdown-menu slot="dropdown">-->
          <!--<el-dropdown-item-->
          <!--v-for="model in model_list"-->
          <!--v-bind:key="model.model_id"-->
          <!--v-bind:model="model"-->
          <!--command=model.model_name>{{model.model_name}}</el-dropdown-item>-->
          <!--</el-dropdown-menu>-->

          <!--</el-dropdown>-->
          <!--</div>-->
          <!--</div>-->

          <div class="projection_container boundary">
            <el-menu class="el-menu-demo" mode="horizontal" @select="handleSelectModel">
              <el-submenu index="select_model">
                <template slot="title">Select Model</template>
                <el-menu-item
                  v-for="model in model_list"
                  v-bind:model="model"
                  v-bind:key="model.model_id"
                  index="$model"
                >{{model.model_name}}</el-menu-item>
              </el-submenu>
            </el-menu>
            <div style="width: 100px">
              {{model_id}}
            </div>
            <div style="width: 100px">
              {{model_name}}
            </div>
          </div>

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
            <el-col style="width: 100%; height: 100%;overflow-x: scroll;" class="scrollstyle">
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



          <div class = 'individual_container boundary'>
            <el-col :span="24" class="horizontal_stripe" style ='overflow-y: auto;'>
              <div class="mini_head">
                <div class = 'mini_title'>Sequence List</div>
              </div>
              <div style="height: calc(100% - 20px);  ">
                <GradientScatter
                  :gradientScatter="gradientScatter"
                  style="height: 100%; width: 100%"></GradientScatter>
              </div>
            </el-col>
          </div>



          <!--IndividualSequence not used yet!-->
          <!--<div class = 'individual_container boundary'>-->
          <!--<el-col :span="24" class="horizontal_stripe" style ='overflow-y: auto;'>-->
          <!--<div class="mini_head">-->
          <!--<div class = 'mini_title'>Sequence List</div>-->
          <!--</div>-->
          <!--<div style="height: calc(100% - 20px);  ">-->
          <!--<IndividualSequenceView class="boundary" style="display:inline-block; width: calc(100% / 4 - 2px); height: 400px"-->
          <!--v-for="item in featureGradientObjs" v-bind:key="item.timestamp" v-bind:item="item"></IndividualSequenceView>-->
          <!--</div>-->
          <!--</el-col>-->
          <!--</div>-->


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

  import GradientScatter from './visView/gradient_scatter/GradientScatter.vue'

  export default {
    name: "MainView",
    data() {
      return {
        model_list:[],
        current_model: null,
        model_name: '',
        model_id:'',
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
        featureGradientObjs: [],
        gradientScatter: null

      }
    },
    mounted: function(){
      let _this = this;

      dataService.loadModelList(function(d){
        _this.model_list = d;
        console.log('model_list', d);
      });
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
        let model_id = _this.current_model['model_id'];
        dataService.getFeatureSequenceGradientClusterToEnd(model_id,
          selected_ids, function(records){
            // Old version
            records['sequence_time'] = selected_ids;
            records['selected_timestamp'] = selected_timestamps;
            records['colors'] = colors;
            _this.gradients_io_cluster = records;
            console.log('sequence_data', records);

            // New version

            _this.featureGradientObjs = splitGroup(records);
//            console.log('gradient', _this.featureGradientObjs);
          });
      });

      let start_time = new Date();




      // Gradient scatter, scatter plot
//      dataService.getTemporal(function(records){
//        _this.trend_data_json = records;
//      });

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



//      dataService.getInitScatter(function(records){
//        _this.input_scatter = records
//        console.log('2', new Date() - start_time);
//      });

//  For test
//      pipeService.emitSequenceSelected({
//        'seq_ids': [1519801200,
//          1519801200 + 3600 * 24,
//          1519801200 + 3600 * 24 * 2,
//          1519801200 + 3600 * 24 * 3],
//        'selected_timestamps': null,
//        'colors': _this.colors
//      });

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
      IndividualSequenceView,
      GradientScatter
    },
    watch:{
      selected_sequence:function(new_data, old_data){
      },
      current_model:function(new_model, old_model){
        let _this = this;
        if(new_model == undefined || new_model == null){
          return
        }
        console.log('Select new model!', new_model);

//        dataService.loadSelectedModel(this.current_model['model_id'], function(records){
//          console.log('cluster_result', records);
//          _this.allStats = records;
//
//        });

//        this.getFeatureGradientStatistics('PM25', (records)=>{
//            _this.input_feature_gradient_statistics = records;
//        });

        this.getGradientProjection('PM25', (records)=>{
            _this.gradientScatter = records;
        });

//        this.getSequenceSelected(
//          [//1519801200, 1519801200 + 3600 * 24, 1519801200 + 3600 * 24 * 2,
//            1519801200 + 3600 * 24 * 3]
//        );

      }
    },
    methods:{
      handleSelectModel(index,unknow, ele) {
        this.current_model = ele.$attrs.model;
        this.model_name = this.current_model.model_name;
        this.model_id = this.current_model.model_id;
      },
      getSequenceSelected(seqIds){
        pipeService.emitSequenceSelected({
          'seq_ids': seqIds,
          'selected_timestamps': null,
          'colors': this.colors
        });
      },
      getGradientProjection(targetFeature, callBack){
        let _this = this;
        dataService.getGradientProject(_this.current_model['model_id'], targetFeature, function(records){
          callBack(records);
        });
      },
      getFeatureGradientStatistics(targetFeature, callBack){
        let _this = this;
        dataService.getInputFeatureGradientStatistics(_this.current_model['model_id'], targetFeature, function(records){
            callBack(records)
        });
      },
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

  /*Drop down*/

  .el-dropdown-link {
    cursor: pointer;
    color: #98a1a5;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }

  .el-menu--horizontal>.el-submenu .el-submenu__title {
    height: 20px;
    line-height: 20px;
    border-bottom: 2px solid transparent;
    color: #909399;
  }

  .el-menu--horizontal .el-menu .el-menu-item, .el-menu--horizontal .el-menu .el-submenu__title {
    background-color: #FFF;
    float: none;
    height: 20px;
    line-height: 20px;
    padding: 0 10px;
    color: #909399;
  }
</style>
