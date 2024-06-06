import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Chat() {
    const { id } = useParams(); // Chat ID

    useEffect(() => {
        // Get chat details

        // Set page title
        document.title = "" + " - 0ep"
    }, [id]);

    return <div id="chat"></div>;
}
