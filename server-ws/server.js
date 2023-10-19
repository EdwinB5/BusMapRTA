//import WebSocket, { WebSocketServer } from "ws";
import { Server as WebSocketServer } from "socket.io";
import { createServer } from "http";

const port = 8080;
const ip_http = `localhost`;

const data_rta = ["Bus1", "Bus2", "Bus3"];

const http_server = createServer(); //Create http server
const server_socket = new WebSocketServer(http_server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

server_socket.on("connection", (socket_client) => {

  console.log(`Connection received ${socket_client.handshake.address}`);

  socket_client.on("change", (data) => {
    console.log(data.message);
    server_socket.emit("data_rta", data_rta);
  });

  socket_client.on("disconnect", () => {
    console.log(
      `Client disconnected, ${socket_client.id}}, from ${socket_client.handshake.address}`
    );
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
