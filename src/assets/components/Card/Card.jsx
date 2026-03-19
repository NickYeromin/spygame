import { useState } from "react";
import "./Card.css";
import playerCard from "/images/player.png";
import spyCard from '/images/spy.jpg'
import bgcard from "/images/card.png";

export default function Card( {role,location}) {
	const [isFlipped, setIsFlipped] = useState(false);
	

	return (
		<div
			className={`card ${isFlipped ? "flipped" : ""}`}
			onClick={() => setIsFlipped(!isFlipped)}
		>
			<div className="card-inner">
				<div className="card-front">
					<img src={bgcard} alt="" />
				</div>
				<div className="card-back">
					<img src={role === 'player' ? playerCard : spyCard} alt="role" />
				</div>
			</div>
		</div>
	);
}
