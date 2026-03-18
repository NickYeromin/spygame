function genCards(maxPlayers, countSpy) {
	let result = [];
	let spy = countSpy;
	for (let i = 0; i < maxPlayers; i++) {
		result.push("player");
	}

	while (spy > 0) {
		let random = Math.floor(Math.random() * maxPlayers); // правильный диапазон
		if (result[random] === "player") {
			result[random] = "spy";
			spy--; // уменьшаем счётчик только при успешной замене
		}
	}

	return result;
}


module.exports = genCards;