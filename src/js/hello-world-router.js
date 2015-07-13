var express = require("express");
var redis = require("redis");
function getHelloWorldRouter(port, host) {
    var client = redis.createClient(port, host);
    var router = express.Router();
    router.get("/", function (request, response) {
        if (!client) {
            console.log("!!!!client not found in router!!!!");
        }
        client.incr("count");
        client.get("count", function (err, val) {
            if (err) {
                return console.log(err);
            }
            response.send("Hello World! " + val + "times");
            console.log(val);
        });
    });
    return router;
}
exports.getHelloWorldRouter = getHelloWorldRouter;
