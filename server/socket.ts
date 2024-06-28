const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

import { parse } from 'cookie';
import type { Socket, Server as SocketIOServer } from 'socket.io';
import Encryption from './funcs/encryption';
import channelDB from './db/channelSchema';

async function getChatUser(socket: Socket, id: string, secretKey: string): Promise<any> {
    const rawCookie = socket.handshake.headers.cookie || "";
    const cookie = parse(rawCookie);
    const token = cookie?.["access-token"];

    if (!token) return false;

    const decodedUser = Encryption.decodeJwt(token);

    // Be sure user has access to the room
    const isParticipant = await channelDB.countDocuments({
        _id: new ObjectId(id),
        secret: secretKey,
        "participants.wallet": {
            $in: decodedUser?.wallet
        }
    });

    if (isParticipant) return decodedUser;
    return false;
}

export default function(io: SocketIOServer) {
    io.on("connection", socket => {
        socket.on('join-room', async ({ id, secretKey }) => {
            if (!secretKey || !id) return;
            const user = await getChatUser(socket, id, secretKey);

            if (!user) return socket.emit("join-room-response", {
                success: false,
                message: "You're not a attendee of this chat!"
            });

            socket.join(id);
            socket.emit("join-room-response", { success: true });
        });

        socket.on('send-message', async ({ id, message, secretKey }) => {
            if (!secretKey || !id || !message?.trim()) return;
            const user = await getChatUser(socket, id, secretKey);

            if (!user) return socket.emit("message-response", {
                success: false,
                message: "You're not a attendee of this chat!"
            });

            message = message.trim();

            try {
                // const encryptedMessage = Encryption.encryptMessage(message, secretKey);
                const encryptedMessage = message;

                // Save message to database
                await channelDB.updateOne(
                    {
                        _id: new ObjectId(id),
                        secret: secretKey,
                    },
                    {
                        $push: {
                            messages: {
                                message: encryptedMessage,
                                by: user.wallet,
                                date: new Date()
                            }
                        }
                    }
                )
    
                io.to(id).emit('message-response', {
                    message: encryptedMessage,
                    by: user.wallet,
                    date: new Date()
                });
            } catch (e) {
                console.error(e);

                return socket.emit("message-response", {
                    success: false,
                    message: "An error has occured."
                });
            }
        });
    })
}