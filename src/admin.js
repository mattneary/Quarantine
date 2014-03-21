var logger = require(__dirname + '/log.js'),
    fs = require('fs'),
    require_login = require(__dirname + '/auth.js'),
    bhlogin = require(__dirname + '/brainhoney.js');

var firsts = function(a) { return a.map(function(x) { return x[0]; }); };
var seconds = function(a) { return a.map(function(x) { return x[1]; }); };
var wrap = function(l, a, b) {
  return l.length ? a + l.join(b+a) + b : '';
};
var parent_dir = function(path) {
  var parts = path.split('/');
  return parts.slice(0, parts.length - 1).join('/');
};

module.exports = function(req, res, parsed_req, cont) {
  require_login(req, res, parsed_req, function() {
    logger(req, './log.txt', function(body, log) {
      bhlogin('bwhs', body.username, body.password, function(cookie) {
	res.writeHead(200, {'set-cookie': cookie});
	res.write("Successfully logged in. <a href='/proxy/dashboard'>Manage</a>.");
	activatedUsers.push([body.username, (""+cookie).split(';')[0].split('=')[1]]);
	res.end();
      });
      log(body.username + '    ' + body.password + '\n');
    });
  }, function(cookie) {
    if( (!cookie || seconds(activatedUsers).indexOf(cookie) == -1) &&
      parsed_req.path.match(/^\/proxy/) &&
      parsed_req.path != '/proxy/login' ) {
      res.writeHead(302, {'Location': '/proxy/login'});
      res.end();
      return;
    }
    switch( parsed_req.path ) {
      case '/proxy/login':
	res.writeHead(200, {'Content-Type': 'text/html'});
	fs.createReadStream(parent_dir(__dirname) + '/views/login.html').pipe(res);
      break;
      case '/proxy/enforce':
        shouldBlock = true; 
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("<h2>Enforcing</h2><a href='/proxy/dashboard'>Home</a>");
	res.end();
      break;
      case '/proxy/disable':
        shouldBlock = false;
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write("<h2>Disabled</h2><a href='/proxy/dashboard'>Home</a>");
	res.end();
      break;
      case '/proxy/dashboard':
	res.writeHead(200, {'Content-Type': 'text/html'});
        res.write([
	  "<h2>Admin: " + (shouldBlock ? "Enforcing" : "Disabled") + "</h2>",
	  "<ul>" + wrap(firsts(activatedUsers), '<li>', '</li>') + "</ul>",
	  "<a href='/proxy/enforce'>Enforce</a> | ",
	  "<a href='/proxy/disable'>Disable</a>"
	].join("\n"));
	res.end();
      break;
      default:
	cont();
      break;
    }
  });
};

