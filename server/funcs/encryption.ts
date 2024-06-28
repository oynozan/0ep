import {
    createECDH,
    createCipheriv,
    randomBytes,
    createDecipheriv,
} from "crypto";
import { verifyADR36Amino } from "@keplr-wallet/cosmos";
import type { NextFunction, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { fromBase64 } from "@cosmjs/encoding";
import Web3 from "web3";

import userDB, { type IUser } from "../db/userSchema";
import type { UserRequest } from "../routes";

const web3 = new Web3();

export interface ISignedMessage {
    signature: string;
    pub_key: {
        type: string;
        value: string;
    };
    signed: string;
}

export interface ITransGate {
    taskId: string;
    uHash: string;
    schemaId: string;
    publicFieldsHash: string;
    allocatorSignature: string;
    validatorSignature: string;
    validatorAddress: string;
}

export default class Encryption {
    // Generate ECDH Key Pair
    static generateECDHKeyPair() {
        const ecdh = createECDH("prime256v1");
        ecdh.generateKeys();

        return {
            privateKey: ecdh.getPrivateKey("base64"),
            publicKey: ecdh.getPublicKey("base64"),
            ecdh
        };
    }

    // Encrypt a message using AES-256
    static encryptMessage(message: string, sharedSecret: string) {
        const iv = randomBytes(16);
        const cipher = createCipheriv(
            "aes-256-gcm",
            Buffer.from(sharedSecret, "base64"),
            iv
        );

        let encrypted = cipher.update(message, "utf8", "base64");
        encrypted += cipher.final("base64");

        return iv.toString("base64") + ":" + encrypted;
    }

    // Decrypt a message using AES-256
    static decryptMessage(encryptedMessage: string, sharedSecret: string) {
        const [iv, encrypted] = encryptedMessage.split(":");
        const decipher = createDecipheriv(
            "aes-256-gcm",
            Buffer.from(sharedSecret, "base64"),
            Buffer.from(iv, "base64")
        );

        let decrypted = decipher.update(encrypted, "base64", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    }

    /**
     * Generates a JWT token
     * @returns {string} JWT token
     */
    static generateJwt(payload: any, expire: string = "90d"): string {
        return jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: expire,
        });
    }

    /**
     * Decodes the JWT token
     * @param {JwtPayload} token JWT token
     */
    static decodeJwt(token: string): JwtPayload {
        return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    }

    /**
     * This is a middleware to get user data from "access-token"
     * It moves user data from database to next request. If anything is invalid,
     * this method throws an error.
     */
    static verifyJwt(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.["access-token"] as string | undefined;
            req["user"] = undefined;

            if (!token)
                return res.status(403).send({ message: "Please log in." });

            jwt.verify(token, process.env.JWT_SECRET!, async (err, decoded) => {
                if (!decoded) {
                    if (err) console.error(err);
                    return res
                        .status(403)
                        .send({ message: "Your account is invalid" });
                }

                let wallet = (decoded as JwtPayload).wallet;

                // Check user login
                let user: IUser | null = await userDB.findOne({ wallet });
                if (!user)
                    return res
                        .status(403)
                        .send({ message: "Your account is invalid" });

                // Set the user to request
                req["user"] = user;

                return next();
            });
        } catch (e) {
            console.error(e);
            return res.status(500).send({ message: "An error occured." });
        }
    }

    /**
     * This is a middleware to get verified user's data from "access-token"
     * Only allows verified user's to do actions.
     */
    static verified(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.["access-token"] as string | undefined;
            req["user"] = undefined;

            if (!token)
                return res.status(403).send({ message: "Please log in." });

            jwt.verify(token, process.env.JWT_SECRET!, async (err, decoded) => {
                if (!decoded) {
                    if (err) console.error(err);
                    return res
                        .status(403)
                        .send({ message: "Your account is invalid" });
                }

                let wallet = (decoded as JwtPayload).wallet;

                // Check user login
                let user: IUser | null = await userDB.findOne({ wallet });
                if (!user)
                    return res
                        .status(403)
                        .send({ message: "Your account is invalid" });
                else if (!user.verified)
                    return res
                        .status(403)
                        .send({ message: "Please verify your action." });

                // Set the user to request
                req["user"] = user;

                return next();
            });
        } catch (e) {
            console.error(e);
            return res.status(500).send({ message: "An error occured." });
        }
    }

    /**
     * Verifies user's signature
     * @param {string} wallet Wallet addres
     * @param {string} token JWT token
     * @param {ISignedMessage} signedMessage Returned signature data after signing the message on Web3 wallet
     */
    static async verifySignature(
        wallet: string,
        token: string,
        signedMessage: ISignedMessage
    ): Promise<{ success: boolean }> {
        const decoded = Encryption.decodeJwt(token);

        // Check address mismatch
        if (decoded.wallet !== wallet) return { success: false };

        // Check signature
        const message = signedMessage.signed;
        const signatureBase64 = signedMessage.signature;
        const pubKeyBase64 = signedMessage.pub_key.value;

        if (message !== token) return { success: false };

        const pubKeyBytes = fromBase64(pubKeyBase64);
        const signatureBytes = fromBase64(signatureBase64);

        const isVerified = verifyADR36Amino(
            "nibi",
            wallet,
            message,
            pubKeyBytes,
            signatureBytes
        );

        return { success: isVerified };
    }

    /**
     * Verifies zkPass TransGate response
     * @param {string} taskId Unique id of the task allocated by the allocator node
     * @param {string} uHash Hash value of user unique id in the data source
     * @param {string} publicFieldsHash Hash of public field values
     * @param {string} schemaId ID of the schema that is used for identity verification
     * @param {string} allocatorSignature Signature of the task meta data by the allocator node
     * @param {string} validatorSignature Signature of the verification result by the allocator node
     * @param {string} validatorAddress Address of the validator node
     */
    static verifyTransgate(
        taskId: string,
        uHash: string,
        schemaId: string,
        publicFieldsHash: string,
        allocatorSignature: string,
        validatorSignature: string,
        validatorAddress: string
    ): boolean {
        // Verify allocator signature
        // https://zkpass.gitbook.io/zkpass/developer-guides/generate-proof-and-verify-the-result/evm#verify-allocator-signature
        const taskIdHex = Web3.utils.stringToHex(taskId);
        const schemaIdHex = Web3.utils.stringToHex(schemaId);

        const encodeParams = web3.eth.abi.encodeParameters(
            ["bytes32", "bytes32", "address"],
            [taskIdHex, schemaIdHex, validatorAddress]
        );
        const paramsHash = Web3.utils.soliditySha3(encodeParams);
        const signedAllocatorAddress = web3.eth.accounts.recover(
            paramsHash as string,
            allocatorSignature
        );

        if (
            signedAllocatorAddress !==
            "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d"
        )
            return false;

        // Verify validator signature
        // https://zkpass.gitbook.io/zkpass/developer-guides/generate-proof-and-verify-the-result/evm#verify-validator-signature
        const types = ["bytes32", "bytes32", "bytes32", "bytes32"];
        const values = [taskIdHex, schemaIdHex, uHash, publicFieldsHash];

        const encodeParams_validator = web3.eth.abi.encodeParameters(
            types,
            values
        );
        const paramsHash_validator = Web3.utils.soliditySha3(
            encodeParams_validator
        );
        const signedValidatorAddress = web3.eth.accounts.recover(
            paramsHash_validator as string,
            validatorSignature
        );

        return signedValidatorAddress === validatorAddress;
    }
}
