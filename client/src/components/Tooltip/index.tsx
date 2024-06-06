import { useEffect, useState } from 'react';

import './tooltip.scss';

export default function Tooltip({
    children,
    custom = null,
    position = "right",
    visibility = false,
} : {
    children: React.ReactNode,
    custom?: object | null,
    position?: "right" | "left" | "top" | "bottom",
    visibility?: boolean,
}) {

    const [visibilityState, setVisibilityState] = useState(false);
    const [style, setStyle] = useState({});

    useEffect(() => {
        setVisibilityState(visibility);

        if (visibility) {
            setTimeout(() => {
                setStyle({ opacity: 1 });
            }, 150);
        } else {
            setTimeout(() => {
                setStyle({ display: "none" });
            }, 150);
        }
    }, [visibility])

    return (
        <div
            className={`tooltip ${position}`}
            style={{
                ...(custom ? custom : {}),
                ...(visibilityState
                    ? { ...style, display: "flex" }
                    : { ...style, opacity: 0 }
                ),
            }}
        >
            {children}
        </div>
    )
}