//import WebSocket, { WebSocketServer } from "ws";
import { Server as WebSocketServer } from "socket.io";
import { createServer } from "http";

const port = 8080;
const ip_http = `localhost`;

const http_server = createServer(); //Create http server
const server_socket = new WebSocketServer(http_server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

server_socket.on("connection", function connection(socket) {
  console.log("Conexión recibida");
  server_socket.on("update", function update(data) {
    //console.log("Update received");
    console.log(data);
  });
});



//LISTEN HTTPSERVER REQUEST
http_server.listen(port, ip_http, () => {
  console.log(`Server running at http://${ip_http}:${port}/`);
});

/**
 * const ip = req.socket.remoteAddress;
  
  ws.on("message", function incoming(message) {
    console.log(`received: ${message} from ${ip}`);

    if (message === "close") {
      ws.send("Closing web socket server...");
      ws.close();
    }
  });

  ws.send("message received");
 */