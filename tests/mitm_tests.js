var mitm = require(__dirname + '/../src/mitm'),
    http = require('http'),
    assert = require(__dirname + '/test.js'),
    assert_async = require(__dirname + '/async_test.js');

var start_servers = function(dest, port) {
  var dest_server = http.createServer(dest).listen(80);
  var proxy_server = http.createServer(mitm(
    http, function(req, res, parsed, cb) { cb(); }
  )).listen(port);
  return [dest_server, proxy_server];
};
var tunnel_request = function(method, port, url, cb) {
  return http.request({
    method: method,
    host: 'localhost',
    port: port,
    path: url
  }, function(res) {
    var b = [];
    res.on("data", function(c) { b.push(c); });
    res.on("end", function() {
      cb(b.join(''));
    });
  });
};
var tunnel_get = function(port, url, cb) {
  tunnel_request('GET', port, url, cb).end();
};
var tunnel_post = function(port, url, body, cb) {
  var req = tunnel_request('POST', port, url, cb);
  req.write(body);
  req.end();
};

assert_async("Verify mitm-proxy for basic http GET.", function(cb) {
  var http = require('http');
  var servers = start_servers(function(req, res) {
    res.write("Success.");
    res.end();
  }, 8080);

  tunnel_get(8080, "http://localhost", function(body) {
    servers.map(function(server){ server.close(); });
    cb(body == 'Success.');
  });
});


