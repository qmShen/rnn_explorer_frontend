<template>
  <div id="app">
    <!--<Navbar></Navbar>-->
    <MainView/>
  </div>
</template>

<script>

  import HelloWorld from './components/HelloWorld.vue'
  import MainView from './components/MainView.vue'
  import Navbar  from './components/Navbar.vue'

  export default {
    name: 'App',
    components: {
      HelloWorld,
      MainView,
      Navbar
    }
  }
</script>

<style>
  #app {
    font-family: Helvetica Neue, Helvetica, PingFang SC,Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    color: #2c3e50;
    margin-top: 0px;
    height: calc(98vh - 0px);
  }

  .mini_head{
    background: rgb(243,243,243);
    width: 100%;
    height: 20px;
  }
  .mini_title{
    font-family: 'monospace';
    height: 20px;
    font-size: 13px;
    padding-left: 3px;
    display: table-cell;
    vertical-align: middle;
  }

  .boundary{
    border-style: dashed;
    border-color: #d3dce6;
    border-width: 1px;
  }

  .el-dialog__body{
    height: 50vh
  }
</style>
