var net = require('net');
module.exports = function(socket, host, port) {
  var relay = net.createConnection(port, host);
  relay.on('connect', function() {
    socket.write([
      "HTTP/1.0 200 Connection established",
      "Proxy-agent: Netscape-Proxy/1.1"
    ].join("\r\n") + "\r\n\r\n"); 
  });

  relay.on( 'data', function(d) { socket.write(d); });
  socket.on('data', function(d) { try { relay.write(d); } catch(err) {}});

  relay.on( 'end',  function() { socket.end(); });
  socket.on('end',  function() { relay.end(); });

  relay.on( 'close',function() { socket.end(); });
  socket.on('close',function() { relay.end(); });

  relay.on( 'error',function() { socket.end(); });
  socket.on('error',function() { relay.end(); });
};

