import { Outlet } from "react-router-dom";
import { useContext } from "react";
import AppHeader from "../ui/AppHeader";
import AppFooter from "../ui/AppFooter";
import GlobalContext from "../../context/GlobalContext";

export default function DefaultLayout() {

    return (
        <>
            <AppHeader />
            <main>
                <Outlet />
            </main>
            <AppFooter />
        </>
    )
}