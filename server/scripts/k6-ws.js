import ws from 'k6/ws';
import { check, sleep } from 'k6';

export const options = { vus: 1000, duration: '30s' };

export default function () {
  const url = 'ws://localhost:3000/socket.io/?EIO=4&transport=websocket';
  const res = ws.connect(url, {}, function (socket) {
    socket.on('open', function () {
      socket.send('2probe');
    });
    socket.on('message', function () {});
    socket.on('close', function () {});
    sleep(1);
  });
  check(res, { 'status is 101': (r) => r && r.status === 101 });
}


