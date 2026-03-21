import { useState } from "react";
import "./Card.css";
import playerCard from "/images/player.png";
import spyCard from "/images/spy.jpg";
import bgcard from "/images/card.png";
//===============SCHOOL===============
import assembly_room from "/images/location/school/assembly_room.png";
import computer_room from "/images/location/school/computer_room.png";
import corridor from "/images/location/school/corridor.png";
import dining_room from "/images/location/school/dining_room.png";
import director_room from "/images/location/school/director_room.png";
import dressing_room from "/images/location/school/dressing_room.png";
import liblary_room from "/images/location/school/liblary_room.png";
import math_room from "/images/location/school/math_room.png";
import medic_room from "/images/location/school/medic_room.png";
import museum_room from "/images/location/school/museum_room.png";
import music_room from "/images/location/school/music_room.png";
import phisic_room from "/images/location/school/phisic_room.png";
import sport_room from "/images/location/school/sport_room.png";
import teacher_room from "/images/location/school/teacher_room.png";
import toilet_room from "/images/location/school/toilet_room.png";
//====================================

export default function Card({ role, location, place }) {
	const [isFlipped, setIsFlipped] = useState(false);

	function placeLocation(location, place) {
		if (location === "school") {
			switch (place) {
				case "assembly_room":
					return { image_url: assembly_room, title: "Актовый зал" };
				case "computer_room":
					return { image_url: computer_room, title: "Компьютерный класс" };
				case "corridor":
					return { image_url: corridor, title: "Коридор" };
				case "dining_room":
					return { image_url: dining_room, title: "Столовая" };
				case "director_room":
					return { image_url: director_room, title: "Кабинет директора" };
				case "dressing_room":
					return { image_url: dressing_room, title: "Раздевалка" };
				case "liblary_room":
					return { image_url: liblary_room, title: "Библиотека" };
				case "math_room":
					return { image_url: math_room, title: "Кабинет математики" };
				case "medic_room":
					return { image_url: medic_room, title: "Медпункт" };
				case "museum_room":
					return { image_url: museum_room, title: "Музей" };
				case "music_room":
					return { image_url: music_room, title: "Музыкальный класс" };
				case "phisic_room":
					return { image_url: phisic_room, title: "Кабинет физики" };
				case "sport_room":
					return { image_url: sport_room, title: "Спортзал" };
				case "teacher_room":
					return { image_url: teacher_room, title: "Учительская" };
				case "toilet_room":
					return { image_url: toilet_room, title: "Туалет" };
				default:
					return { image_url: "", title: "Неизвестное место" };
			}
		} else {
			return { image_url: "", title: "Неизвестная локация" };
		}
	}

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
					{ role !== 'spy' ? <span className="card-title">{placeLocation(location,place).title}</span> : ''}
					<img src={role === "player" ? placeLocation(location,place).image_url : spyCard} alt="role" />
				</div>
			</div>
		</div>
	);
}
