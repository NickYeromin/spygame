const express = require("express");
const cors = require("cors");
const readline = require("readline");
const { Server } = require("socket.io");
const { createServer } = require("http");
const genCards = require("./module/genCards");
const { socket } = require("../../Spy test/src/components/socket");

const app = express();
const server = createServer(app);
const port = 3000;

const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

app.use(cors());

app.get("/", (req, res) => {
	res.send("<h1>SPY-SERVER</h1>");
});

const colors = {
	//for logs
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
};

const users = {};
const rooms = {};

// ================= SOCKET =================
io.on("connection", (socket) => {
	// ===== LOGIN =====
	socket.on("join", ({ username }) => {
		if (!username) return;

		const isDuplicate = Object.values(users).some(
			(name) => name.toLowerCase() === username.toLowerCase(),
		);

		if (isDuplicate) {
			socket.emit("login-error", "Имя уже занято");
			return;
		}

		users[socket.id] = username;
		socket.emit("login-success", username);
		io.emit("users", Object.values(users));
		console.log(`Игрок "${username}" авторизовался!`);
	});

	// ===== DISCONNECT =====
	socket.on("disconnect", () => {
		const username = users[socket.id];
		delete users[socket.id];

		for (const roomID in rooms) {
			const room = rooms[roomID];

			const index = room.players.findIndex((p) => p.id === socket.id);

			if (index !== -1) {
				room.players.splice(index, 1);

				// очистка таймеров если комната пустая
				if (room.players.length === 0) {
					clearInterval(room.countdownTimer);
					clearInterval(room.roundTimer);
					delete rooms[roomID];
				} else {
					io.to(roomID).emit("room-players", room.players);
				}
			}
		}

		io.emit("users", Object.values(users));
		if (username !== undefined)
			console.log(`Игрок "${username}" покинул игру!`);
	});

	// ===== CREATE ROOM =====
	socket.on(
		"create-room",
		({ roomID, numberPlayers, numberSpy, timeRound, location }) => {
			const username = users[socket.id];
			if (!username) return socket.emit("room-error", "Вы не авторизованы!");

			if (rooms[roomID])
				return socket.emit("room-error", "Комната уже существует!");

			rooms[roomID] = {
				players: [
					{
						id: socket.id,
						username,
						ready: false,
						role: null,
						voteReady: false,
					},
				],
				hostID: socket.id,
				numberPlayers,
				numberSpy,
				roundTime: timeRound,
				location,
				gameState: "waiting",
				countdownTimer: null,
				roundTimer: null,
				currentCountdown: null,
				votePlayers: {},
			};

			socket.join(roomID);
			io.to(roomID).emit("room-players", rooms[roomID].players);
			socket.emit("room-created", roomID);
			console.log(`Игрок "${username}" создал комнату #${roomID}!`);
		},
	);

	// ===== JOIN ROOM =====
	socket.on("join-room", ({ roomID }) => {
		const room = rooms[roomID];
		const username = users[socket.id];

		if (!username) return socket.emit("room-error", "Вы не авторизованы!");
		if (!room) return socket.emit("room-error", "Комната не найдена!");
		if (room.players.length >= room.numberPlayers)
			return socket.emit("room-error", "Комната заполнена!");

		room.players.push({
			id: socket.id,
			username,
			ready: false,
			role: null,
			voteReady: false,
		});
		socket.join(roomID);

		io.to(roomID).emit("room-players", room.players);

		// отправка текущего countdown
		if (room.gameState === "countdown" && room.currentCountdown != null) {
			socket.emit("game-countdown", room.currentCountdown);
		}

		socket.emit("room-joined", roomID);
		console.log(`Игрок "${username}" вошел в комнату #${roomID}`);
	});

	// ===== READY =====
	socket.on("player-ready", ({ roomID, ready }) => {
		const room = rooms[roomID];
		if (!room) return;

		const player = room.players.find((p) => p.id === socket.id);
		if (!player) return;

		player.ready = ready;
		io.to(roomID).emit("room-players", room.players);

		const allReady =
			room.players.length === room.numberPlayers &&
			room.players.every((p) => p.ready) &&
			room.gameState === "waiting";

		if (allReady) startCountdown(roomID);
	});

	// ===== Voted players =====
	socket.on("vote-ready", ({ roomID, voteReady }) => {
		const room = rooms[roomID];
		if (!room) return socket.emit("room-error", "Комната не найдена!");

		const username = users[socket.id];
		if (!username) return socket.emit("room-error", "Вы авторизованы!");

		const player = room.players.find((p) => p.id === socket.id);
		if (!player) return socket.emit("room-error", "Игрок не найден в комнате!");

		player.voteReady = voteReady;

		votePlayers(roomID);
	});

	socket.on("vote-select", ({ roomID, playerID }) => {
		const room = rooms[roomID];
		if (!room) return;

		const username = users[socket.id];
		if (!username) return socket.emit("room-error", "Вы не авторизованы!");

		const player = room.players.find((p) => p.id === socket.id);
		if (!player) return socket.emit("room-error", "Игрок не найден в комнате!");

		const currentPlayers = room.players;

		room.votePlayers[users[playerID]] += 1;

		let currVoteCount = 0;
		for (let key of Object.keys(room.votePlayers)) {
			currVoteCount += room.votePlayers[key];
		}

		if (currVoteCount === currentPlayers.length) // если проголосовали все
		{
			const maxVotes = Math.max(...Object.values(room.votePlayers));
			const winners = Object.keys(room.votePlayers).filter(
				(key) => room.votePlayers[key] === maxVotes,
			);
			if (winners.length === 1) {
				io.to(roomID).emit("vote-kick", winners[0]);
				room.votePlayers = {};
				room.players = room.players.filter(
					(player) => player.username !== winners[0],
				);
				console.log(`Игроки выгнали ${winners[0]} из комнаты.`);
			} else if (winners.length > 1) {
				io.to(roomID).emit("vote-message",'Игроки не смогли определиться кого выгнать.');
				room.votePlayers = {};
				console.log('Игроки не смогли определиться кого выгнать.')
			}
		}
	});
});

// ================= GAME LOGIC =================

function startCountdown(roomID) {
	const room = rooms[roomID];
	if (!room) return;

	room.gameState = "countdown";
	let timeLeft = 10;

	room.countdownTimer = setInterval(() => {
		room.currentCountdown = timeLeft;
		io.to(roomID).emit("game-countdown", timeLeft);

		timeLeft--;

		if (timeLeft < 0) {
			clearInterval(room.countdownTimer);
			room.currentCountdown = null;
			startGame(roomID);
		}
	}, 1000);
}

function startGame(roomID) {
	const room = rooms[roomID];
	if (!room) return;

	room.gameState = "playing";

	// перемешка игроков
	const shuffled = [...room.players].sort(() => Math.random() - 0.5);
	const cards = genCards(room.numberPlayers, room.numberSpy);

	shuffled.forEach((p, i) => {
		p.role = cards[i];
		io.to(p.id).emit("role-assigned", p.role);
	});

	startRoundTimer(roomID);
}

function startRoundTimer(roomID) {
	const room = rooms[roomID];
	if (!room) return;

	let timeLeft = Math.round(room.roundTime * 60);

	room.roundTimer = setInterval(() => {
		io.to(roomID).emit("round-time", timeLeft);
		timeLeft--;

		if (timeLeft < 0) {
			clearInterval(room.roundTimer);
			room.gameState = "finished";
			io.to(roomID).emit("game-over");
		}
	}, 1000);
}

function votePlayers(roomID) {
	const room = rooms[roomID];
	if (!room) return;

	const currentPlayers = room.players;
	const midleVotes = Math.round(currentPlayers.length / 2);
	const readyVote = room.players.filter((p) => p.voteReady).length;
	// console.log(
	// 	`currPlayers->${currentPlayers.length}	|	midleVoters->${midleVotes}	|	readyVote->${readyVote}`,
	// );
	for (const player of currentPlayers) {
		room.votePlayers[player.username] = 0;
	}

	if (readyVote >= midleVotes) {
		//начинаем голосование
		console.log("Игроки начали голосование!");
		io.emit("vote-start", { currentPlayers });
	}
}

// ================= COMMANDS =================
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

rl.on("line", (input) => {
	const [command, ...args] = input.trim().split(" ");

	switch (command) {
		case "status":
			console.log("Server running ✅");
			break;

		case "stop":
			console.log("Stopping server...");
			process.exit(0);
			break;

		case "users":
			console.log(users);
			break;

		case "rooms":
			console.log(rooms);
			break;

		case "room": {
			const roomID = args[1];
			const room = rooms[roomID];

			if (!room) {
				console.log(`Комнаты #${roomID} не существует!`);
				break;
			}

			switch (args[0]) {
				case "players":
					console.log(room.players);
					break;
				case "vote":
					console.log(room.votePlayers || []);
					break;
				default:
					console.log(`Неизвестная команда: ${args[0]}`);
			}

			break;
		}

		default:
			console.log("Unknown command ❌");
	}
});

server.listen(port, "0.0.0.0", () => {
	console.log(
		colors.yellow +
			`✅ Server running at:` +
			colors.green +
			`\n-> http://0.0.0.0:${port}\n-> http://localhost:${port}\n-> http://192.168.0.202:${port}` +
			colors.reset,
	);
});
