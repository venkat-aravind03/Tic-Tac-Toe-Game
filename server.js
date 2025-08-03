const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on("connection", (socket) => {
  socket.on("create-room", (roomId) => {
    socket.join(roomId);
    rooms[roomId] = [socket.id];
    socket.emit("room-created", roomId);
  });

  socket.on("join-room", (roomId) => {
    if (rooms[roomId] && rooms[roomId].length === 1) {
      socket.join(roomId);
      rooms[roomId].push(socket.id);
      io.to(roomId).emit("start-game", rooms[roomId]);
    } else {
      socket.emit("room-full");
    }
  });

  socket.on("make-move", ({ roomId, index, player }) => {
    socket.to(roomId).emit("opponent-move", { index, player });
  });

  socket.on("reset-board", (roomId) => {
    io.to(roomId).emit("reset-game");
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
