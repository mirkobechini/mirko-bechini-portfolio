import { Link } from "react-router-dom";

export default function AppHeader() {

    return (
        <header>
            <Link to="/"><h1 style={{color:"black"}}>Mirko Bechini</h1></Link>
        </header>
    )
}