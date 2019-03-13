<template>
  <div>
    <svg></svg>
    <div class="block">
      <span class="demonstration"></span>
      <el-slider v-model="value" :show-tooltip="false"></el-slider>
    </div>
  </div>
</template>

<script>

  import Scatter from "./scatterplot.js"
  export default {
    name: "scatterplotView",
    props:['scatter_data'],

    mounted:function(){
      this.scatterplot = new Scatter(this.$el);
    },

    watch:{

      "value": function(val){
        if(val !=null){
          this.move(val)
        }
      },

      scatter_data: function(val){
        if(val != null){
          this.update_scatter(val)
        }
      }
    },

    methods:{
      update_scatter(data){
        this.scatterplot.update_render(data)
      },

      move(data){
        this.scatterplot.move_render(data)
      }
    },

    data() {
      return {
        value:0
      }
    },

  }
</script>

<style scoped>

</style>
