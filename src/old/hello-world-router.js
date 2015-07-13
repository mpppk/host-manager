var helloWorld = {};
import node = require("node");
import express = require("express");
// var express = require('express');
helloWorld.router = express.Router();

// このメソッドを呼ぶ前に、clientにredis clientを渡す必要がある
helloWorld.router.get('/', function(request, response) {
  if(!helloWorld.client){
    console.log("!!!!client not found in helloWorld.router!!!!");
  }

  // redis incr
  helloWorld.client.incr("count");
  helloWorld.client.get("count", function(err, val){
    // コールバック
    if (err) return console.log(err);
    // エラーが無ければデータを取得できたということ
    response.send('Hello World! ' + val + "times");
    console.log(val);
  });
});

module.exports = helloWorld;
