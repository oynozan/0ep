import { useState } from 'react'
import { useUserStore } from '../../lib/states';

export default function Settings() {

    const user = useUserStore(s => s.user);

    const [noReadData, setNoReadData] = useState(null);

    return (
        <div id="settings">
            <div className="option">
                <label htmlFor="no-read-data"></label>
                <input id="no-read-data" type="checkbox" defaultChecked={false} />
            </div>
        </div>
    )
}