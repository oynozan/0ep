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

    useEffect(() => {
        // Putting a delay before changing selected modal to global state's value
        // The reason is to put a closing animation before removing modal component
        setTimeout(() => {
            setSelected(selectedModal);
        }, 249);
    }, [selectedModal]);

    return (
        <>
            {/* Custom Modal */}
            {selected === "custom" && (
                <Modal
                    set={setModal}
                    closing={selected !== selectedModal}
                >
                    {options.content}
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
                    {options.content}
                </Modal>
            )}
        </>
    );
}
