import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  const sockets = userSocketMap[userId];
  if (!sockets || sockets.length === 0) return null;
  // Return the first socket id for the user
  return sockets[0];
}

// used to store online users
const userSocketMap = {}; // {userId: [socketId1, socketId2, ...]}

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    try {
      const user = await User.findById(userId);
      if (user && user.showLastSeen) {
        if (!userSocketMap[userId]) {
          userSocketMap[userId] = [];
        }
        userSocketMap[userId].push(socket.id);
      }
    } catch (error) {
      console.error("Error fetching user for socket connection:", error);
    }
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter((id) => id !== socket.id);
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
        // Update lastOnline when user fully disconnects
        try {
          await User.findByIdAndUpdate(userId, { lastOnline: new Date() });
        } catch (error) {
          console.error("Error updating lastOnline:", error);
        }
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
