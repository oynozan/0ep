/**
 * Methods for Web3 wallet operations such as signing, connecting
 */

interface IWallet {
    connect: () => void;
}

export class Wallet implements IWallet {
    constructor() {}

    connect() {}
}
