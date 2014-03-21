var Timer = function() {
  var startTime;
  this.start = function() {
    startTime = new Date().getTime();
  };
  this.end = function() {
    return new Date().getTime() - startTime;
  };
};
var timer = new Timer(), verbose = false;
process.on('exit', function() {
  console.log("\nAll tests passed. Finishing.");
});
module.exports = function(assertion, fn, verbose) {
  timer.start();
  var resp = fn();
  if( resp !== true ) {
    throw new Error("\x1B[31mFailed\x1B[39m `"+assertion+"`!", JSON.stringify(resp));
  } else {
    if( verbose ) console.log("\x1B[32mPassed\x1B[39m `"+assertion+"` in "+timer.end()+" ms.");
    process.stdout.write(".");
  }
};

