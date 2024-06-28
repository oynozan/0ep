require("dotenv").config();
import express, { type Application } from "express";
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import socket from './socket';
import routes from "./routes";

mongoose.connect(process.env.MONGO_URI!); // MongoDB

const app: Application = express();
const server = require("http").createServer(app);

/* Middlewares */
const whitelist = ["https://0ep.net"];
if (process.env.NODE_ENV == "development")
    whitelist.push("http://localhost:3000");

app.use(cors({ origin: whitelist, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);

/* Socket.io */
const io = new SocketIOServer(server, {
    cors: { origin: whitelist }
});

// Start the Socket listener
socket(io);

// Start the server
server.listen(process.env.PORT, () => console.log(`0ep Server is running on port ${process.env.PORT}`));