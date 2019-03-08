<template>
  <!--<svg class = 'vis_container'></svg>-->
  <div>
  </div>
</template>

<script>
  export default {
    name: "scatterplotView",
    props:['title','scatter_data'],
    watch:{
      scatter_data: function(val){
        console.log('oppo', val);
      }
    }
  }
</script>

<style scoped>

</style>
