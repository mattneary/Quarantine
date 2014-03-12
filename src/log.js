var fs = require('fs');
var parse_body = function(body) {
  var pairs = body.split('&'),
      dict = {};
  pairs.map(function(pair) {
    return pair.split('=');
  }).forEach(function(pair) {
    dict[pair[0]] = pair[1];
  });
  return dict;
};
module.exports = function(req, file, map) {
  map = map || function(x) { return x; };
  var log = fs.createWriteStream(file, { flags: 'a' });
  var chunks = [];
  req.on("data", function(ch){
    chunks.push(ch);
  });
  req.on("end", function() {
    var body = parse_body(chunks.join(''));
    map(body, function(x) { log.write(x); });
  });
};

