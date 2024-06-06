import { useEffect, useState } from "react";

import Button from "../../Button";

export default function WelcomeModal({ next }: { next: () => void }) {
    const [transgateDetected, setTransgateDetected] = useState(false);

    useEffect(() => {
        // Detect Transgate extension, then allow user to continue
    }, []);

    return (
        <div id="welcome-modal">
            <h1>
                Welcome to <span>0ep Protocol</span>
            </h1>

            <h3>Anonymous Web3 Chat</h3>
            <p>To get access, you need to connect your wallet</p>
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
                {transgateDetected ? (
                    <Button
                        click={next}
                        custom={{
                            width: "100%"
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
                            zkPass Transgate
                        </a>{" "}
                        Chrome extension to your browser.
                    </p>
                )}
            </div>
        </div>
    );
}
