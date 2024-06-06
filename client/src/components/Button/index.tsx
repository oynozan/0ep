import type { MouseEventHandler } from "react";

import './button.scss';

export default function Button({
    type = "main",
    href,
    click,
    custom,
    className,
    children,
    onMouseLeave,
    onMouseEnter
} : {
    type?: string,
    href?: string,
    click?: MouseEventHandler,
    custom?: Object,
    className?: string,
    onMouseLeave?: MouseEventHandler,
    onMouseEnter?: MouseEventHandler,
    children: React.ReactNode
}) {
    // Link
    if (href) {
        return (
            <a
                className={`button ${type} ${className ? className : ""}`}
                style={custom ? custom : undefined}
                onMouseLeave={onMouseLeave}
                onMouseEnter={onMouseEnter}
                href={href}
            >
                {children}
            </a>
        )
    }

    // Button
    return (
        <button
            className={`button ${type} ${className ? className : ""}`}
            style={custom ? custom : undefined}
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            onClick={click}
        >
            {children}
        </button>
    )
}