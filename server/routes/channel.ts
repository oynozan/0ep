import { type Response, Router } from "express";
import channelDB from "../db/channelSchema";
import userDB from "../db/userSchema";
import type { UserRequest } from ".";
import E  from "../funcs/encryption";

const router = Router();

/**
 * Create an individual chat
 */
router.put("/individual", E.verified, async (req: UserRequest, res: Response) => {
    try {
        const { to, creatorPublicKey } : { to: string, creatorPublicKey: string } = req.body;

        if (!to) return res.status(400).send({ message: "Please enter a valid wallet address." });
        if (!creatorPublicKey) return res.status(400).send({ message: "Invalid public key." });
    
        const toUser = await userDB.findOne({ wallet: to }, { wallet: 1 });
        if (!toUser) return res.status(400).send({ message: "User with this wallet address cannot be found." });
    
        // Generate ECDH keys for creator
        // Other participant's key will be generated after first message
        const { ecdh, publicKey, privateKey } = E.generateECDHKeyPair();
        const sharedSecret = ecdh.computeSecret(Buffer.from(creatorPublicKey, 'base64')).toString('base64');

        console.log(creatorPublicKey);
        console.log(sharedSecret);
    
        const newRoom = new channelDB({
            type: "individual",
            date: new Date(),
            messages: [],
            participants: [
                {
                    wallet: req.user!.wallet,
                    joinDate: new Date(),
                    isCreator: true,
                    publicKey: creatorPublicKey,
                },
                {
                    wallet: toUser.wallet,
                    joinDate: new Date(), // This field will be updated after first message is sent
                    publicKey: '',
                }
            ],
            sharedKeys: [{
                wallet: req.user!.wallet,
                key: sharedSecret
            }],
            privateKey: privateKey,
            publicKey: publicKey
        });
    
        await newRoom.save();
    } catch (e) {
        console.error(e);
        return res.status(500).send({ message: "A server exception occured." });
    }
});

/**
 * Create a group chat
 */
router.put("/group", E.verified, async (req: UserRequest, res: Response) => {

});

export default router;
