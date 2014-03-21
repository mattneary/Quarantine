var mitm = require(__dirname + '/../src/mitm'),
    http = require('http'),
    assert = require(__dirname + '/test.js'),
    assert_async = require(__dirname + '/async_test.js');

assert_async("Verify mitm-proxy for basic http GET.", function(cb) {
  var http = require('http');
  var dest_server = http.createServer(function(req, res) {
    res.write("Success.");
    res.end();
  }).listen(80);
  var proxy_server = http.createServer(mitm(
    http, function(req, res, parsed, cb) { cb(); }
  )).listen(8080);

  var req = http.request({
    method: 'GET',
    host: 'localhost',
    port: '8080',
    path: 'http://localhost'
  }, function(res) {
    var b = [];
    res.on("data", function(c) { b.push(c); });
    res.on("end", function() {
      dest_server.close();
      proxy_server.close();
      cb(b.join('') == 'Success.');
    });
  });
  req.end();
});


