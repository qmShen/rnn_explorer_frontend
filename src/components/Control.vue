<template>
  <div class ='control_main'>
    <!--<el-tag>Model</el-tag>-->
    <div class = 'model boundary'>
      <div class="mini_head">
        <div class = 'mini_title'>Model</div>
      </div>

      <el-select class="select_box" size="mini"
        v-model="value10"
        filterable
        allow-create
        default-first-option
        placeholder="Choose model">
        <el-option
          v-for="item in options5"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>

      <div style="width: 90%;" >
        <el-table size="small"
                  :row-style="{height:'20px'}"
                  :data="tableData"
                  border
                  style="width: 100%;">
          <el-table-column
            prop="layer"
            label="Layer">
          </el-table-column>
          <el-table-column
            prop="shape"
            label="Shape">
          </el-table-column>

        </el-table>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: "Control",
    data() {
      return {
        tableData: [{
          layer: 'Input',
          shape: '(None, 24, 265)  '
        }, {
          layer: 'SimpleRNN',
          shape: '(None, 100)'
        }, {
          layer: 'SimpleRNN',
          shape: '(None, 100)'
        }, {
          layer: 'Dense ',
          shape: '(None, 2)'
        }],

        options5: [{
          value: 'lstm_3_10_24_200',
          label: 'KC_A_step_3_epoch_10_inputlen_24_output_dim_200_LSTM.hdf5'
        }, {
          value: 'rnn_3_10_24_200',
          label: 'KC_A_step_3_epoch_10_inputlen_24_output_dim_200_RNN.hdf5'
        }, {
          value: 'gru_3_10_24_200',
          label: 'KC_A_step_3_epoch_10_inputlen_24_output_dim_200_GRU.hdf5'
        }],
        value10: []
      }
    }
  }
</script>

<style scoped>

  .model{
    height: 100%;
  }


  .select_box{
    max-width: 80%;
    margin-bottom: 5px;
    margin-top: 5px;
  }
</style>
