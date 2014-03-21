var https = require('https');
module.exports = function(prefix, user, password, cb) {
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

