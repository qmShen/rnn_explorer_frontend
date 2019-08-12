<template>
  <div>

  </div>
</template>

<script>
  import BoxPlot from './boxplot.js'
  import pipeService  from '../../service/pipeService.js'
  export default {
    name: "InputFeatureBoxplot",
    props: ["item", "selectedFeatureGradient"],
    data() {
      return {
        selectedIndividualMap:{}
      }
    },
    mounted: function(){
      this.boxplotHandler = new BoxPlot(this.$el);
      this.boxplotHandler.set_data(this.item);

      let dictKeyList = function(dict){
        let list = [];
        for(let key in dict){
          list.push(key)
        }
        return list;
      };
      pipeService.onMouseOverIndividual((msg)=>{
        if(msg != undefined){
          this.boxplotHandler.onHoverOn(msg);
        }else{
          this.boxplotHandler.onHoverOut();
        }
      });

      pipeService.onCheckIndividual(msg=>{
        console.log('check msg', msg);
        if(msg.checked == true){
          this.selectedIndividualMap[msg['timestamp']] = true;
          pipeService.emitSelectedIndividuals(dictKeyList(this.selectedIndividualMap));
          let seconds = dictKeyList(this.selectedIndividualMap);
          this.boxplotHandler.onSelect(seconds);
          console.log('selected keys 1', dictKeyList(this.selectedIndividualMap))

        }else if(msg.checked == false){
          delete this.selectedIndividualMap[msg['timestamp']];
          pipeService.emitSelectedIndividuals(dictKeyList(this.selectedIndividualMap));
          let seconds = dictKeyList(this.selectedIndividualMap);
          this.boxplotHandler.removeSelect();
          console.log('selected keys 2', dictKeyList(this.selectedIndividualMap))

        }
      });
    },
    watch:{
      item:function(val){
        console.log('watched feature value', val);

      },
      selectedFeatureGradient: function(new_data){
        this.boxplotHandler.set_selected_data(new_data);
      }
    }
  }
</script>

<style scoped>

</style>
