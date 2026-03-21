function genPlaceLocation(location) {
	switch (location) {
		case "school":
			const place = [
				"assembly_room",
				"chemistry_room",
				"computer_room",
				"corridor",
				"dining_room",
				"director_room",
				"dressing_room",
				"liblary_room",
				"literature_room",
				"math_room",
				"medic_room",
				"museum_room",
				"music_room",
				"phisic_room",
				"sport_room",
				"teacher_room",
				"toilet_room",
			];

			return place[Math.round(Math.random() * place.length)];

			break;

		case "room":
			break;
		case "tower":
			break;
		case "metro":
			break;
		case "island":
			break;
	}
}

module.exports = genPlaceLocation;
