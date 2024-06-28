import type { Server as SocketIOServer } from 'socket.io';

export default function(io: SocketIOServer) {
    io.on("connection", socket => {
        
    })
}