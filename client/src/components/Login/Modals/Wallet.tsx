import { useEffect, useState } from "react";
import { useUserStore, useWalletStore } from "../../../lib/states";
import { F } from "../../../lib/helpers";
import Cookie from "../../../lib/cookie";

export default function WalletModal({ next }: { next: (s?: number) => void }) {
    const wallet = useWalletStore(state => state.wallet);
    const setUser = useUserStore(state => state.setUser);

    const [keplrDetected, setKeplrDetected] = useState<null | boolean>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        localStorage.setItem("SKIP-WELCOME-BEFORE-LOGIN", "1");

        if (!(window as any).keplr) {
            setKeplrDetected(false);
            return;
        }

        setKeplrDetected(true);
    }, []);

    async function connect() {
        try {
            const walletAddress = await wallet.connect();

            if (walletAddress) {
                /* User validation */
                // Generate a JWT token
                const verifyToken: string | null = (
                    await F({
                        endpoint: `/auth/generate-secret?wallet=${walletAddress}`,
                        method: "GET",
                    })
                ).token;

                if (verifyToken === null) return setFailed(true);

                // Sign a message to validate ownership of the wallet
                const signature = await wallet.sign(verifyToken);

                // Send the message to server for verification
                const verifySignatureResponse: string | null = (
                    await F({
                        endpoint: `/auth/verify-signature`,
                        method: "POST",
                        body: {
                            address: walletAddress,
                            token: verifyToken,
                            signature,
                        },
                    })
                ).status;

                if (!verifySignatureResponse) return setFailed(true);

                // After verifying the signature, a HTTP-only cookie is generated
                // To keep track of it, a non-HTTP-only cookie should be generated
                // This cookie won't include critical data, will only show existance of other cookie
                Cookie.set("logged", "1", 90);

                // Get information about if user exists or if user is valid
                const userExists: boolean = (
                    await F({
                        endpoint: `/auth/user-exists?wallet=${walletAddress}`,
                        method: "GET",
                    })
                ).exists;

                // Register new user
                let justRegistered = false;
                if (!userExists) {
                    const response: boolean = (
                        await F({
                            endpoint: `/auth`,
                            method: "PUT",
                        })
                    ).status;

                    if (!response) return setFailed(true);
                    justRegistered = true;
                }

                // Check if user's account is verified
                // If user has just registered, no need to check if account is verified since it won't be
                let isValid = !justRegistered;
                if (!justRegistered) {
                    const response: boolean = (
                        await F({
                            endpoint: `/auth/is-valid`,
                            method: "GET",
                        })
                    ).valid;

                    isValid = response;
                }

                if (isValid) {
                    // Skip the verification modal and complete login
                    setUser({ wallet: walletAddress, verified: true });
                    return next(1);
                }

                setUser({ wallet: walletAddress, verified: false });
                return next(); // Go to next step
            }
        } catch (e) {
            console.error(e);
            setFailed(true);
        }
    }

    return (
        <div id="wallet-modal">
            <h1>Connect your Wallet</h1>

            <p>To get access, you need to connect your wallet</p>

            <div className="connect">
                {failed ? (
                    <p className="fail">Verification failed, please try again.</p>
                ) : (
                    <>
                        {keplrDetected !== null && (
                            <>
                                {keplrDetected ? (
                                    <button onClick={connect}>
                                        <div>
                                            <img src="/images/keplr-icon.png" alt="Keplr" />
                                            Connect your Keplr Wallet
                                        </div>
                                    </button>
                                ) : (
                                    <p>
                                        Please install{" "}
                                        <a
                                            href="https://chromewebstore.google.com/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?pli=1"
                                            target="_blank"
                                        >
                                            Keplr Wallet
                                        </a>{" "}
                                        to continue
                                    </p>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
