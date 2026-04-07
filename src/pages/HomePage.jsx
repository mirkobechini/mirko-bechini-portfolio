import Sprite from "../components/ui/Sprite";
import spriteData from "../data/spriteData";

export default function HomePage() {

    return (
        <div className="den-container" style={{ position: "relative" }}>
            {spriteData.map((sprite) => (
                <Sprite key={sprite.id} sprite={sprite} />
            ))}
        </div>
    )
}