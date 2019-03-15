<template>
  <svg>

  </svg>
</template>

<script>
  import Sequence from './sequence.js'
  export default {
    name: "SequenceView",
    props:['gradients_io'],
    watch:{
      gradients_io:function(new_data){
        this.sequence.update_sequence_render(new_data);
      }
    },
    mounted: function(){
      this.sequence = new Sequence(this.$el);
        console.log('Sequence mounted!!');
    },
  }


</script>

<style scoped>

</style>
