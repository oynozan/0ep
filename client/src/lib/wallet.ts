/**
 * Methods for Web3 wallet operations such as signing, connecting
 */

import { NibiruMainnet } from "./chain";

type Address = string;

export interface IWallet {
    address: string;
    walletName: string;

    // Connection methods
    connect: () => Promise<Address | null>;
    keplrConnect: () => Promise<Address | null>;

    // Signing methods
    sign: (message: string) => Promise<any>;
    keplrSign: (message: string) => Promise<any>;
}

export class Wallet implements IWallet {
    address: string;
    walletName: string;

    /**
     *
     * @param walletName Name of the web3 wallet.
     * It's needed because in the future with the support of new wallets,
     * this class will get more complicated since each wallet has its own
     * connection method.
     */
    constructor(walletName: string) {
        this.walletName = walletName;
    }

    /**
     * This method handles all types of connection types for various Web3 wallets.
     * Every connection method has same naming standard: (walletName) + 'Connect'
     * @returns {Promise<Address | null>} Wallet address of the user if connected, otherwise returns null
     */
    async connect(): Promise<Address | null> {
        const functionName = this.walletName + "Connect";

        // @ts-ignore <It's a valid function>
        return await this[functionName]();
    }

    /**
     * This method handles signing operation for all Web3 wallets.
     * It requires a message to sign, and returns the signature
     * @param {string} message Message to be signed
     * @returns {Promise<any>} Signing response
     */
    async sign(message: string): Promise<any> {
        const functionName = this.walletName + "Sign";

        // @ts-ignore <It's a valid function>
        return await this[functionName](message);
    }

    // Connect methods
    async keplrConnect() {
        try {
            const keplr = (window as any).keplr; // We're gonna assume it's defined at this point

            // Connect to Nibiru Mainnet
            await keplr.experimentalSuggestChain(NibiruMainnet);
            keplr.enable(NibiruMainnet.chainId);

            // Get account
            const offlineSigner = keplr.getOfflineSigner(NibiruMainnet.chainId);
            const accounts = await offlineSigner.getAccounts();

            if (!accounts.length) return null;

            this.address = accounts[0].address;
            console.log("Hello", this.address, ":)");

            return accounts[0].address;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    // Signing methods
    async keplrSign(message: string) {
        try {
            const keplr = (window as any).keplr;

            const signResponse = await keplr.signArbitrary(
                NibiruMainnet.chainId,
                this.address,
                message
            );

            return {
                signature: signResponse.signature,
                pub_key: signResponse.pub_key,
                signed: message,
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}
