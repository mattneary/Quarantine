var Timer = function() {
  var startTime;
  this.start = function() {
    startTime = new Date().getTime();
  };
  this.end = function() {
    return new Date().getTime() - startTime;
  };
};
var timeSpent = 0;
var opts = { timer: new Timer(), verbose: false };
process.on('exit', function() {
  console.log("\nAll tests passed in "+timeSpent+" ms. Finishing.");
});
module.exports = function(assertion, fn) {
  this.timer = this.timer === undefined ? opts.timer : this.timer;
  this.verbose = this.verbose === undefined ? opts.verbose : this.verbose;
  this.timer.start();
  var resp = fn();
  if( resp !== true ) {
    throw new Error("\x1B[31mFailed\x1B[39m `"+assertion+"`!", JSON.stringify(resp));
  } else {
    var duration = this.timer.end();
    if( this.verbose ) console.log("\x1B[32mPassed\x1B[39m `"+assertion+"` in "+duration+" ms.");
    timeSpent += duration;
    process.stdout.write(".");
  }
};

