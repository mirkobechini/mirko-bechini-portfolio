import { Link } from "react-router-dom";

export default function HomePage() {

    return (
        <div className="den-container">
            {/* Sprite statico Scimmia */}
            <Link to="/aboutme">
               {/* <img src="./assets/sprite-scimmia-statica.png" alt="About me" />*/}
                <p>Mirko</p>
            </Link>
        </div>
    )
}