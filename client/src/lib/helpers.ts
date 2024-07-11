/**
 * Contains helper methods to be used on Client-side
 */

import * as CryptoJS from "crypto-js";

// A simpler fetch() method
interface RequestOptions<T extends "fetch" | "function"> {
    method: "POST" | "GET" | "PUT" | "DELETE";
    body?: T extends "fetch" ? string : any;
    headers?: any;
    credentials?: RequestCredentials | undefined;
}

export async function F({
    endpoint,
    method = "GET",
    body,
    headers = {},
    extra = {},
    credentials = "include",
}: RequestOptions<"function"> & {
    endpoint: string;
    extra?: any;
    body?: any;
}): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!headers?.["Content-Type"]) headers["Content-Type"] = "application/json";

        const options: RequestOptions<"fetch"> = {
            method,
            headers,
            ...extra,
        };

        if (body) options["body"] = JSON.stringify(body);
        if (credentials) options["credentials"] = "include";

        fetch(process.env.REACT_APP_API + endpoint, options)
            .then(async res => {
                if (!res.ok) return reject(await res.json());
                return await res.json();
            })
            .then(res => resolve(res))
            .catch(err => reject(err));
    });
}

// Returns a truncated wallet address
export function truncateWalletAddress(
    walletAddress: string,
    prefixLength = 12,
    suffixLength = 6
): string {
    // Check if the wallet address is valid
    if (typeof walletAddress !== "string" || walletAddress.length < prefixLength + suffixLength)
        return walletAddress; // Return the original address if it's invalid or too short

    // Extract the prefix and suffix parts of the address
    const prefix = walletAddress.substring(0, prefixLength);
    const suffix = walletAddress.substring(walletAddress.length - suffixLength);

    // Generate the truncated address with prefix, ellipsis, and suffix
    const truncatedAddress = `${prefix}...${suffix}`;

    return truncatedAddress;
}

// Returns color based on given string
export function stringToColor(str: string): string {
    let hash = 0;
    str.split("").forEach(char => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    let colour = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        colour += value.toString(16).padStart(2, "0");
    }

    return colour;
}

// Date functions
export function HHMM(date: Date | number): string {
    if (typeof date === "number") date = new Date(date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function MMDDHHMM(date: Date | number): string {
    if (typeof date === "number") date = new Date(date);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}.${day} ${hours}:${minutes}`;
}

// Encryption functions
export function encrypt(message: string, secretKey: string): string {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(secretKey), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return iv.toString(CryptoJS.enc.Hex) + ":" + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

export function decrypt(ciphertext: string, secretKey: string): string {
    const [ivHex, encryptedHex] = ciphertext.split(":");
    if (!ivHex || !encryptedHex) return "";

    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);

    const decrypted = CryptoJS.AES.decrypt(
        CryptoJS.lib.CipherParams.create({
            ciphertext: encrypted,
        }),
        CryptoJS.enc.Hex.parse(secretKey),
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
}
