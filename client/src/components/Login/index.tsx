/**
 * Login is made of unskippable modals, each modal contains a step to login
 *
 * Steps:
 * 0) Welcome text (skip if user has already seen this)
 * 1) Wallet connection
 * 2) Identity validation with zkPass (if already validated, skip this step)
 */

import { useEffect, useState } from "react";

import { useModalStore, useUserStore } from "../../lib/states";
import { F } from '../../lib/helpers';

// Modals
import VerificationModal from './Modals/Verification';
import LoadingModal from './Modals/Loading';
import WelcomeModal from "./Modals/Welcome";
import WalletModal from "./Modals/Wallet";

import './login.scss';

export default function Login() {
    const user = useUserStore(state => state.user);
    const setModal = useModalStore(state => state.setModal);

    const [step, setStep] = useState(0);

    // Set corresponding modal
    useEffect(() => {
        let content;

        switch (step) {
            case 0:
                content = <WelcomeModal next={() => setStep(1)} />;
                break;

            case 1:
                content = <WalletModal next={(s: number = 0) => setStep(2 + s)} />;
                break;

            case 2:
                content = <VerificationModal next={() => setStep(3)} first={() => setStep(0)} />
                break;

            case 3:
                return setModal(null, {});
        }

        setModal("login", { content });
    }, [step]);

    useEffect(() => {
        // User exists but must verify the account
        if (user?.wallet && !user?.verified) setStep(2);
    }, [user]);

    return null;
}
