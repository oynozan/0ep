const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

import { type Response, Router } from "express";
import { randomBytes } from "crypto";
import axios from 'axios';
import E from "../funcs/encryption";
import type { UserRequest } from ".";
import userDB from "../db/userSchema";
import channelDB from "../db/channelSchema";

const router = Router();

/**
 * Create an individual chat
 */
router.put("/individual", E.verified, async (req: UserRequest, res: Response) => {
        try {
            const { to }: { to: string } = req.body;

            if (!to)
                return res
                    .status(400)
                    .send({ message: "Please enter a valid wallet address." });

            const toUser = await userDB.findOne({ wallet: to }, { wallet: 1 });
            if (!toUser)
                return res.status(400).send({
                    message: "User with this wallet address cannot be found.",
                });

            // Check existance of channel
            const channels = await channelDB.aggregate([
                {
                    $match: {
                        participants: {
                            $all: [
                                { $elemMatch: { wallet: req.user!.wallet } },
                                { $elemMatch: { wallet: to } },
                            ],
                        },
                    },
                },
            ]);

            if (channels.length) {
                const channel = channels[0];

                return res.send({
                    id: channel._id.toString(),
                });
            }

            // Add it to database
            const secretKey = randomBytes(32).toString("hex"); // Secret key of the channel

            const newRoom = new channelDB({
                type: "individual",
                date: new Date(),
                messages: [],
                participants: [
                    {
                        wallet: req.user!.wallet,
                        joinDate: new Date(),
                    },
                    {
                        wallet: toUser.wallet,
                        joinDate: new Date(), // This field will be updated after first message is sent
                    },
                ],
                secret: secretKey,
            });

            await newRoom.save();

            return res.send({
                id: newRoom._id.toString(),
                key: secretKey,
            });

        } catch (e) {
            console.error(e);
            return res
                .status(500)
                .send({ message: "A server exception occured." });
        }
    }
);

/**
 * Create a group chat
 */
router.put("/group", E.verified, async (req: UserRequest, res: Response) => {});

/**
 * Import chat from Discord
 */
router.put("/import", E.verified, async (req: UserRequest, res: Response) => {
    try {
        const { id } = req.body;
        if (!id)
            return res.status(400).send({ message: "Discord server doesn't exist." });

        const URL = `https://discord.com/api/v9/guilds/${id}/widget.json`;

        const response = await axios.get(URL);
        const name = response?.data?.name;

        if (!name)
            return res.status(400).send({ message: "Discord server doesn't exist or it can't be imported." });

        // Check existance of channel
        const channels = await channelDB.aggregate([
            {
                $match: {
                    type: "imported",
                    name
                },
            },
        ]);

        if (channels.length) {
            const channel = channels[0];

            // Add user to participants

            return res.send({
                id: channel._id.toString(),
            });
        }

        // Add it to database
        const secretKey = randomBytes(32).toString("hex"); // Secret key of the channel

        const newRoom = new channelDB({
            type: "imported",
            name,
            date: new Date(),
            messages: [],
            participants: [
                {
                    wallet: req.user!.wallet,
                    joinDate: new Date(),
                },
            ],
            secret: secretKey,
        });

        await newRoom.save();

        return res.send({
            id: newRoom._id.toString(),
            key: secretKey,
            name
        });

    } catch (e) {
        console.error(e);
        return res.status(500).send({ message: "A server exception occured." });
    }
});

/**
 * Get chat room IDs of a user
 * User must be a participant of the room
 * If that's an individual chat, there must be at least one message for receiver to see this chat room
 */
router.get("/rooms", E.verified, async (req: UserRequest, res: Response) => {
    try {
        // Get chat rooms sorted by their last message date OR room creation date IF there're no messages
        let rooms = await channelDB.aggregate([
            {
                $match: {
                    $or: [
                        { "participants.0.wallet": req.user?.wallet },
                        {
                            $expr: {
                                $gt: [{ $size: "$messages" }, 0]
                            }
                        }
                    ],
                },
            },
            {
                $addFields: {
                    lastMessageDate: {
                        $cond: {
                            if: { $eq: [{ $size: "$messages" }, 0] },
                            then: "$date",
                            else: { $max: "$messages.date" },
                        },
                    },
                    lastMessage: {
                        $cond: {
                            if: { $eq: [{ $size: "$messages" }, 0] },
                            then: null,
                            else: { $arrayElemAt: ["$messages", -1] },
                        },
                    },
                    title: {
                        $cond: {
                            if: { $eq: [{ $size: "$participants" }, 1] },
                            then: "$name",
                            else: { $arrayElemAt: ["$participants.wallet", 1] },
                        },
                    },
                },
            },
            {
                $sort: { lastMessageDate: -1 },
            },
            {
                $project: {
                    id: { $toString: "$_id" },
                    secret: 1,
                    lastMessage: 1,
                    title: 1,
                    type: 1,
                },
            },
        ]);

        return res.send({ rooms });
    } catch (e) {
        console.error(e);
        return res.send({ rooms: [] });
    }
});

/**
 * Get chat room details
 */
router.get("/room", E.verified, async (req: UserRequest, res: Response) => {
    try {
        const { id } = req.query;
        if (!id)
            return res.status(400).send({ message: "Chat cannot be found" });

        // Get chat
        const chat = await channelDB.aggregate([
            {
                $match: {
                    _id: new ObjectId(id),

                    // User must be a member of chat to get chat information
                    participants: {
                        $elemMatch: {
                            wallet: req.user?.wallet,
                        },
                    },
                }
            },
            {
                $addFields: {
                    title: {
                        $cond: {
                            if: { $eq: [{ $size: "$participants" }, 1] },
                            then: "$name",
                            else: { $arrayElemAt: ["$participants.wallet", 1] },
                        },
                    },
                },
            },
        ]);

        if (!chat?.length)
            return res.status(400).send({ message: "Chat cannot be found" });

        return res.send({ chat: chat[0] });
    } catch (e) {
        console.error(e);
        return res.status(500).send({ message: "A server exception occured." });
    }
});

export default router;
