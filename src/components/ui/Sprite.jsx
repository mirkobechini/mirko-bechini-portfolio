import { Link } from "react-router-dom";

export default function Sprite({ sprite }) {
  return (
    <Link to={sprite.link} style={{ ...sprite.pos, position: 'absolute' }} >
      <p>{sprite.label}</p>
    </Link>
  );
}