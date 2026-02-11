import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000");

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  (global as any).io = io;

  io.on("connection", (socket) => {
    console.log("[Socket.IO] Client connected:", socket.id);

    socket.on("subscribe:device", (deviceId: string) => {
      socket.join(`device:${deviceId}`);
    });

    socket.on("subscribe:all", () => {
      socket.join("all-devices");
    });

    socket.on("unsubscribe:device", (deviceId: string) => {
      socket.leave(`device:${deviceId}`);
    });

    socket.on("disconnect", () => {
      console.log("[Socket.IO] Client disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Terrano GPS ready on http://${hostname}:${port}`);
  });
});
