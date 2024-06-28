import { type Request, type Response, Router } from "express";
import userDB from "../db/userSchema";
import type { UserRequest } from ".";
import E, { type ITransGate, type ISignedMessage } from "../funcs/encryption";

const router = Router();

/**
 * Get user data from DB using access-token
 */
router.get("/", E.verifyJwt, async (req: UserRequest, res: Response) => {
    return res.send({
        wallet: req.user?.wallet,
        verified: req.user?.verified,
    });
});

/**
 * Register user with its access-token cookie data
 * Even before user has an account, access-token that holds wallet data exists
 */
router.put("/", async (req: Request, res: Response) => {
    const token = req.cookies?.["access-token"];
    if (!token) return res.status(400).send({ status: false });

    // Get user via JWT token
    const user = E.decodeJwt(token);
    if (!user?.wallet) return res.status(400).send({ status: false });

    // Check if user exists
    const duplicateUser = await userDB.findOne({ wallet: user.wallet });
    if (duplicateUser) return res.status(400).send({ status: false });

    // Save user to DB
    const newUser = new userDB({
        wallet: user.wallet,
        verified: false,
    });

    await newUser.save();
    return res.send({ status: true });
});

/**
 * Check if user exists
 * @param {string} wallet The wallet address of user. Needed for query
 */
router.get("/user-exists", async (req: Request, res: Response) => {
    // Get wallet as URL param
    const { wallet } = req.query;
    if (!wallet) return res.send({ exists: false });

    // Get user
    const user = await userDB.findOne({ wallet });
    if (!user) return res.send({ exists: false });
    return res.send({ exists: true });
});

/**
 * Check if user's account is verified
 */
router.get("/is-valid", E.verifyJwt, async (req: UserRequest, res: Response) => {
        // Get wallet as URL param
        const { wallet } = req.user!;
        if (!wallet) return res.send({ valid: false });

        // Get user
        const user = await userDB.findOne({ wallet });
        if (!user || !user?.verified) return res.send({ valid: false });
        return res.send({ valid: true });
    }
);

/**
 * Generates an access-token that'll be verified at the next step.
 * The verification is done via a signing operation.
 * @param {string} wallet The wallet address of user. Needed for token generation
 */
router.get("/generate-secret", (req: Request, res: Response) => {
    // Get wallet as URL param
    let { wallet } = req.query;
    if (!wallet) return res.send({ token: null });
    wallet = (wallet as string).toLowerCase();

    // Generate and send the token
    const token = E.generateJwt({ wallet }, "5m");
    if (!token) return res.send({ token: null });
    return res.send({ token });
});

/**
 * Verifies the signature, sends the access-token to client
 * access-token is an HTTP-only cookie. Reason behind using HTTP-only cookies is to prevent
 * users from getting their accounts stolen because of a possible XSS vulnerability.
 * @param {string} wallet The wallet address of user.
 * @param {string} token JWT token
 * @param {string} signature Returned signature after signing the message on Web3 wallet
 */
router.post("/verify-signature", async (req: Request, res: Response) => {
    const {
        address,
        token,
        signature,
    }: { address: string; token: string; signature: ISignedMessage } = req.body;

    if (!address || !token || !signature)
        return res.status(400).send({ status: false });

    const response: { success: boolean } = await E.verifySignature(
        address,
        token,
        signature
    );
    if (!response.success) return res.status(400).send({ status: false });

    const newToken = E.generateJwt({
        wallet: address,
    });

    // Set access-token cookie
    res.cookie("access-token", newToken, {
        expires: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000), // 90 Days later
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
    });

    return res.send({ status: true });
});

/**
 * Verifies zkPass TransGate response to find out if it's valid
 * If valid, changes the 'verified' data in users collection
 * @param {string} taskId Unique id of the task allocated by the allocator node
 * @param {string} uHash Hash value of user unique id in the data source
 * @param {string} publicFieldsHash Hash of public field values
 * @param {string} schemaId ID of the schema that is used for identity verification
 * @param {string} allocatorSignature Signature of the task meta data by the allocator node
 * @param {string} validatorSignature Signature of the verification result by the allocator node
 * @param {string} validatorAddress Address of the validator node
 */
router.post("/verify-transgate", E.verifyJwt, async (req: UserRequest, res: Response) => {
    const {
        taskId,
        uHash,
        schemaId,
        publicFieldsHash,
        allocatorSignature,
        validatorSignature,
        validatorAddress
    }: ITransGate = req.body;

    const { wallet } = req.user!;

    if (
        !wallet ||
        !taskId ||
        !uHash ||
        !schemaId ||
        !allocatorSignature ||
        !publicFieldsHash ||
        !validatorSignature ||
        !validatorAddress
    ) {
        return res.send({ verified: false });
    }

    try {
        const isVerified = E.verifyTransgate(
            taskId,
            uHash,
            schemaId,
            publicFieldsHash,
            allocatorSignature,
            validatorSignature,
            validatorAddress
        );

        // Update user's verified data in database
        await userDB.updateOne({ wallet }, { verified: true });
    
        return res.send({ verified: isVerified });
    } catch (e) {
        console.error(e);
        return res.send({ verified: false });
    }
});

export default router;
