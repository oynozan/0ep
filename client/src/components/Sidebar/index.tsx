import { useState } from "react";
import { Link, useLocation } from 'react-router-dom';

import Button from "../Button";
import Tooltip from "../Tooltip";
import Cookie from '../../lib/cookie';
import ChannelPicture from '../Channels/ChannelPicture';
import CreateChannelModal from '../Channels/CreateChannelModal';
import { decrypt, truncateWalletAddress } from '../../lib/helpers';
import { useChatStore, useFilterStore, useModalStore, useRoomsStore } from "../../lib/states";

// Icons
import { CgLogOut } from "react-icons/cg";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { FaCirclePlus, FaGear, FaUserSecret } from "react-icons/fa6";

import "./sidebar.scss";

export default function Sidebar() {
    const location = useLocation();

    const isHome = location.pathname === "/";

    const rooms = useRoomsStore(state => state.rooms);
    const chatTitle = useChatStore(state => state.title);
    const search = useFilterStore(state => state.search);
    const setModal = useModalStore(state => state.setModal);
    const filter = useFilterStore(state => state.listFilter);
    const setFilter = useFilterStore(state => state.setListFilter);

    const [tooltip, setTooltip] = useState<string | null>(null);

    function logout() {
        Cookie.erase("access-token");
        Cookie.erase("logged");
        window.location.reload();
    }

    return (
        <nav id="sidebar" className={isHome ? "home-sidebar" : undefined}>
            {/* Settings & Profile Picture */}
            <div className="left">
                <div className="logo">
                    <img src="/images/logo.svg" />
                </div>
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

                    <Link
                        to="/settings"
                        onMouseLeave={() => setTooltip(null)}
                        onMouseEnter={() => setTooltip("settings")}
                    >
                        <FaGear color="rgba(120, 120, 120, .7)" />
                        <Tooltip position="right" visibility={tooltip === "settings"}>
                            Settings
                        </Tooltip>
                    </Link>

                    <Button
                        type="blank"
                        click={logout}
                        onMouseLeave={() => setTooltip(null)}
                        onMouseEnter={() => setTooltip("logout")}
                    >
                        <CgLogOut color="rgba(120, 120, 120, .7)" />
                        <Tooltip position="right" visibility={tooltip === "logout"}>
                            Logout
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
                        if (encryptedLastMessage)
                            decryptedLastMessage = decrypt(encryptedLastMessage, r.secret);

                        const isCurrentRoom = r.title === chatTitle;

                        const RoomContent = () => (
                            <>
                                <ChannelPicture id={r.id} size={50} />
                                <div className="room-info">
                                    <h5>{title}</h5>
                                    <p>{decryptedLastMessage || <span>No messages yet</span>}</p>
                                </div>
                            </>
                        )

                        if (isCurrentRoom) return (
                            <div
                                key={i}
                                className='room current'
                            >
                                <RoomContent />
                            </div>
                        )

                        return (
                            <Link
                                key={i}
                                to={`/c/${r.id}`}
                                className={"room " + (isCurrentRoom ? "current" : "")}
                            >
                                <RoomContent />
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
