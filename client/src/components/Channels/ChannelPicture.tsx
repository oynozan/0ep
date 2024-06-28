import { stringToColor } from '../../lib/helpers';

export default function ChannelPicture({ id, size } : { id: string, size: number }) {
    return (
        <div
            className="channel-picture"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                minWidth: `${size}px`,
                minHeight: `${size}px`,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${stringToColor(id)}, ${stringToColor(id + id)})`
            }}
        ></div>
    )
}