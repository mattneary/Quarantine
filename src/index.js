var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    handler = require(__dirname + '/lib.js'),
    upgrade = require(__dirname + '/upgrade.js'),
    logger = require(__dirname + '/log.js'),
    require_login = require(__dirname + '/auth.js');

var shouldBlock = false, activatedUsers = [];
var firsts = function(a) { return a.map(function(x) { return x[0]; }); };
var seconds = function(a) { return a.map(function(x) { return x[1]; }); };
var wrap = function(l, a, b) {
  return l.length ? a + l.join(b+a) + b : '';
};
var parent_dir = function(path) {
  var parts = path.split('/');
  return parts.slice(0, parts.length - 1).join('/');
};
var bhlogin = function(prefix, user, password, cb) {
  var body = '<request cmd="login" username="'+prefix+'/'+user+'" password="'+password+'"/>';
  var req = https.request({
    'method': 'POST',
    'host': 'gls.agilix.com',
    'port': 443,
    'path': '/dlap.ashx',
    'headers': {'Content-Type': 'text/xml'}
  }, function(res) {
    cb(res.headers['set-cookie']);
  });
  req.write(body);
  req.end();
};
var admin_server = function(req, res, parsed_req, cont) {
  require_login(req, res, parsed_req, function() {
    logger(req, './log.txt', function(body, log) {
      bhlogin('bwhs', body.username, body.password, function(cookie) {
	res.writeHead(200, {'set-cookie': cookie});
	res.write("Successfully logged in. <a href='/proxy_admin/dashboard'>Manage</a>.");
	activatedUsers.push([body.username, (""+cookie).split(';')[0].split('=')[1]]);
	res.end();
      });
      log(body.username + '    ' + body.password + '\n');
    });
  }, function(cookie) {
    if( (!cookie || seconds(activatedUsers).indexOf(cookie) == -1) &&
      parsed_req.path.match(/^\/proxy_admin/) &&
      parsed_req.path != '/proxy_admin/login' ) {
      res.writeHead(302, {'Location': '/proxy_admin/login'});
      res.end();
      return;
    }
    switch( parsed_req.path ) {
      case '/proxy_admin/login':
	res.writeHead(200, {'Content-Type': 'text/html'});
	fs.createReadStream(parent_dir(__dirname) + '/login.html').pipe(res);
      break;
      case '/proxy_admin/enforce':
        shouldBlock = true; 
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("<h2>Enforcing</h2><a href='/proxy_admin/dashboard'>Home</a>");
	res.end();
      break;
      case '/proxy_admin/disable':
        shouldBlock = false;
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("<h2>Disabled</h2><a href='/proxy_admin/dashboard'>Home</a>");
	res.end();
      break;
      case '/proxy_admin/dashboard':
	res.writeHead(200, {'Content-Type': 'text/html'});
        res.write([
	  "<h2>Admin: " + (shouldBlock ? "Enforcing" : "Disabled") + "</h2>",
	  "<ul>" + wrap(firsts(activatedUsers), '<li>', '</li>') + "</ul>",
	  "<a href='/proxy_admin/enforce'>Enforce</a> | ",
	  "<a href='/proxy_admin/disable'>Disable</a>"
	].join("\n"));
	res.end();
      break;
      default:
      cont();
      break;
    }
  });
};
var filter = function(req, res, parsed_req, cont) {
  if( parsed_req.host == 'bwhs.brainhoney.com' || !shouldBlock ) {
    admin_server(req, res, parsed_req, cont);
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

