<template>
  <div class = 'main'>
    <el-row :gutter="3" class="horizontal_stripe">
      <el-col :span="6" class="horizontal_stripe">
        <div class="bg-purple column">

          <div class="control_container boundary">
            <el-menu class="el-menu-demo" mode="horizontal" @select="handleSelectModel">
              <el-submenu index="select_model">
                <template slot="title">Select Model</template>
                <el-menu-item
                  v-for="model in model_list"
                  v-bind:model="model"
                  v-bind:key="model.model_id"
                  :index="model.model_id"
                >{{model.model_name}}</el-menu-item>
              </el-submenu>


              <el-submenu index="select_feature" :disabled = "dropSelection.disableTargetFeature">
                <template slot="title">Select Feature</template>
                <el-menu-item
                  v-for="model in feature_list"
                  v-bind:model="model"
                  v-bind:key="model.feature"
                  :index="model.feature"
                >{{model.feature}}</el-menu-item>
              </el-submenu>


              <el-menu-item :disabled = "dropSelection.disableProjection" @click="drawer = true">Projection</el-menu-item>

              <el-menu-item  @click="sortFeatureBoxplot()">Sort</el-menu-item>
              <!--<el-menu-item index="3" > Projection </el-menu-item>-->
            </el-menu>


            <el-row :gutter="3" style="height: 100%; width: 100%">

              <el-col :span="24" style="height: 100%" class="boundary">
                <Info style="height:calc(100% - 20px); width:100%;"
                      :model_name="model_name"
                      v-bind:targetStation="targetStation"
                      v-bind:regionSector="regionSector"></Info>
              </el-col>

            </el-row>
          </div>

          <DistributionView class="distribution_container boundary "
                            :all_feature_stats="all_feature_stats"
                            :all_units_stats="all_units_stats"
                            :allStats="allStats"
          ></DistributionView>
        </div>

      </el-col>

      <el-col :span="5" class="horizontal_stripe">
        <div class = 'boundary FC_container'>
          <el-col style="width: 100%; height: 100%;">
            <div class="mini_head" style="width: 100%">
              <div class = 'mini_title'>Feature Importance</div>
            </div>

            <div style=" width: calc(100%);height: calc(100% - 20px); overflow-y: scroll;" class="scrollstyle">
              <transition-group>
                <FeatureBoxplot class="boundary" style="display:inline-block; width: calc(100% - 10px); height: calc(100% / 10)"  v-for="item in input_feature_gradient_statistics.feature_statics"
                                v-bind:key="item.feature_name"
                                v-bind:item="item"
                                v-bind:selectedFeatureGradient="selectedFeatureGradient"></FeatureBoxplot>
              </transition-group>
            </div>
          </el-col>

        </div>
      </el-col>
      <el-col :span="13" class="horizontal_stripe">
        <div class="grid-content bg-purple">


          <el-drawer
            style="z-index: 1000; pointer-events:none;"
            title="Projection-PM25"
            :visible.sync="drawer"
            :direction="direction"
            :append-to-body="false"
            :modal="false"
            :modal-append-to-body="false"
            :before-close="handleClose"
            :wrapperClosable="false"
            ref="drawer"
            size="50%">

            <div style="height: calc(100% - 20px); width:calc(100% - 40px); pointer-events: auto">
              <el-row :gutter="3" class="horizontal_stripe boundary" style="left:20px; right: 20px; height: 20%">
                <LineChart class="linechart_container" :trend_data="target_feature_value"> </LineChart>
              </el-row>
              <el-row :gutter="3" class="horizontal_stripe" style="left:20px; right: 20px; height: 65%">
                <el-col :span="8" class="horizontal_stripe " style="height: 100%">
                  <div style = "width: 100%; height: 100%" class="boundary">
                    <div style = "width: 100%; height: 100%">
                      <div style = "width: 100%;">
                        <el-divider >Select hours</el-divider>
                        <table align="left" style="width: 100%">
                          <tr>
                            <td style="width: 20%;" align="center">
                              Hours
                            </td>
                            <td style="width: 60%; left: 10px">
                              <el-slider style="width: 90%"
                                         range
                                         :max="24">
                              </el-slider>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <div style="height:20px">&nbsp</div>
                      <el-divider>Features</el-divider>
                      <div style = "width: 100%; height:580px; overflow-y: scroll">
                        <table align="left" style="width: 100%">
                          <tr style="width: 100%" v-for="item in allStats.features" v-bind:key="item.id">
                            <td style="width: 20%; font-size:10px; " align="center">
                              <div style="overflow: hidden; width: 90px">{{item.id}}</div>
                            </td>
                            <td style="width: 20%" align="center">
                              <el-checkbox size="mini"></el-checkbox>
                            </td>
                            <td style="width:60%; left:10px">
                              <el-slider style="width: 90%"
                                         range
                                         :step="0.01"
                                         :min="0"
                                         :max="1">
                              </el-slider>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="16" class="horizontal_stripe" style="height: 100%;">
                  <GradientScatter class="boundary"
                                   :targetFeature="targetFeature"
                                   :gradientScatter="gradientScatter"
                                   style="height: 100%; width: 100%"></GradientScatter>
                </el-col>
              </el-row>
              <button @click="$refs.drawer.closeDrawer()"> close </button>

            </div>
          </el-drawer>


          <div class = 'individual_container boundary'>
            <el-col :span="24" class="horizontal_stripe" style ='overflow-y: auto;'>
              <div class="mini_head">
                <div class = 'mini_title'>Individual</div>
              </div>
              <div id="individual_container" style="height: calc(100% - 20px); position: relative">
                <IndividualSequenceView
                  class="cardbox"
                  style="display:inline-block; width: calc(100% / 4 - 2px); height: 400px; background-color: white;  position: absolute"
                  v-bind:style="{top:item.position.y +'px', left:item.position.x +'px'}"
                  v-for="item in featureGradientObjs"
                  v-bind:key="item.timestamp"
                  v-bind:item="item"
                  v-bind:targetFeature="targetFeature"></IndividualSequenceView>
              </div>
            </el-col>
          </div>
        </div>
      </el-col>
    </el-row>

  </div>
</template>


<script>
  let dictKeyList = function(dict){
    let list = [];
    for(let key in dict){
      list.push(key)
    }
    return list;
  };

  import * as d3 from "d3";
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

  import Info from './visView/info/Info.vue'

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
        allStats: {'features':[]},
        selected_sequence:[],
        activeName:'second',
        groupColors: ['#4BA453', '#239FFC', '#CE373E',  '#9B4EE2', '#996F4A',  '#2C922D', '#FDB150', '#326598'],
        feature_values_scaled:null,
        input_feature_gradient_statistics: {feature_statics:[]},
        featureGradientObjs: [],
        gradientScatter: null,
        drawer: false,
        direction: 'ltr',
        targetFeature: "PM25",
        target_feature_value:[],
        dropSelection:{
          disableProjection: true,
          disableTargetFeature: true,
        },
        feature_list:[
          {'type': 'feature', 'feature': 'NO2' },
          {'type': 'feature', 'feature': 'O3' },
          {'type': 'feature', 'feature': 'PM25' },
          {'type': 'feature', 'feature': 'PM10' },
          {'type': 'feature', 'feature': 'SO2' }
        ],
        selectedFeatureGradient:{},
        selectedIndividualMap:{},
        targetStation: {
          'station_id': 'KC_A',
          'station_name': 'Kwai Chung ' + 'Station',
          'location':[22.3586, 114.1271]
        },
        'regionSector':null
      }
    },
    mounted: function(){

      let _this = this;
//      pipeService.onMouseOverIndividual(function(msg){
//        console.log('msg', msg);
//        if(msg == undefined){
//          console.log('mouseout');
//        }else{
//          console.log('mosueover', msg)
//        }
//      })

      dataService.loadModelList((model_list)=>{
        model_list.forEach(d=>{
          d['type'] = 'model';
        });
        this.model_list = model_list;

        console.log('model_list', model_list);
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

      let clusterIndividuals = function(featureGradientObjs){
        if(featureGradientObjs.length == 0){
          return
        }
        featureGradientObjs.sort((a,b)=>{
          let x = a['timestamp'].length;
          let y = b['timestamp'].length;
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });

        let clusters = [];
        let current_cluster = [];
        let ptime = featureGradientObjs[0]['timestamp']
        featureGradientObjs.forEach((obj, i)=>{
          if(Math.abs(obj['timestamp'] - ptime) <= 3600 * 6){
            current_cluster.push(obj);
          }else{

            clusters.push(current_cluster);
            current_cluster = [obj];
          }
          ptime = obj['timestamp'];
        });

        clusters.push(current_cluster);
        console.log('clusterssss', clusters);

        let w = 5, h = 4;
        let element = document.getElementById('individual_container');
        let parentConfig = element.getBoundingClientRect();
        let totalWidth = parentConfig['width'];

        console.log('positionInfo', parentConfig);
        for(let i = 0, ilen = clusters.length; i < ilen; i++){
          // Calculate cluster position
          let cluster = clusters[i];
          let clusterRender = {
            'x': (i % 3) * totalWidth / 3,
            'y': parseInt(i / 3) * 450,
            'offsetWidth': (cluster.length - 1) * w,
            'offsetHeight': (cluster.length - 1) * h,
          };
          console.log('cluster render', clusterRender);

          cluster.forEach((individual, index)=>{
            individual['position'] = {
              'x': clusterRender['x'] + index * w,
              'y': clusterRender['y'] + index * h,
            }
          })
        };
        console.log('layout ele', featureGradientObjs);
      };

      pipeService.onSequenceSelected(function(selected_data){

        let selected_ids = selected_data['seq_ids'];
        let selected_timestamps = selected_data['selected_timestamps'];
        let colors = selected_data['colors'];
        let model_id = _this.current_model['model_id'];

        console.log('selected_data', selected_data);
        dataService.getFeatureSequenceGradientClusterToEnd(model_id,
          selected_ids, function(records){

            // Old version
            records['sequence_time'] = selected_ids;
            records['selected_timestamp'] = selected_timestamps;
            records['colors'] = colors;
            _this.gradients_io_cluster = records;

            // New version
            let featureGradientObjs = splitGroup(records);

            clusterIndividuals(featureGradientObjs);
//            featureGradientObjs.forEach((d, i)=>{
//              d['position'] = i * 4
//            });

            _this.featureGradientObjs = featureGradientObjs;
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




//      dataService.getInitScatter(function(records){
//        _this.input_scatter = records
//        console.log('2', new Date() - start_time);
//      });



      pipeService.onCheckIndividual(msg=>{
        if(msg.checked == true){
          this.selectedIndividualMap[msg['timestamp']] = true;
          let list = dictKeyList(this.selectedIndividualMap);
          console.log('list', list,  );
        }else if(msg.checked == false){
          delete this.selectedIndividualMap[msg['timestamp']];
          pipeService.emitSelectedIndividuals(dictKeyList(this.selectedIndividualMap));
          let list = dictKeyList(this.selectedIndividualMap);
          console.log('list', list);
        }
      });
    }, //mounted
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
      GradientScatter,
      Info,
    },
    watch:{
      targetFeature:function(new_data, old_data){
        console.log('target ,', new_data);
      },
      selected_sequence:function(new_data, old_data){
      },
      current_model:function(new_model, old_model){
        let _this = this;
        if(new_model == undefined || new_model == null){
          return
        }
//        Begin
        dataService.loadSelectedModel(this.current_model['model_id'], (records)=>{
          this.allStats = records;
          this.dropSelection.disableTargetFeature = false;
          console.log('allStats', this.allStats);

//          this.getFeatureGradientStatistics('PM25', (records)=>{
//            records['feature_statics'] = records['feature_statics'].slice(0, 20)
//            _this.input_feature_gradient_statistics = records;
//          });


        });



        let start_time = new Date();
        dataService.getFeatureValuesScaled([this.targetFeature], function(records){
          _this.target_feature_value = records;
          console.log('4', new Date() - start_time);
        });
//      End


//  Design: 1519801200 + 3600 * 12,
        pipeService.emitSequenceSelected({
          'seq_ids': [

//            1519801200 + 3600 * 2 ,
//            1519801200 + 3600 * 12,
//            1519801200 + 3600 * 27,
//            1519801200 + 3600 * 25,
//            1519801200 + 3600 * 35,
//            1519801200 + 3600 * 45,
//
//
//
//            1519801200,
//            1519801200 + 3600 * 2 ,
//            1519801200 + 3600 * 3 ,
//
//            1519801200 + 3600 * 12,
//            1519801200 + 3600 * 13,
//
//            1519801200 + 3600 * 25,
//            1519801200 + 3600 * 26,
//            1519801200 + 3600 * 27,
//            1519801200 + 3600 * 28,
//
//            1519801200 + 3600 * 45,
//            1519801200 + 3600 * 46,
//            1519801200 + 3600 * 47,
//            1519801200 + 3600 * 48,
//            1519801200 + 3600 * 24 * 3
          ],
          'selected_timestamps': null,
          'colors': _this.colors
        });


        dataService.getRegionSector('KC_A', (record)=>{
          this.regionSector = record;
        });
      },

      featureGradientObjs: function(new_data, old_data){
        let allFeature = null;
        if(new_data != undefined && new_data.length>0){
          allFeature = new_data[0]['allFeature']
        }
        let featureMap = {};
        if(allFeature == null || allFeature == undefined){
          return
        }
        allFeature.forEach(feature=>{
          featureMap[feature] = {'feature': feature, 'gradientList':[]}
        });
        let gradientList = [];
        new_data.forEach(instance=>{
          let fGradientList = instance['featureGradientToEnd'][this.targetFeature]['feature_gradient'];
          for(let i = 0, ilen = allFeature.length; i < ilen; i++){
            let featureName = allFeature[i];
            featureMap[featureName]['gradientList'].push({
              'timestamp': instance['timestamp'],
              'gradient': fGradientList[i]
            })
          }});

        this.selectedFeatureGradient = featureMap;
      }
    },
    methods:{
      sortFeatureBoxplot(){
        //Need feature list, sort the feature list by the feature importance on selected individuals

        let list = dictKeyList(this.selectedIndividualMap);

        let individualList = [];
        this.featureGradientObjs.forEach(d=>{
          if(this.selectedIndividualMap[d['timestamp']] != undefined){
            individualList.push(d);
          }
        });

        if(individualList.length == 0){
          return
        }
        let gradientList = [];
        for(let i = 0, ilen = individualList.length; i < ilen; i++){
          let ind = individualList[i];
          let gradient1 =ind['featureGradientToEnd'][this.targetFeature]['feature_gradient'];
          let sumGradient = [];
          gradient1.forEach(featureGradient=>{
            sumGradient.push(d3.sum(featureGradient))
          })
          gradientList.push(sumGradient);
        }
        let importanceList = [];


        let length = this.input_feature_gradient_statistics.feature_statics.length;
        for(let i = 0; i < length; i++){
          importanceList.push({
            'feature_index': i,
            'importance':d3.sum(gradientList, gradient=>gradient[i])
          })
        }

        if(this.input_feature_gradient_statistics.feature_statics.length != 0){
          for(let i = 0, ilen = this.input_feature_gradient_statistics.feature_statics.length; i < ilen; i++){
            this.input_feature_gradient_statistics.feature_statics[i]['feature_importance'] = importanceList[i]['importance'];
          }

          this.input_feature_gradient_statistics.feature_statics.sort((a,b)=>{
            let x = a['feature_importance'];
            let y = b['feature_importance'];
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
          });
          console.log('input_feature_gradient_statistics', this.input_feature_gradient_statistics);
        }
        console.log('gradient statustucs, ', this.input_feature_gradient_statistics)
        console.log('gradient', gradientList);
        console.log('gradientSum', importanceList);
      },
      handleSelectModel(index,unknow, ele) {
        let model = ele.$attrs.model;
        if(model == undefined){
          return
        }
        if(model.type == 'model'){
          this.current_model = ele.$attrs.model;
          this.model_name = this.current_model.model_name;
          this.model_id = this.current_model.model_id;
        }else if(model.type == 'feature'){
          this.targetFeature = ele.$attrs.model.feature;
          this.getFeatureGradientStatistics(this.targetFeature, (records)=>{
//              test test test2
            records['feature_statics'].sort((a,b)=>{
              let l = a['temporal_statistics'].length; //.slice(l - 6, l)
              let x = d3.sum(a['temporal_statistics'], d=>d[2]);
              let y = d3.sum(b['temporal_statistics'], d=>d[2]);
              return ((x < y) ? 1 : ((x > y) ? -1 : 0));
            });
            records['feature_statics'] = records['feature_statics'].slice(0, 100);
            this.input_feature_gradient_statistics = records;
          });
          this.getGradientProjection(this.targetFeature, (records)=>{
//              test test test2
            this.gradientScatter = records//.slice(80,90);
            this.dropSelection.disableProjection = false
          });
        }
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
      handleClose(done){
        done();
        console.log('handle close');
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
    height: calc(100% - 0px);
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
    height: calc(100%);
  }
  .statistics_container{
    height: calc(100%);
  }
  .linechart_container{
    height: calc(100%);
    width: 100%;
  }
  .left_top{
    height: calc(20%);
  }

  .control_container{
    height: calc(25%);
  }


  .distribution_container{
    height: calc(75%);
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

  .cardbox{
    border-color: #d3dce6;
    border-width: 1px;
  }
  /*Drop down*/

  /*.el-dropdown-link {*/
  /*cursor: pointer;*/
  /*color: #98a1a5;*/
  /*}*/
  /*.el-icon-arrow-down {*/
  /*font-size: 12px;*/
  /*}*/

  /*---------------------------------------Sub-menu---------------------------------------------Start*/
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

  .el-menu--horizontal>.el-menu-item {

    height: 20px;
    line-height: 20px;

  }

  .el-menu--horizontal>.el-menu-item.is-active {
    border-bottom: 2px solid #fffbef;
    color: #303133;
  }
  /*---------------------------------------Sub-menu----------------------------------------------End*/
  /*divider*/
  .el-divider--horizontal{
    margin-top: 20px;
    margin-bottom: 2px;
  }


</style>
