module.exports = function(req, res, parsed_req, login, cont) {
  var cookie = {};
  (req.headers['cookie'] || '').split(';').forEach(function(pair) {
    pair = pair.split('=');
    cookie[pair[0]] = pair[1];
  });
  if( parsed_req.path == '/proxy_admin/login' ) {
    login();
  } else if( cookie['.ASPXAUTH'] ) {
    cont();
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="/proxy_admin/login" method="POST"><input type="text" name="username"><input type="password" name="password"><input type="submit"></form>');
    res.end();
  }
};

