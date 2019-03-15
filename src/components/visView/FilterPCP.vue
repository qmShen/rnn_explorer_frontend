<template>
  <div>

    This is pcp
  </div>
</template>

<script>
  export default {
    name: "FilterPCP",
    props:["selected_feature_values"],
    mounted:function(){
      console.log('erer3', this.selected_feature_values)
    },
    watch:{
      selected_feature_values:function(new_val, old_val){
        console.log('erer2', new_val)
      },
    }

  }

</script>

<style scoped>

</style>
