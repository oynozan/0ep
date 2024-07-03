/**
 * In the header, there'll be information about communication channel,
 * such as channel name, chat picture, participants, etc.
 */

import { useLocation } from 'react-router-dom';
import { useChatStore } from '../../lib/states';
import './header.scss';

export default function Header() {

    const pathname = useLocation().pathname;
    const chat = useChatStore();

    return (
        <header>
            {pathname.startsWith("/c/") && (
                <p>{chat?.title}</p>
            )}
            {pathname === "/settings" && (
                <p>Settings</p>
            )}
            {pathname === "/" && (
                <p>0ep Protocol - A new era in communication</p>
            )}
        </header>
    )
}