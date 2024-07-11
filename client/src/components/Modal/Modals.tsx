/**
 * This component handles different types of modals
 */

import { useEffect, useState } from "react";

import Modal from ".";
import { useModalStore } from "../../lib/states";

export default function Modals() {
    const options: any = useModalStore(state => state.options);
    const selectedModal: string | null = useModalStore(state => state.modal);
    const setModal: (type: "custom" | "login", options: any) => void = useModalStore(
        state => state.setModal
    );

    const [selected, setSelected] = useState<string | null>(null);
    const [delayedOptions, setDelayedOptions] = useState<any>({});

    // Putting a delay before changing selected modal to global state's value
    // The reason is to put a closing animation before removing modal component
    useEffect(() => {
        setTimeout(() => {
            setSelected(selectedModal);
        }, 180);

        setTimeout(() => {
            setDelayedOptions(options);
        }, 180);
    }, [selectedModal, options]);

    return (
        <>
            {/* Custom Modal */}
            {selected === "custom" && (
                <Modal
                    set={setModal}
                    closing={selected !== selectedModal}
                    customID={delayedOptions?.customID}
                >
                    {delayedOptions.content}
                </Modal>
            )}

            {/* Login Modal */}
            {selected === "login" && (
                <Modal
                    set={setModal}
                    closable={false}
                    closing={selected !== selectedModal}
                    customID="login-modal"
                >
                    {delayedOptions.content}
                </Modal>
            )}
        </>
    );
}
