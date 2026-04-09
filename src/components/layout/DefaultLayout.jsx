import { Outlet } from "react-router-dom";
import { useContext } from "react";
import GlobalContext from "../../context/GlobalContext";

export default function DefaultLayout() {

    return (
        <>
            <main>
                <Outlet />
            </main>
        </>
    )
}