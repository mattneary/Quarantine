var assert = require(__dirname + '/test.js');
module.exports = function(desc, fn) {
  fn(function(result) {
    assert(desc, function() { return result; });
  });
};

