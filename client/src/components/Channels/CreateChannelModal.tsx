import { useState } from "react";
import toast from "react-hot-toast";
import { FaChevronLeft } from "react-icons/fa";
import { IoPerson, IoPeople } from "react-icons/io5";
import { F } from "../../lib/helpers";
import ECDH from "../../lib/ecdh";
import Button from "../Button";
import "./channel-modal.scss";

type ChatTypes = "individual" | "type";

export default function CreateChannelModal() {
    const [type, setType] = useState<ChatTypes | null>(null);

    if (type === "individual") return <Individual setType={setType} />;
    if (type === "type") return <Group setType={setType} />;

    return (
        <div className="methods">
            <h2>Select a channel type</h2>
            <button onClick={() => setType("individual")}>
                <IoPerson />
                Send message to a person
            </button>
            <button onClick={() => setType("type")}>
                <IoPeople />
                Create a group chat
            </button>
        </div>
    );
}

function Individual({
    setType,
}: {
    setType: React.Dispatch<React.SetStateAction<ChatTypes | null>>;
}) {
    const [address, setAddress] = useState("");

    async function startConversation(): Promise<any> {
        if (!address) return toast.error("Please enter a wallet address");

        // Generate ECDH key pair and get public key
        const ecdh = new ECDH();
        let { publicKey } = await ecdh.generateKeyPair();

        F({
            endpoint: "/channel/individual",
            method: "PUT",
            body: {
                to: address,
                creatorPublicKey: publicKey,
            },
        })
            .then(response => {
                console.log(response);
            })
            .catch(e => {
                console.error(e);
                toast.error(e.message);
            });
    }

    return (
        <div className="create-chat individual">
            <div className="top">
                <h2>Enter receiver's wallet address</h2>
                <button onClick={() => setType(null)}>
                    <FaChevronLeft />
                </button>
            </div>

            <input
                placeholder="nibi1h3atl3jdjq7rpjft6h3pg6ray9zjz99uce0jms" // Example address
                onChange={e => setAddress(e.target.value)}
            />

            <Button type="main" click={startConversation}>
                Start Conversation
            </Button>
        </div>
    );
}

function Group({ setType }: { setType: React.Dispatch<React.SetStateAction<ChatTypes | null>> }) {
    const [groupName, setGroupName] = useState("");

    function createGroup(): any {
        if (!groupName) return toast.error("Please enter a group name");
    }

    return (
        <div className="create-chat group">
            <div className="top">
                <h2>Enter group name</h2>
                <button onClick={() => setType(null)}>
                    <FaChevronLeft />
                </button>
            </div>

            <input placeholder="0ep Developer Team" onChange={e => setGroupName(e.target.value)} />

            <Button type="main" click={createGroup}>
                Create Group Chat
            </Button>
        </div>
    );
}
