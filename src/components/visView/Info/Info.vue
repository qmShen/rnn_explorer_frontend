<template>
  <div style="display: block; position: relative">
    <div style="height: 100%; width: 100%" id='map_container'></div>
    <div style="position:absolute; left: 0px; top:0px; z-index: 999; font-size: 10px" >Model Name: {{model_name}}</div>
  </div>
</template>

<script>


  import * as d3 from "d3";
  import Map from './map.js'
  import 'leaflet/dist/leaflet.css'
  export default {
    name: "Info",
    props: ['model_name', 'target_feature', 'targetStation', 'regionSector'],
    data() {
      return {

      }
    },
    mounted: function(){
//        this.$el
      this.handler = new Map('map_container', this.targetStation);
      console.log('Map loaded!')


    },
    watch:{
      regionSector: function(new_val, old_val){
        this.handler.set_region_data(new_val);
      }
    },

  }
</script>

<style scoped>

</style>
