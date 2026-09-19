const net = require('net');

const host = 'merida.cob.csuchico.edu';
const portsToTest = [8000, 8038, 3800, 44300, 44338, 8001, 8080];

console.log(`[PORT TEST] Scanning ports on ${host}...`);

portsToTest.forEach(port => {
  const socket = new net.Socket();
  socket.setTimeout(2000);

  socket.on('connect', () => {
    console.log(`[PORT OPEN] SUCCESS! Port ${port} is OPEN on ${host}`);
    socket.destroy();
  });

  socket.on('timeout', () => {
    console.log(`[PORT CLOSED/TIMEOUT] Port ${port} timed out.`);
    socket.destroy();
  });

  socket.on('error', (err) => {
    console.log(`[PORT ERROR] Port ${port}: ${err.message}`);
    socket.destroy();
  });

  socket.connect(port, host);
});
