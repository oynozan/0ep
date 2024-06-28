import { useState } from "react";
import TransgateConnect from "@zkpass/transgate-js-sdk";
import { useUserStore } from "../../../lib/states";
import { F } from "../../../lib/helpers";
import Button from "../../Button";
import toast from 'react-hot-toast';

export default function VerificationModal({
    next,
    first,
}: {
    next: () => void;
    first: () => void;
}) {
    const user = useUserStore(state => state.user);
    const setUser = useUserStore(state => state.setUser);

    const [failed, setFailed] = useState(false);
    const [loading, setLoading] = useState(false);

    async function verify(): Promise<any> {
        if (!user?.wallet) return first();

        try {
            const connector = new TransgateConnect(process.env.REACT_APP_TRANSGATE_APP_ID!);
            const isAvailable = await connector.isTransgateAvailable();

            if (!isAvailable) return first(); // Go back to first step
            setLoading(true);

            // Start verification
            const res: any = await connector.launch(
                process.env.REACT_APP_DISCORD_ACCOUNT_OWNER_SCHEMA_ID!
            );

            // Validate response
            toast.loading("Validating verification, please wait...");

            if (
                !res.taskId ||
                !res.uHash ||
                !res.publicFieldsHash ||
                !res.allocatorSignature ||
                !res.validatorSignature ||
                !res.validatorAddress
            ) {
                return setFailed(true);
            }

            const validateRes = (
                await F({
                    endpoint: "/auth/verify-transgate",
                    method: "POST",
                    body: {
                        taskId: res.taskId,
                        uHash: res.uHash,
                        publicFieldsHash: res.publicFieldsHash,
                        allocatorSignature: res.allocatorSignature,
                        validatorSignature: res.validatorSignature,
                        validatorAddress: res.validatorAddress,
                        schemaId: process.env.REACT_APP_DISCORD_ACCOUNT_OWNER_SCHEMA_ID,
                    },
                })
            ).verified;

            if (!validateRes) return setFailed(true);

            // Success
            setUser({ ...user, verified: true });
            toast.dismiss();
            return next();
        } catch (e) {
            console.error(e);
            setFailed(true);
        }
    }

    return (
        <div id="verification-modal">
            <h1>Verify your Account</h1>
            <p>
                There's one last step required to start using <span>0ep Protocol</span>. You must
                verify your identity to prove you're a real person.
            </p>
            <div className="verify">
                {loading ? (
                    <img src="/images/loader.svg" alt="Loader" className="loader" />
                ) : (
                    <>
                        {failed ? (
                            <p className="fail">Verification failed, please try again.</p>
                        ) : (
                            <Button click={() => verify()} type="purple">
                                <img src="/images/discord-white.svg" alt="Discord" />
                                Start Verification
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
