<template>
  <div> </div>
</template>

<script>

  import IndividualSequence from "./GradientScatter.js"

  export default {
    name: "GradientScatter",
    props:['gradientScatter'],
    data(){
      return {
        option: null
      }
    },
    watch:{
      gradientScatter:function(new_val, old_val){
        console.log('gradientScatter', new_val);
      }
    },

    mounted: function(){
      console.log('gradient scatter inited!')
    },
    methods:{
      handleSelected(params){

      }
    }
  }
</script>

<style scoped>

</style>
