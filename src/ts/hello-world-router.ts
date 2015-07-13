import express = require("express");
import redis = require("redis");

export function getHelloWorldRouter(port: string, host: string): express.Router{
  var client = redis.createClient(port, host);
  var router = express.Router();

  router.get("/", (request, response) => {
    if(!client){
      console.log("!!!!client not found in router!!!!");
    }

    // redis incr
    client.incr("count");
    client.get("count", (err, val) => {
      // callback
      if (err){ return console.log(err); }
      // エラーが無ければデータを取得できたということ
      response.send("Hello World! " + val + "times");
      console.log(val);
    });
  });
  return router;
}


/*var helloWorld : {router: express.Router};


// このメソッドを呼ぶ前に、clientにredis clientを渡す必要がある
router.get('/', function(request, response) {
  if(!helloWorld.client){
    console.log("!!!!client not found in router!!!!");
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

module.exports = helloWorld;*/
