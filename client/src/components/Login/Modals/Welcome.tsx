import TransgateConnect from "@zkpass/transgate-js-sdk";
import { useEffect, useState } from "react";
import Button from "../../Button";

export default function WelcomeModal({ next }: { next: () => void }) {
    const [loading, setLoading] = useState(true); // Load until TransGate response
    const [transgateDetected, setTransgateDetected] = useState(false);

    useEffect(() => {
        (async () => {
            // Detect TransGate extension, then allow user to continue
            const connector = new TransgateConnect(process.env.REACT_APP_TRANSGATE_APP_ID!);
            const isAvailable = await connector.isTransgateAvailable();
            setTransgateDetected(isAvailable);
            setLoading(false);

            // Check if user has seen Welcome modal
            if (localStorage.getItem("SKIP-WELCOME-BEFORE-LOGIN") && isAvailable) next();
        })();
    }, []);

    return (
        <div id="welcome-modal">
            <h1>
                Welcome to <span>0ep Protocol</span>
            </h1>

            <p>
                Let's get started with setting up your account.
                <br />
                To get access, you need to connect your wallet.
            </p>
            <p>
                If you haven't used <span>0ep Protocol</span> before, you need to verify your
                identity so we can be sure you're not a bot.
            </p>
            <p>
                With{" "}
                <a href="https://zkpass.org/" style={{ color: "#c5ff4a" }}>
                    zkPass
                </a>
                , you can verify your identity without sharing a personal information.
            </p>

            <div className="continue">
                {loading ? (
                    <img src="/images/loader.svg" alt="Loader" className="loader" />
                ) : (
                    <>
                        {transgateDetected ? (
                            <Button
                                click={next}
                                custom={{
                                    width: "100%",
                                }}
                            >
                                Continue
                            </Button>
                        ) : (
                            <p>
                                Before continuing, please install{" "}
                                <a
                                    href="https://chromewebstore.google.com/detail/zkpass-transgate/afkoofjocpbclhnldmmaphappihehpma"
                                    style={{ color: "#c5ff4a" }}
                                >
                                    zkPass TransGate
                                </a>{" "}
                                Chrome extension to your browser.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
