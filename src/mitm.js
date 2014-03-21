var parse_url = function(url) {
  var secure = url.match(/^https/),
      parts = url.replace(/^https?:\/\//, '').split('/'),
      host = parts[0],
      domain = host.split(':')[0];
  return {
    host: domain,
    port: parseInt(host.split(':')[1], 10) || (secure ? 443 : 80),
    path: '/' + (parts.slice(1).join('/') || '')
  };
};
var parse_req = function(req) {
  var url = parse_url(req.url);
  url.method = req.method;
  url.headers = req.headers;
  return url;
};
module.exports = function(connector, filter, req_map) {
  req_map = req_map || function(x) { return x; };
  return function(req, res) {
    var parsed_req = parse_req(req_map(req)); 
    filter(req, res, parsed_req, function() {
      var fetcher = connector.request(
        parsed_req,
	function(fetch) {
	  res.writeHead(fetch.statusCode, fetch.headers);
	  fetch.pipe(res);
	});
      fetcher.on("error", function() {});
      req.pipe(fetcher);
    });
  };
};

