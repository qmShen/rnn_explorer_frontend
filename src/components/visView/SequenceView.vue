<template>
  <svg>

  </svg>
</template>

<script>
  // import Sequence from './sequence.js'
  // import Sequence from './sequence_imp.js'
  // import Sequence from './sequence_theme.js'
   import Sequence from './sequence_horizonchart.js'
//  import Sequence from './sequence_horizonchart_3seg.js'
  export default {
    name: "SequenceView",
    props:['gradients_io',"gradients_io_cluster"],
    watch:{
      gradients_io_cluster:function(new_data){
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
  svg{
    height: 50000px
  }
</style>
