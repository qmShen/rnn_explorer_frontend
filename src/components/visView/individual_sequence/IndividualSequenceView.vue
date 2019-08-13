<template>
  <div  style="font-size: 10px"><el-checkbox
    size="mini" v-model="checked" class="checkbox"
  >{{title}}</el-checkbox></div>
</template>

<script>

  import IndividualSequence from "./IndividualSequence.js"
  import pipeService from "../../../service/pipeService.js"


  export default {
    name: "IndividualSequence",
    props:['item', 'targetFeature'],
    data(){
      return {
        option: null,
        checked: false,
        title: null,
        timestamp: null,

      }
    },
    watch:{
      trend_data:function(new_val, old_val){

      },
      checked: function(new_val, old_val){
        pipeService.emitCheckIndividual({
          'timestamp': this.timestamp,
          'checked': this.checked
        })
      }
    },

    mounted: function(){
      this.handler = new IndividualSequence(this.$el, this.targetFeature);
      this.handler.on('mouseover', this.handleMouseover);
      this.handler.on('mouseout', this.handleMouseout);
      this.handler.set_Data(this.item);
      this.timestamp = this.item.timestamp;
      // ----------------------------------%%%%%%%%%%%%%%%%%----------------------------------
      let weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let format_date = function(date){
        let month = date.getMonth() >= 9?date.getMonth() + 1:'0' + (date.getMonth() + 1);
        let day = date.getDate() >= 10?date.getDate():'0' + date.getDate();
        let hour = date.getHours() >= 10?date.getHours():'0' + date.getHours();
        let string = date.getFullYear() + '-' + month + '-' + day + ' ' + hour +':00:00  ' + weekDay[date.getDay()];
        return string;
      };
      let toDateTime = function(secs) {
        var t = new Date(1970, 0, 1);
        t.setSeconds(secs);
        return t;
      };
      // ----------------------------------%%%%%%%%%%%%%%%%%----------------------------------
      this.title = format_date(toDateTime(this.item.timestamp));
    },
    methods:{
      handleSelected(params){

      },
      handleMouseover(){
        pipeService.emitMouseOverIndividual(this.item.timestamp)
      },
      handleMouseout(){
        pipeService.emitMouseOverIndividual();
      }
    }
  }
</script>

<style >
  .checkbox{
    padding-top: 3px;
    margin-left: 3px;
  }
  .el-checkbox__label {
    font-family: 'monospace';
    font-size: 10px;
  }
</style>
