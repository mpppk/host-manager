var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// redis
var port = process.env.REDIS_PORT_6379_TCP_PORT;
var host = process.env.REDIS_PORT_6379_TCP_ADDR;
var client = require('redis').createClient(port, host);

// redisの動作チェック用Router アクセスするたびにcountが増える
var helloWorld = require('./hello-world-router');
helloWorld.client = client;
app.use('/hello', helloWorld.router);
// host manager Router
var hostManager = require('./host-manager');
hostManager.client = client;
app.use('/host', hostManager.router);
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
