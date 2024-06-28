import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import socket from "../../lib/socket";
import { decrypt, F, truncateWalletAddress } from "../../lib/helpers";
import ChannelPicture from '../../components/Channels/ChannelPicture';
import { type IMessage, useChatStore, useRoomsStore, useUserStore } from "../../lib/states";

import { FaPaperPlane } from "react-icons/fa";

import "./chat.scss";

export default function Chat() {
    const { id } = useParams(); // Chat ID

    const lastMessage = useRef<null | HTMLDivElement>(null);

    const user = useUserStore(s => s.user);
    const chat = useChatStore();
    const rooms = useRoomsStore(s => s.rooms);
    const setRooms = useRoomsStore(s => s.setRooms);
    const setChat = chat.setChat;

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Array<any>>(chat.messages);

    useEffect(() => {
        // Get chat details
        F({
            endpoint: "/channel/room?id=" + id,
            method: "GET",
        })
            .then(room => {
                room = room.chat;

                setChat({
                    id: room._id,
                    secret: room.secret,
                    type: room.type,
                    title: room.title,
                    users: room.participants,
                    messages: room.messages,
                });

                // Set page title
                document.title = truncateWalletAddress(room.title) + " - 0ep";
            })
            .catch(err => {
                console.error(err);
                toast.error(err.message);
            });
    }, [id]);

    useEffect((): any => {
        if (user && chat) {
            socket.emit("join-room", { id, secretKey: chat.secret });
            socket.off("join-room-response");
            socket.on("join-room-response", response => {
                if (response.success === false) {
                    toast.error(response.message);
                    return;
                }

                // Decrypt messages
                const encryptedMessages = chat.messages;
                const decryptedMessages: IMessage[] = [];

                for (let m of encryptedMessages) {
                    m["message"] = decrypt(m.message, chat.secret as string);
                    decryptedMessages.push(m);
                }

                setMessages(decryptedMessages);
            });

            return () => {
                socket.off("join-room-response");
            };
        }
    }, [user, chat]);

    useEffect(() => {
        socket.off("message-response");
        socket.on("message-response", response => {
            if (response?.success === false) {
                toast.error(response.message);

                // Delete message that added in client before waiting a request from server
                setMessages(s => {
                    const _ = [...s];
                    _.splice(_.length - 1, 1);
                    return _;
                });

                return;
            }

            // Decrypt new message
            response["message"] = decrypt(response.message, chat.secret as string);

            console.log(response);

            // Add to the messages array
            if (response.by !== user!.wallet) setMessages(s => [...s, response]);

            // Update last message in rooms state
            setRooms(
                rooms.map(room =>
                    room.id === id
                        ? {
                            ...room,
                            lastMessage: {
                                message: response["message"],
                                by: user!.wallet,
                                date: new Date(),
                            }
                        }
                        : room
                )
            );
        });

        // Scroll to bottom
        lastMessage.current?.scrollIntoView({ behavior: "instant" });

        return () => {
            socket.off("message-response");
        };
    }, [messages]);

    /* Functions */
    function sendMessage() {
        if (!message?.trim() || !user) return;

        socket.emit("send-message", {
            id,
            secretKey: chat.secret,
            message,
        });

        // Add message in client before waiting a request from server
        setMessages(s => [
            ...s,
            {
                message,
                by: user!.wallet,
                date: new Date(),
            },
        ]);

        setMessage("");
    }

    return (
        <div id="chat">
            {/* Messages container */}
            <div className="messages">
                {messages.map((m, i) => {
                    const fromMe = m.by === user?.wallet;
                    const isLast = i === messages.length - 1;

                    return (
                        <div
                            key={i}
                            ref={isLast ? lastMessage : undefined}
                            className={"message" + (fromMe ? " me" : "")}
                        >
                            <div className="content">
                                <ChannelPicture id={m.by} size={40} />
                                <div className="message-info">
                                    <h5>{truncateWalletAddress(m.by)}</h5>
                                    <p>{m.message}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Send message */}
            <div className="send">
                <input
                    placeholder="Send message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") sendMessage();
                    }}
                />

                <button onClick={sendMessage}>
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
}
