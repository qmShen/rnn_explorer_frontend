<template>
  <div style="height: 100%; width: 100%">
  </div>
</template>

<script>
  import FeaturePCP from './FeaturePCP.js'
  import dataService from "../../service/dataService.js"


  export default {
    name: "FeaturePCP",
    props: ["feature_values_scaled"],
    data() {
      return {
        FeaturePCP: null,

      }
    },
    mounted: function(){
      console.log('feature_pcp_mounted!');
      this.FeaturePCP = new FeaturePCP(this.$el);
    },
    watch:{
      feature_values_scaled:function(val){
//        console.log('watched feature value', val);
        if(val){
          this.FeaturePCP.set_data(val);
        }
      }
    }
  }
</script>

<style scoped>

</style>
