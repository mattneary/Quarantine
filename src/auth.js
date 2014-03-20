module.exports = function(req, res, parsed_req, login, cont) {
  var cookie = {};
  (req.headers['cookie'] || '').split(';').forEach(function(pair) {
    pair = pair.split('=');
    cookie[pair[0]] = pair[1];
  });
  if( parsed_req.path == '/Controls/CredentialsUI.ashx' ) {
    login();
  } else {
    cont(cookie['.ASPXAUTH'] || cookie['AZT']);
  }
};

