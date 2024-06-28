import { useState } from "react";
import toast from "react-hot-toast";
import { FaChevronLeft, FaDiscord } from "react-icons/fa";
import { IoPerson, IoPeople } from "react-icons/io5";
import { F } from "../../lib/helpers";
import Button from "../Button";
import "./channel-modal.scss";
import { useChatStore, useModalStore, useRoomsStore } from '../../lib/states';

type ChatTypes = "individual" | "group" | "imported";

export default function CreateChannelModal() {
    const [type, setType] = useState<ChatTypes | null>(null);

    if (type === "individual") return <Individual setType={setType} />;
    if (type === "imported") return <Imported setType={setType} />;
    if (type === "group") return <Group setType={setType} />;

    return (
        <div className="methods">
            <h2>Select a channel type</h2>
            <button onClick={() => setType("individual")}>
                <IoPerson />
                Send message to a person
            </button>
            <button onClick={() => setType("group")}>
                <IoPeople />
                Create a group chat
            </button>
            <button onClick={() => setType("imported")}>
                <FaDiscord />
                Import a Discord server
            </button>
        </div>
    );
}

function Individual({
    setType,
}: {
    setType: React.Dispatch<React.SetStateAction<ChatTypes | null>>;
}) {
    const rooms = useRoomsStore(s => s.rooms);
    const addRoom = useRoomsStore(s => s.addRoom);
    const setModal = useModalStore(s => s.setModal);
    const setChatID = useChatStore(s => s.setChatID);

    const [address, setAddress] = useState("");

    async function startConversation(): Promise<any> {
        if (!address?.trim()) return toast.error("Please enter a wallet address");

        F({
            endpoint: "/channel/individual",
            method: "PUT",
            body: {
                to: address.trim(),
            },
        })
            .then(response => {
                setModal(null, {});

                for (let room of rooms) {
                    if (room.id === response.id) {
                        return setChatID(room.id);
                    }
                }

                addRoom({
                    id: response.id,
                    type: "individual",
                    secret: response.key,
                    title: address.trim()
                });
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
        if (!groupName?.trim()) return toast.error("Please enter a group name");
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

function Imported({
    setType,
}: {
    setType: React.Dispatch<React.SetStateAction<ChatTypes | null>>;
}) {
    const rooms = useRoomsStore(s => s.rooms);
    const addRoom = useRoomsStore(s => s.addRoom);
    const setModal = useModalStore(s => s.setModal);
    const setChatID = useChatStore(s => s.setChatID);

    const [id, setID] = useState("");

    function importServer(): any {
        if (!id?.trim()) return toast.error("Please enter a group name");

        F({
            endpoint: "/channel/import",
            method: "PUT",
            body: {
                id: id.trim(),
            },
        })
            .then(response => {
                setModal(null, {});

                for (let room of rooms) {
                    if (room.id === response.id) {
                        return setChatID(room.id);
                    }
                }

                console.log(response);

                addRoom({
                    id: response.id,
                    type: "imported",
                    secret: response.key,
                    title: "DC - " + (response.name)
                });
            })
            .catch(e => {
                console.error(e);
                toast.error(e.message);
            });
    }

    return (
        <div className="create-chat group">
            <div className="top">
                <h2>Enter Server ID</h2>
                <button onClick={() => setType(null)}>
                    <FaChevronLeft />
                </button>
            </div>

            <input placeholder="1002292111942635562" onChange={e => setID(e.target.value)} />

            <Button type="main" click={importServer}>
                Import Discord Server
            </Button>
        </div>
    );
}