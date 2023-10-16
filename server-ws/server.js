import WebSocket, { WebSocketServer } from "ws";

const port = 8080;
const ws = new WebSocketServer({ port });
const config_server = ws.address();
console.log("-----------------------------------")
console.log("Server On")
console.log(`Port: ${config_server.port}`);
console.log(`Ip: ${config_server.address}`);
console.log("-----------------------------------");

ws.on("connection", function connection(ws, req) {
  const ip = req.socket.remoteAddress;
  ws.on("message", function incoming(message) {
    console.log(`received: ${message} from ${ip}`);

    if (message === "close") {
      ws.send("Closing web socket server...");
      ws.close();
    }
  });

  ws.send("message received");
});
