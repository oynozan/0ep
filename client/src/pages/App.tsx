import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import Cookie from "../lib/cookie";
import { F } from "../lib/helpers";
import { useUserStore, type IUser } from "../lib/states";

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

    const setUser = useUserStore(state => state.setUser);

    const [userExists, setUserExists] = useState(true);

    useEffect(() => {
        /* Account Check */

        // Check existance of "access_token" via "logged" cookie
        // Since access_token is a HTTP-only cookie, can't check it directly
        // on client side
        const logged_status = Cookie.get("logged");

        if (logged_status !== "1") {
            setUserExists(false);
            return;
        }

        // Try to get user information, if access_token is invalid, throws an error
        F({
            endpoint: "/auth/get",
            method: "GET",
        })
            .then((res: IUser) => {
                // Set user information to global state
                setUser(res);

                // Set "logged" cookie
                Cookie.set("logged", "1", 90);
            })
            .catch(err => {
                // Delete "logged" cookie since it holds data for an invalid access_token

            });
    }, []);

    return (
        <>
            <Modals /> {/* Modal handler */}
            <Sidebar />

            { !userExists && (<Login />) /* Set login modal if not logged in */ }

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
