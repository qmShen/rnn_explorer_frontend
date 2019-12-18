<template>
  <div class="local_container">
    <div class="mini_head">
<!--      <div class = 'mini_title' >Distribution</div>-->
    </div>

    <svg class="cluster_svg"></svg>
<!--    <el-button size="mini" class="dist_confirm_button" @click="handleSelectedData">Calc</el-button>-->
<!--    <el-button size="mini" class="filter_button" @click="handleOpen">Filter</el-button>-->
    <el-dialog class = "popup_dialog"

               title="Filter"
               :visible.sync="dialogVisible"
               width="90%"
               :close="handleClose">
      <FilterPCP :selected_feature_values="selected_feature_values" class="pcp"></FilterPCP>

      <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="dialogVisible = false">Cancel</el-button>
      <el-button size="mini" type="primary" @click="dialogVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import DistributionMatrix from "./distribution.js"
  import FilterPCP from "./FilterPCP.vue"
  import dataService from "../../service/dataService.js"
  import pipeService from "../../service/pipeService.js"

  // dataService.getFeatureValues('GRU_1',
  //    ['10_NE_SO2', '10_NE_SeaLevelPressure','10_NE_Temp', '10_NE_Wind', '10_SW_NO2', '10_SW_O3', '10_SW_PM10',
  //      '10_SW_PM25', '10_SW_RH', '10_SW_SO2', '10_SW_Temp', '10_SW_Wind',
  //      '10_S_CO', '10_S_NO2', '10_S_O3', '10_S_PM10', '10_S_PM25','10_S_SO2'
  //    ], function(records){
  //    _this.selected_feature_values = records;
  //  });
  export default {
    name: "DistributionView",
    props:['all_units_stats', 'all_feature_stats','allStats'],
    components:{
      FilterPCP
    },
    data(){
      return {
        dialogVisible: false,
        selected_feature_values:null,
        selected_features: ['10_NE_SO2', '10_NE_SeaLevelPressure','10_NE_Temp', '10_NE_Wind', '10_SW_NO2', '10_SW_O3', '10_SW_PM10',
          '10_SW_PM25', '10_SW_RH', '10_SW_SO2', '10_SW_Temp', '10_SW_Wind',
          '10_S_CO', '10_S_NO2', '10_S_O3', '10_S_PM10', '10_S_PM25','10_S_SO2'],

      }
    },
    mounted:function(){

      // dataService.getScatterPlotBySelectedData("GRU_1", 'test', 'test', function(scatter){
      //   pipeService.emitSelectedScatterPlot(scatter);
      // });
      this.distributionMatrix = new DistributionMatrix(this.$el);
      // this.distributionMatrix.register_function(this.handleSelectedData)

      pipeService.onMouseoverFeature(msg=>{
        if(msg == undefined){
          // console.log('mouse out');
        }else{
          // console.log('mouse on', msg);
        }
      });
    },
    watch:{
      all_units_stats: function(new_val, old_val){
        if(new_val){
          this.distributionMatrix.add_untis_stats(new_val);
          this.distributionMatrix.update_units_render(new_val);
        }

      },
      all_feature_stats: function(new_val, old_val){
        // this.distributionMatrix.add_feature_stats(new_val);
        // this.distributionMatrix.update_features_render(new_val);
      },
      selected_feature_values:function(new_val, old_val){
        console.log('erer')
      },
      allStats:function(new_val){

        let unit_cluster_map = new_val['cluster']['unit2cluster'];
        let feature_cluster_map = new_val['cluster']['featrue2cluster'];
        let units = new_val['units'];
        let features = new_val['features'];
        for(let i = 0, ilen = units.length; i < ilen; i++){
          units[i]['cid'] = unit_cluster_map[units[i]['uid']];
          units[i]['id'] = units[i]['uid']
        }
        for(let i = 0, ilen = features.length; i < ilen; i++){
          features[i]['cid'] = feature_cluster_map[features[i]['fid']];
          features[i]['id'] = features[i]['fid'];
        }
        //CCC

        this.distributionMatrix.initialize_cluster_render(new_val);
        // this.distributionMatrix.initialize_bicluster_render(new_val);

        this.distributionMatrix.layout_cells();
        // this.distributionMatrix.draw_linkage();




      }
    },
    methods:{
      handleClose(done) {
        console.log('error!')
      },
      handleOpen(done){
        console.log('open pcp!');
        let _this = this;
        dataService.getFeatureValues('GRU_1',this.selected_features, function(records){
          _this.dialogVisible = true;
          _this.selected_feature_values = records;

        });

      },
      handleUpdateDistribution(){

      },
      handleSelectedData(){
        let _this = this;
        let x = this.distributionMatrix.get_selected_data();
        let selected_features = JSON.parse(JSON.stringify(x[0]));
        let selected_units =  JSON.parse(JSON.stringify(x[1]));
        pipeService.emitSubgroupSelected(selected_features);
        dataService.getSubgroupStats("GRU_1", selected_features, selected_units, 50, 'ks', function(sub_group_data){

          for(let i = 0, ilen = sub_group_data.length; i < ilen; i++){
            if(sub_group_data[i])
              sub_group_data[i]['id'] = sub_group_data[i]['uid']
          }

          _this.distributionMatrix.update_units_distributionV2(sub_group_data);
          //Old version
          // _this.distributionMatrix.update_units_distribution_difference(sub_group_data);
        });



        //Should be here
        // Maybe used latter

      }
    },

  }
</script>

<style >
  .cluster_svg{
    height: calc(100% - 20px);
    width: 100%
  }
  .filter_button{
    position: absolute;
    bottom: 10px;
    right: 10px;
  }
  .dist_confirm_button{
    position: absolute;
    bottom: 50px;
    right: 10px;
  }
  .local_container{
    position: relative;
  }

  .pcp{
    height: 100%;
  }


  /*.el-dialog__wrapper{*/

  /*opacity: 0.4;*/
  /*}*/
  .ticks {
    font: 10px sans-serif;
  }

  .track,
  .track-inset,
  .track-overlay {
    stroke-linecap: round;
  }

  .track {
    stroke: #000;
    stroke-opacity: 0.5;
    stroke-width: 10px;
  }

  .track-inset {
    stroke: rgb(255, 255, 255);
    stroke-width: 8px;
  }

  .track-overlay {
    pointer-events: stroke;
    stroke-width: 50px;
    stroke: transparent;
    cursor: crosshair;
  }

</style>
