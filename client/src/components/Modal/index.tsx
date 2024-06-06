import "./modal.scss";

export default function Modal({
    closable = true,
    set,
    children,
    closing = false,
    customID = null,
}: {
    set: (type: string, options: any) => void;
    children: React.ReactNode;
    closing: boolean;
    closable?: boolean;
    customID?: string | null;
}) {
    const close = (e: React.MouseEvent<HTMLDivElement> | undefined) => {
        if (!(e?.target as HTMLElement)?.closest("#modal .modal-content")) set("", {});
    };

    return (
        <div
            id="modal"
            className={closing ? "closing" : undefined}
            onClick={e => {
                if (closable) {
                    close(e);
                }
            }}
        >
            <div
                className="modal-content"
                id={customID ? customID : undefined}
            >
                {children}
            </div>
        </div>
    );
}
