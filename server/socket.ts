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
    console.log(decodedUser);

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

async function setReadMessage(wallet: string, secretKey: string): Promise<void> {
    const chatType = (await channelDB.findOne({ secret: secretKey }, { type: 1 }))?.type;
    if (chatType === "imported" || !chatType) return; // There's no read data in imported chats

    const readKey = `read.${wallet}`;
    const readObj: any = {};
    readObj[readKey] = new Date();

    await channelDB.updateOne({ secret: secretKey }, readObj);
    return;
}

export default function(io: SocketIOServer) {
    io.on("connection", socket => {
        socket.on('join-room', async ({ id, secretKey }) => {
            if (!secretKey || !id) return;
            const user = await getChatUser(socket, id, secretKey);

            if (!user) return socket.emit("join-room-response", {
                success: false,
                message: "You're not an attendee of this chat!"
            });

            await setReadMessage(user.wallet, secretKey);

            socket.join(id);
            socket.emit("join-room-response", { success: true });
        });

        socket.on('send-message', async ({ id, message, secretKey }) => {
            if (!secretKey || !id || !message?.trim()) return;
            const user = await getChatUser(socket, id, secretKey);

            if (!user) return socket.emit("message-response", {
                success: false,
                message: "You're not an attendee of this chat!"
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

        socket.on("update-read", async ({ id, secretKey }) => {
            if (!secretKey || !id) return;
            const user = await getChatUser(socket, id, secretKey);

            await setReadMessage(user.wallet, secretKey);

            // Send which user has updated read data
            io.to(id).emit("read-data", { wallet: user.wallet });
        });
    })
}