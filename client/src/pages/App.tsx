import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import Cookie from "../lib/cookie";
import { F } from "../lib/helpers";
import { Wallet } from "../lib/wallet";
import { useRoomsStore, useUserStore, type IUser } from "../lib/states";

// Components
import Login from "../components/Login";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Modals from "../components/Modal/Modals";

// Pages
import Chat from "./Chat";
import Welcome from "./Welcome";

import "../styles/app.scss";

export default function App() {
    const user = useUserStore(state => state.user);
    const setUser = useUserStore(state => state.setUser);
    const setRooms = useRoomsStore(state => state.setRooms);

    const [userExists, setUserExists] = useState(true);

    useEffect(() => {
        /* Account Check */

        // Check existance of "access-token" via "logged" cookie
        // Since access-token is a HTTP-only cookie, can't check it directly
        // on client side
        const logged_status = Cookie.get("logged");

        if (logged_status !== "1") {
            setUserExists(false);
            return;
        }

        // Try to get user information, if access-token is invalid, throws an error
        F({
            endpoint: "/auth",
            method: "GET",
        })
            .then(async (res: IUser) => {
                // Set user information to global state
                setUser(res);

                // Connect the wallet
                const wallet = new Wallet("keplr");
                const connectResponse = await wallet.connect();

                // If wallet is invalid, user needs to login again
                if (connectResponse === null) {
                    setUser(null);
                    Cookie.erase("logged");
                    return setUserExists(false);
                }

                // Check if user has verified its account
                // User actually exists, but setting this false to let user verify the account
                if (!res.verified) return setUserExists(false);
                setUserExists(true);
            })
            .catch(err => {
                console.error(err);

                // Delete "logged" cookie since it holds data for an invalid access-token
                Cookie.erase("logged");
                setUserExists(false);
            });
    }, []);

    useEffect(() => {
        if (user && user?.verified) {
            // Get chat rooms
            F({
                endpoint: "/channel/rooms",
                method: "GET",
            }).then(response => {
                setRooms(response.rooms);
            });
        }
    }, [user]);

    return (
        <>
            <Modals /> {/* Modal handler */}
            <Sidebar />
            {!userExists && <Login /> /* Set login modal if not logged in */}
            <div id="main-container">
                <Header />

                <main>
                    <Routes>
                        <Route path="/" element={<Welcome />} />
                        <Route path="/c/:id" element={<Chat />} />
                    </Routes>
                </main>
            </div>
        </>
    );
}
