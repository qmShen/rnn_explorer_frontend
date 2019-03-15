<template>
  <div >
    <div class = "scatter_container boundary">
      <div class="mini_head">
        <div class = 'mini_title'>Input</div>
      </div>
      <scatterplotView class = 'input_scatter'
                       :scatter_data = 'input_scatter'>
      </scatterplotView>
    </div>

    <!--<div class = "scatter_container boundary">-->
      <!--<div class="mini_head">-->
        <!--<div class = 'mini_title'>Confusion matrix</div>-->
      <!--</div>-->
      <!--<ConfusionMatrix :trend_data = "trend_data"-->
                       <!--class='matrix_container'>-->

      <!--</ConfusionMatrix>-->
    <!--</div>-->
  </div>
</template>

<script>
  import scatterplotView from './visView/ScatterplotView.vue'
  import ConfusionMatrix from './visView/ConfusionMatrix.vue'

  export default {
    name: "StatisticsView",
    props:['input_scatter','trend_data'],
    components: {
      scatterplotView,
      ConfusionMatrix
    },
    data(){
      return{

      }
    },
    mounted(){


    },
    computed:{
    },
    methods:{

    },
    watch:{

    }

  }
</script>

<style scoped>

  .scatter_container{
    height: calc(100%);
  }
  .input_scatter{
    height: calc(100% - 38px - 20px - 10px);
  }
  .unit_container{
    height: calc(100% - 20px);
  }
  .matrix_container{
    height: calc(100% - 20px);
  }
</style>
