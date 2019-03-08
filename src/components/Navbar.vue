<template>
  <!--<ul class="navbar-container">-->
  <!--<li class="navbar-button"><a class="active" href="#home">Street View Analysis</a></li>-->
  <!--<slot name="header">-->
  <!--</slot>-->
  <!--</ul>-->

  <el-menu  theme="dark"  class="el-menu-demo navbar-container" mode="horizontal" >
    <el-menu-item class="title-name" index="1">RNN Explorer</el-menu-item>
    <slot name="header">

    </slot>
  </el-menu>
</template>


<script>
  import dataService from '../service/dataService.js'

  export default {
    name: 'navbar',
    data(){
      return {
        title: 'RNN_explorer',
        buttons: [
          {'name': 'Start', 'link': "http://www.huamin.org/"},

        ],
        data: null
      }
    },
    methods:{
      clcTest(){
        let _this = this;
        dataService.getTestData(function(promise){
          console.log('promise', promise);
          _this.data = promise.data;
        })
      },
      testGetAllCity(){
        dataService.getAllRecordsForOneCity('hk', function(data){
          console.log('promise', data);
        })
      }
    }
  }
</script>

<style scoped>
  .navbar-container {
    list-style-type: none;
    margin-bottom: 2px;
    border-radius: 4px;
    overflow: hidden;
    background-color: #d3dce6;
  }
  .title-name{
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    font-size: 20px;
    left: 100px;

  }
  li.navbar-button {
    float: left;
  }

  li.navbar-button a, .dropbtn {
    display: inline-block;
    color: white;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
  }

  li.navbar-button a:hover, .dropdown:hover .dropbtn {
    background-color: #73ff4d;
  }

  .dropdown {
    display: inline-block;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  }

  .dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }

  .dropdown-content a:hover {background-color: #f1f1f1}

  .dropdown:hover .dropdown-content {
    display: block;
  }
</style>
