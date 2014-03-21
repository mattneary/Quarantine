var admin_server = require(__dirname + '/admin.js');
module.exports = function(req, res, parsed_req, cont) {
  if( parsed_req.host == 'bwhs.brainhoney.com' || !shouldBlock ) {
    admin_server(req, res, parsed_req, cont);
  } else {
    res.write("Permission Denied");
    res.end();
  }
};

