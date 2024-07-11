/**
 * In the header, there'll be information about communication channel,
 * such as channel name, chat picture, participants, etc.
 */

import { Link, useLocation } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa";
import { useChatStore } from "../../lib/states";
import "./header.scss";

export default function Header() {
    const pathname = useLocation().pathname;
    const chat = useChatStore();

    return (
        <header>
            {pathname !== "/" && (
                <Link to="/" className="go-back">
                    <FaAngleLeft color="var(--l-gray)" size={30} />
                </Link>
            )}
            {pathname.startsWith("/c/") && <p>{chat?.title}</p>}
            {pathname === "/settings" && <p>Settings</p>}
            {pathname === "/" && <p>0ep Protocol - A new era in communication</p>}
        </header>
    );
}
