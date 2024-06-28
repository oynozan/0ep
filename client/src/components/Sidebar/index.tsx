import { useState } from "react";
import { Link } from 'react-router-dom';

import Button from "../Button";
import Tooltip from "../Tooltip";
import ChannelPicture from '../Channels/ChannelPicture';
import { decrypt, truncateWalletAddress } from '../../lib/helpers';
import CreateChannelModal from '../Channels/CreateChannelModal';
import { useFilterStore, useModalStore, useRoomsStore } from "../../lib/states";

// Icons
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { FaCirclePlus, FaGear, FaUserSecret } from "react-icons/fa6";

import "./sidebar.scss";

export default function Sidebar() {
    const rooms = useRoomsStore(state => state.rooms);
    const setModal = useModalStore(state => state.setModal);
    const search = useFilterStore(state => state.search);
    const filter = useFilterStore(state => state.listFilter);
    const setFilter = useFilterStore(state => state.setListFilter);

    const [tooltip, setTooltip] = useState<string | null>(null);

    return (
        <nav id="sidebar">
            {/* Settings & Profile Picture */}
            <div className="left">
                <div className="profile"></div>
                <div className="settings">
                    <Button
                        type="blank"
                        onMouseLeave={() => setTooltip(null)}
                        onMouseEnter={() => setTooltip("anonymous")}
                    >
                        <FaUserSecret color="rgba(120, 120, 120, .7)" />
                        <Tooltip position="right" visibility={tooltip === "anonymous"}>
                            Max-Stealth Mode
                            <small>(Coming Soon)</small>
                        </Tooltip>
                    </Button>

                    <Button
                        type="blank"
                        onMouseLeave={() => setTooltip(null)}
                        onMouseEnter={() => setTooltip("settings")}
                    >
                        <FaGear color="rgba(120, 120, 120, .7)" />
                        <Tooltip position="right" visibility={tooltip === "settings"}>
                            Settings
                        </Tooltip>
                    </Button>
                </div>
            </div>

            {/* Chats & Import Chat Option */}
            <div className="right">
                <div className="top">
                    <div className="search-bar">
                        <HiMiniMagnifyingGlass size={20} />
                        <input
                            placeholder="Search..."
                            spellCheck={false}
                        />
                    </div>

                    <div className="tags">
                        <div
                            className={filter === "all" ? "active" : undefined}
                            onClick={() => setFilter("all")}
                        >
                            All
                        </div>
                        <div
                            className={filter === "group" ? "active" : undefined}
                            onClick={() => setFilter("group")}
                        >
                            Groups
                        </div>
                        <div
                            className={filter === "imported" ? "active" : undefined}
                            onClick={() => setFilter("imported")}
                        >
                            Imported
                        </div>
                    </div>
                </div>

                <div className="rooms">
                    {!rooms?.length && <p className="no-room">There are no chat rooms.</p>}
                    {rooms.map((r, i) => {
                        if (filter && r.type !== filter && filter !== "all") return <></>;
                        if (search && !r.title.includes(search)) return <></>;

                        // Room ID is the receiver's wallet address OR group name
                        let title = r.title;
                        if (!title) return <></>;
                        if (r.title.startsWith("nibi")) title = truncateWalletAddress(title);

                        // Decrypt the last sent message, then show it on room link
                        const encryptedLastMessage = r.lastMessage?.message;
                        let decryptedLastMessage = "";
                        if (encryptedLastMessage) {
                            // decryptedLastMessage = decrypt(encryptedLastMessage, r.secret);
                            decryptedLastMessage = encryptedLastMessage;
                        }

                        return (
                            <Link
                                key={i}
                                to={`/c/${r.id}`}
                                className="room"
                            >
                                <ChannelPicture id={r.id} size={50} />
                                <div className="room-info">
                                    <h5>{title}</h5>
                                    <p>{decryptedLastMessage || <span>No messages yet</span>}</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                <div
                    className="add"
                    onClick={() => setModal("custom", {
                        content: <CreateChannelModal />,
                        customID: "dynamic-size"
                    })}
                >
                    <FaCirclePlus />
                    <p>Create or import a channel</p>
                </div>
            </div>
        </nav>
    );
}
