<template>
  <div>
    <el-table size="mini"
              ref="multipleTable"
              :data="tableData"
              tooltip-effect="dark"
              style="width: 100%"
              @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="30">
      </el-table-column>

      <el-table-column
        prop="group_id"
        label="Id"
        width="40"
      >
      </el-table-column>
      <el-table-column
        prop="context"
        label="Num"
        width="50"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="context"
        label="Col"
        width="50"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="O"
        width="30">
        <template slot-scope="scope">
          <el-button
            @click.native.prevent="deleteRow(scope.$index, tableData)"
            type="text"
            size="small">
            R
          </el-button>
        </template>

      </el-table-column>
    </el-table>
    <div style="margin-top: 10px;">
      <el-button size="mini" @click="ConfirmSelection()">Confirm</el-button>
    </div>
  </div>
</template>

<script>

  import pipeService from '../../service/pipeService.js'
  import dataService from '../../service/dataService.js'

  export default {
    name: "SubGroupTable",
    data() {
      return {
        index:2,
        id2group: {},
        tableData: [

        ],
        multipleSelection: []
      }
    },
    mounted(){
      // Used for test
      let _this = this;
      // let c1 = {'10_WN_RH': [42, 51], '10_NE_RH': [43, 51], '30_N_RH': [46, 51]};
      // let c2 = {'300_NE_Temp': [36, 51], '300_N_Temp': [37, 51]};
      let c1 = {'10_WN_RH': [42, 51], '10_NE_RH': [48, 51], '30_N_RH': [46, 51]};
      let c2 = {'300_NE_Temp': [45, 51], '300_N_Temp': [45, 51]};

      this.id2group[0] = c1;
      this.id2group[1] = c2;
      this.tableData = [{'group_id':0, context: 3}, {'group_id':1, context : 2}]
      this.multipleSelection = [{'group_id':0, 'context':3},{'group_id':1, 'context':2}];

      pipeService.onSubgroupSelected(function(selected_features){
        console.log('selected_features, sub_group_data', selected_features);
        let feature_list = [];
        for(let key in selected_features){
          feature_list.push(key);
        }
        _this.id2group[_this.index] = selected_features;
        _this.tableData.push({
          'group_id': _this.index,
          'context': feature_list.length
        })
        _this.index  = _this.index + 1
        console.log('thisthisthis', _this.index, _this.id2group)
      })
    },
    methods:{
      ConfirmSelection(){
        console.log('selection', this.multipleSelection);
        let sub_groups = [];
        this.multipleSelection.forEach((group) => {
          let _index = group['group_id'];
          sub_groups.push(this.id2group[_index])
        });
        console.log('sub_groups', sub_groups)
        dataService.getScatterPlotBySelectedData("GRU_1", sub_groups, function(scatter){
          pipeService.emitSelectedScatterPlot(scatter);

          //Old version
          // _this.distributionMatrix.update_units_distribution_difference(sub_group_data);
        });
      },

      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      deleteRow(index, rows) {
        rows.splice(index, 1);
      }
    }
  }
</script>

<style scoped>

</style>
