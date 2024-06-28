import { useState } from "react";

import Button from "../Button";
import Tooltip from "../Tooltip";
import CreateChannelModal from '../Channels/CreateChannelModal';
import { useFilterStore, useModalStore } from "../../lib/states";

// Icons
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { FaCirclePlus, FaGear, FaUserSecret } from "react-icons/fa6";

import "./sidebar.scss";

export default function Sidebar() {
    const setModal = useModalStore(state => state.setModal);
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
                            className={filter === "groups" ? "active" : undefined}
                            onClick={() => setFilter("groups")}
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

                <div className="chats"></div>

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
