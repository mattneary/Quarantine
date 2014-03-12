var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    handler = require(__dirname + '/lib.js'),
    upgrade = require(__dirname + '/upgrade.js'),
    logger = require(__dirname + '/log.js'),
    require_login = require(__dirname + '/auth.js');

var shouldBlock = false, activatedUsers = [];
var wrap = function(l, a, b) {
  return l.length ? a + l.join(b+a) + b : '';
};
var admin_server = function(req, res, parsed_req) {
  require_login(req, res, parsed_req, function() {
    logger(req, './log.txt', function(body, log) {
      res.write(body.username + ': ' + body.password);
      res.end();
      log(body.username + '    ' + body.password);
    });
  }, function() {
    switch( parsed_req.path ) {
      case '/proxy_admin/enforce':
        shouldBlock = true; 
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("<h2>Enforcing</h2><a href='/proxy_admin'>Home</a>");
	res.end();
      break;
      case '/proxy_admin/disable':
        shouldBlock = false;
	activatedUsers = [];
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("<h2>Disabled</h2><a href='/proxy_admin'>Home</a>");
	res.end();
      break;
      default:
	res.writeHead(200, {'Content-Type': 'text/html'});
        res.write([
	  "<h2>Admin: " + (shouldBlock ? "Enforcing" : "Disabled") + "</h2>",
	  "<ul>" + wrap(activatedUsers, '<li>', '</li>') + "</ul>",
	  "<a href='/proxy_admin/enforce'>Enforce</a> | ",
	  "<a href='/proxy_admin/disable'>Disable</a>"
	].join("\n"));
	res.end();
      break;
    }
    res.write("Admin\n");
    res.end();
  });
};
var filter = function(req, res, parsed_req, cont) {
  if( parsed_req.host == 'bwhs.brainhoney.com' || !shouldBlock ) {
    if( parsed_req.path == '/Controls/CredentialsUI.ashx' ) {
      logger(req, './log.txt', function(body, log) {
	shouldBlock && activatedUsers.push(body.username);
      });
    } else if( parsed_req.path.match(/^\/proxy_admin/) ) {
      admin_server(req, res, parsed_req);
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

