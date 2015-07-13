import express = require("express");
import hello = require("./hello-world-router");

var app : express.Express = express();

app.set("port", (process.env.PORT || 5000));
app.use(express.static(__dirname + "/public"));

// redis
var port : string = process.env.REDIS_PORT_6379_TCP_PORT;
var host : string = process.env.REDIS_PORT_6379_TCP_ADDR;

app.use("/hello", hello.getHelloWorldRouter(port, host));

var client = require("redis").createClient(port, host);

app.listen(app.get("port"), function() {
  console.log("Node app is running on port", app.get("port"));
});
