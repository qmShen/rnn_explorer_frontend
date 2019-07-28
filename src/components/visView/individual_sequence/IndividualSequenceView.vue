<template>
  <div> </div>
</template>

<script>

  import IndividualSequence from "./IndividualSequence.js"

  export default {
    name: "IndividualSequence",
    props:['item'],
    data(){
      return {
        option: null
      }
    },
    watch:{
      trend_data:function(new_val, old_val){

      }
    },

    mounted: function(){
        this.handler = new IndividualSequence(this.$el);
        this.handler.set_Data(this.item)
    },
    methods:{
      handleSelected(params){

      }
    }
  }
</script>

<style scoped>

</style>
