/**
 * Created by yiding on 2017/1/12.
 */
import Vue from 'vue'

var pipeService = new Vue({
  data:{
    SELECTEDSCATTER: 'select_scatter_plot',
    SEQUENCESELECTED: 'sequence_selected',
    SUBGROUPSELECTED: 'subgroup_selected'

  },

  methods:{
    emitSelectedScatterPlot: function(msg){
      this.$emit(this.SELECTEDSCATTER, msg);
    },
    onSelectedScatterPlot: function(callback){
      this.$on(this.SELECTEDSCATTER,function(msg){
        callback(msg);
      })
    },
    //------------------------------------------------------------
    //This is for select cities
    emitSequenceSelected: function(msg){
      this.$emit(this.SEQUENCESELECTED, msg);
    },
    onSequenceSelected: function(callback){
      this.$on(this.SEQUENCESELECTED,function(msg){
        callback(msg);
      })
    },

    //------------------------------------------------------------
    //When a subgroup is selected in distribution view, emit this message
    emitSubgroupSelected: function(msg){
      this.$emit(this.SUBGROUPSELECTED, msg);
    },
    onSubgroupSelected: function(callback){
      this.$on(this.SUBGROUPSELECTED,function(msg){
        callback(msg);
      })
    },
  }
});

export default pipeService
