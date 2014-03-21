var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    handler = require(__dirname + '/mitm.js'),
    filter = require(__dirname + '/filter.js'),
    upgrade = require(__dirname + '/upgrade.js');

global.shouldBlock = false;
global.activatedUsers = [];

https.createServer({
  key: fs.readFileSync('certs/key.pem'),
  cert: fs.readFileSync('certs/cert.pem')
}, handler(https, filter, function(req) {
  req.url = 'https://' + req.headers['host'] + req.url;
  return req;
})).listen(8081);

http.createServer(handler(http, filter)).on('upgrade', function(req, socket, head) {
  upgrade(socket, 'localhost', 8081);
}).listen(8080);

