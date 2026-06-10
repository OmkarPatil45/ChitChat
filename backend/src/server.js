import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'

import authRoutes from "./routes/auth.route.js" 
import messageRoutes from "./routes/message.route.js"
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import { app, server } from './lib/socket.js';

const __dirname = path.resolve();

dotenv.config();



const PORT = process.env.PORT || 3000

app.use(express.json({limit: "10mb"})) //req.body
app.use(cors({ origin:ENV.CLIENT_URL, credentials:true}))
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ChitChat Backend Running Successfully"
  });
});

server.listen(PORT,() => {
    console.log("Server is running on port " +PORT)
    connectDB()
}
)