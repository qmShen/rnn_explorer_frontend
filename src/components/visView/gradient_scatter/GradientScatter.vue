<template>
  <div class="scatter-container">
    <div class="tools">
      <el-button class="button" id="reset" type="primary" plain size="mini"  v-on:click="reset()">Reset</el-button>
      <el-button class="button" id="drag" type="primary" plain size="mini" v-on:click="drag()">Drag</el-button>
      <el-button class="button" id="brush" type="primary" plain size="mini" v-on:click="brushModel()">Brush</el-button>
      <el-button class="button" id="add" type="primary" plain size="mini" v-on:click="addToSelection()">Add</el-button>
      <el-button class="button" id="confirm" type="primary" plain size="mini" v-on:click="submitSelection()">Confirm</el-button>
      <el-button class="button" id="clear" type="primary" plain size="mini" v-on:click="clearSelection()">Clear</el-button>
    </div>
  </div>
  </div>
</template>

<script>

  import GradientScatter from "./GradientScatter.js"
  import pipeService from "../../../service/pipeService.js"
  export default {
    name: "GradientScatter",
    props:['gradientScatter', 'targetFeature'],
    data(){
      return {
        option: null,
        handler: null
      }
    },
    watch:{
      gradientScatter:function(new_val, old_val){
        if(!new_val) return
        this.handler.setData(new_val, this.targetFeature);
      },
      targetFeature: function(newVal, oldVal){
        if(!new_val) return
      }
    },

    mounted: function(){
      this.handler = new GradientScatter(this.$el);
      if(this.gradientScatter!= null || this.gradientScatter!= undefined){
        this.handler.setData(this.gradientScatter, this.targetFeature);
      }

      pipeService.onTimeRangeSelected((msg)=>{
        this.handler.setTimeRange(msg);
        this.handler.plot();

        console.log('on select time range', msg);
      })
    },
    methods:{
      handleSelected(params){

      },
      addToSelection(){

        this.handler.addToSelection();
      },
      clearSelection(){
        this.handler.clearSelection();
      },
      drag(){
        this.handler.setInteraction('drag');
      },
      brushModel(){
        this.handler.setInteraction('brush');
      },
      reset(){
        this.handler.reset();
      },
      submitSelection(){
        let selectedSelection = this.handler.getAllSelection();
        let seconds = [];
        selectedSelection.forEach((d)=>{
          seconds.push(d.seconds);
        });
//        pipeService.emitSelectedIndividual(seconds);
        //  For test
        pipeService.emitSequenceSelected({
          'seq_ids': seconds,
          'selected_timestamps': null,
          'colors': this.colors
        });

        console.log('Submit the selection!', selectedSelection);
      }
    }
  }
</script>

<style scoped>
  .scatter-container {
    margin: auto;
    width: 1518px;
    height: 772px;

  }

  /*-------------------------------- Begin -------------------------------------*/
  text {
    font: 10px sans-serif;
  }

  .plot {
    position: absolute;
  }

  #plot-canvas {
    z-index: 2;
  }

  #axis-svg {
    z-index: 1;
  }

  .axis path,
  .axis line {
    fill: none;
    stroke: #000;
    shape-rendering: crispEdges;
  }

  .tick line{
    opacity: 0.2;
  }
  /*-------------------------------- End --------------------------------------*/
  .tools {
    position: absolute;
    left: calc(100% - 50px);
    visibility: hidden;
    z-index:10;
  }

  .tools button {
    background-color: #e7e7e7;
    border: none;
    color: #000000;
    cursor: pointer;
    display: block;
    margin-bottom: 5px;
    padding: 5px 10px;
    outline: 0;
  }

  .tools button.active {
    background-color: #13a613;
  }

  .button{
    margin-left: -10px;
    width: 60px;
  }


</style>
