import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { ENV } from "./env.js";
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true,
    },
})

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware)

// use this function to check if a user is online or not
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}


// for storing online users
const userSocketMap = {};  // {userId: socketId}

io.on("connection", (socket) => {
    console.log("A user connected", socket.user.fullName)
    
    // store user's socket ID   
    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    //io.emit() is used to send events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    // handle disconnection i.e when user closes the browser or is offline
    // with socket.on we can listen to events from clients
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.user.fullName);
        delete userSocketMap[userId];
        
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export { io, app, server};