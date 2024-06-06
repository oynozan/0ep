/**
 * Login is made of unskippable modals, each modal contains a step to login
 *
 * Steps:
 * 0) Welcome text (skip if user has already seen this)
 * 1) Wallet connection
 * 2) Identity validation with zkPass (if already validated, skip this step)
 */

import { useEffect, useState } from "react";

import { useModalStore } from "../../lib/states";

// Modals
import WelcomeModal from "./Modals/Welcome";
import WalletModal from "./Modals/Wallet";

import './login.scss';

export default function Login() {
    const setModal = useModalStore(state => state.setModal);

    const [step, setStep] = useState(-1);

    useEffect(() => {
        // Check if user has seen 0th step
        if (localStorage.getItem("SKIP-WELCOME-BEFORE-LOGIN")) setStep(1);
        else {
            // localStorage.setItem("SKIP-WELCOME-BEFORE-LOGIN", "1");
            setStep(0);
        }
    }, []);

    // Set corresponding modal
    useEffect(() => {
        let content;

        switch (step) {
            case 0:
                content = <WelcomeModal next={() => setStep(1)} />;
                break;

            case 1:
                content = <WalletModal next={() => setStep(2)} />;
                break;

            default:
                return;
        }

        setModal("login", { content });
    }, [step]);

    return null;
}
