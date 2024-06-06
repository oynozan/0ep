/**
 * In the header, there'll be information about communication channel,
 * such as channel name, chat picture, participants, etc.
 */

import { useChatStore } from '../../lib/states';
import './header.scss';

export default function Header() {

    const chat = useChatStore();

    return (
        <header>
            { chat?.name ? (
                <p>{chat.name}</p>
            ) : (
                <p>0ep Protocol - A new era in communication</p>
            )}
        </header>
    )
}