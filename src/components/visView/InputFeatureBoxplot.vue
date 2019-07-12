<template>
  <div>

  </div>
</template>

<script>
  import BoxPlot from './boxplot.js'
  export default {
    name: "InputFeatureBoxplot",
    props: ["item"],
    data() {
      return {

      }
    },
    mounted: function(){
      this.boxplotHandler = new BoxPlot(this.$el);
      this.boxplotHandler.set_data(this.item);
    },
    watch:{
      item:function(val){
        console.log('watched feature value', val);

      }
    }
  }
</script>

<style scoped>

</style>
