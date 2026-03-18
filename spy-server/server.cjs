const express = require("express");
const cors = require("cors");
const readline = require("readline");
const { Server } = require("socket.io");
const { createServer } = require("http");
const genCards = require("./module/genCards");

const app = express();
const server = createServer(app);
const port = 3000;
const io = new Server(server, {
	cors: {
		origin: "*",
		// origin: "http://localhost:5173", // address my front-end
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

io.on("connection", (socket) => {
	// ===== LOGIN =====
	socket.on("join", ({ username }) => {
		const isDuplicate = Object.values(users).some(
			(name) => name.toLowerCase() === username.toLowerCase(),
		);

		if (isDuplicate) {
			socket.emit("login-error", "Имя уже занято");
			return;
		}

		users[socket.id] = username;
		socket.emit("login-success", username);
		console.log("Пользователь подключился: ", username);
		io.emit("users", Object.values(users));
	});

	// ===== DISCONNECT =====
	socket.on("disconnect", () => {
		console.log("Пользователь отключился:", users[socket.id]);
		delete users[socket.id];

		for (const roomId in rooms) {
			const room = rooms[roomId];

			const index = room.players.findIndex((p) => p.id === socket.id);

			if (index !== -1) {
				room.players.splice(index, 1);

				if (room.players.length === 0) {
					delete rooms[roomId];
				}
			}
		}

		io.emit("users", Object.values(users));
	});

	// ===== CREATE ROOM =====
	socket.on(
		"create-room",
		({ roomID, numberPlayers, numberSpy, roundTime, location }) => {
			const username = users[socket.id];
			if (!username) {
				return socket.emit("room-error", "Вы не авторизованы!");
			}

			if (rooms[roomID])
				return socket.emit("room-error", "Комната уже существует!");

			rooms[roomID] = {
				players: [
					{
						id: socket.id,
						username,
						ready: false,
						role: null,
						roundTime,
						location,
					},
				],
				hostID: socket.id,
				numberPlayers,
				numberSpy,
				gameState: "waiting",
			};

			socket.join(roomID);
			io.to(roomID).emit("room-players", rooms[roomID].players);

			socket.emit("room-created", roomID);
			console.log(`Комната создана: #${roomID}`);
		},
	);

	// ===== JOIN ROOM =====
	socket.on("join-room", ({ roomID }) => {
		const room = rooms[roomID];
		const username = users[socket.id];

		if (!username) return socket.emit("room-error", "Вы не авторизованы!");
		if (!room) return socket.emit("room-error", "Комната не найдена!");
		if (room.players.length >= room.numberPlayers) {
			return socket.emit("room-error", "Комната заполнена!");
		}

		const newPlayer = {
			id: socket.id,
			username,
			ready: false,
			role: null,
		};

		room.players.push(newPlayer);
		socket.join(roomID);

		// 1️⃣ Отправляем ВСЕМ игрокам актуальный список
		io.to(roomID).emit("room-players", room.players);

		// 2️⃣ Если уже идет отсчет — отправляем текущий таймер новому игроку
		if (room.gameState === "countdown" && room.currentCountdown != null) {
			socket.emit("game-countdown", room.currentCountdown);
		}

		// 3️⃣ уведомление о присоединении
		socket.emit("room-joined", roomID);

		console.log(`${username} присоединился к комнате #${roomID}`);
	});

	socket.on("get-room-players", ({ roomID }) => {
		const room = rooms[roomID];
		if (!room) return socket.emit("room-error", "Комната не найдена!");
		socket.emit("room-players", room.players);
	});

	// ===== READY SYSTEM =====
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

		if (allReady && !room.countdownInterval) {
			room.gameState = "countdown";

			let timeLeft = 10;

			room.currentCountdown = timeLeft;

			room.countdownInterval = setInterval(() => {
				io.to(roomID).emit("game-countdown", timeLeft);
				room.currentCountdown = timeLeft; // чтобы новый игрок получил актуальное
				timeLeft--;

				if (timeLeft < 0) {
					clearInterval(room.countdownInterval);
					room.currentCountdown = null;

					const cards = genCards(room.numberPlayers, room.numberSpy);

					room.players.forEach((p, index) => {
						p.role = cards[index];
						io.to(p.id).emit("role-assigned", p.role);
					});

					const roundTime = room.players[0].roundTime;

					io.to(roomID).emit("start-game", { roundTime });

					let roundTimeLeft = Math.round(roundTime * 60);

					room.roundTimer = setInterval(() => {
						io.to(roomID).emit("round-time", roundTimeLeft);
						roundTimeLeft--;

						if (roundTimeLeft < 0) {
							clearInterval(room.roundTimer);
							console.log(`В комнате #${roomID} закончилась игра!`);
						}
					}, 1000);

					console.log(`В комнате #${roomID} началась игра!`);
				}
			}, 1000);
		}
	});
});







// ===== SERVER COMMANDS =====
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

rl.on("line", (input) => {
	const parts = input.trim().split(" ");
	const command = parts[0];
	const args = parts.slice(1);
	switch (command) {
		case "status": {
			console.log("Server running ✅");
			break;
		}
		case "stop": {
			console.log(colors.yellow + "❌❌❌ Stopping server!" + colors.reset);
			process.exit(0);
			break;
		}
		case "users": {
			console.log(`Now user: ${Object.keys(users).length} ,Users:`, users);
			break;
		}
		case "rooms": {
			console.log(rooms);
			break;
		}
		case "room": {
			if (args[0] === "players" && args[1]) {
				const roomID = args[1];
				const room = rooms[roomID];
				if (!room) {
					console.log(`Room №${roomID} is not defined.❌`);
				} else {
					console.log(`Players in room ${roomID}:`);
					room.players.forEach((p, index) => {
						console.log(
							`${index + 1}. ${p.username} (id: ${p.id}) (ready: ${p.ready})`,
						);
					});
				}
			}
			break;
		}
		default: {
			console.log("Unknown command ❌");
			break;
		}
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
