var assert = require(__dirname + '/test.js');
var AsyncTimer = function() {
  var startTime;
  this.start = function() {};
  this.startAsync = function() {
    startTime = new Date().getTime();
  };
  this.end = function() {
    return new Date().getTime() - startTime;
  };
};
module.exports = function(desc, fn) {
  var timer = new AsyncTimer();
  timer.startAsync();
  fn(function(result) {
    assert.call({
      timer: timer, 
      verbose: false
    }, desc, function() { return result; });
  });
};

