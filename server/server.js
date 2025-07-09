import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from "http";
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

//Create Express app and HTTP server
const app = express();
const server = http.createServer(app)

//Initialize socket.io server
export const io = new Server(server,{
    cors:{origin: "*"}
})

//Stor online users
export const userSocketMap = {};  // {userId: socketId}

//Socket .io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId && userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
        //Emit online users to all connected clients
        console.log("Online users:", Object.keys(userSocketMap));
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        if(userId && userId !== 'undefined') {
            delete userSocketMap[userId];
            console.log("Online users after disconnect:", Object.keys(userSocketMap));
            io.emit("getOnlineUsers",Object.keys(userSocketMap));
        }
    })
})

//Middleware Setup
app.use(express.json({limit:"4mb"}));
app.use(cors());

//Route Setup
app.use("/api/status", (req, res)=> res.send("Server is running"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);

//Connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on port " + PORT));