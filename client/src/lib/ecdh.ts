export default class ECDH {
    async generateKeyPair() {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-256",
            },
            true,
            ["deriveKey", "deriveBits"]
        );

        const publicKey = this.arrayBufferToBase64(
            await window.crypto.subtle.exportKey("spki", keyPair.publicKey)
        );
        const privateKey = this.arrayBufferToBase64(
            await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey)
        );

        return { publicKey, privateKey };
    }

    async encryptMessage(message: string, key: CryptoKey) {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encodedMessage = new TextEncoder().encode(message);
        const encryptedContent = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            encodedMessage
        );

        return this.ivToBase64(iv) + this.arrayBufferToBase64(encryptedContent);
    }

    async decryptMessage(encryptedMessage: string, key: CryptoKey) {
        const iv = this.base64ToUint8Array(encryptedMessage.substr(0, 16));
        const encryptedContent = this.base64ToUint8Array(encryptedMessage.substr(16));
        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            encryptedContent
        );

        return new TextDecoder().decode(decryptedContent);
    }

    arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    base64ToUint8Array(base64: string) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    ivToBase64(iv: ArrayBuffer) {
        return this.arrayBufferToBase64(iv);
    }
}
