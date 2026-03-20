import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../api/socket";
import "./Roompage.css";
import Card from "../../Card/Card";

export default function Roompage() {
	const [roomPlayers, setRoomPlayers] = useState([]);
	const [isReady, setIsReady] = useState(false);
	const [countdown, setCountdown] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [roundTime, setRoundTime] = useState(null);
	const [playerRole, setPlayerRole] = useState(null);
	const [isVoteReady, setIsVoteReady] = useState(false);
	const [isVote, setIsVote] = useState(false);
	const [currentPlayers, setCurrentPlayers] = useState([]);
	const [message, setMessage] = useState("");
	const [isGameOver, setIsGameOver] = useState(false);

	const { roomID } = useParams();

	const handleReady = () => {
		const newReady = !isReady;
		setIsReady(newReady);

		socket.emit("player-ready", {
			roomID,
			ready: newReady,
		});
	};

	const handleVoteReady = () => {
		const newVoteReady = !isVoteReady;
		setIsVoteReady(newVoteReady);

		socket.emit("vote-ready", {
			roomID,
			voteReady: newVoteReady,
		});
	};

	const handleVote = (data) => {
		console.log(data.currentPlayers);
		setCurrentPlayers(data.currentPlayers);
		setIsVote(true);
	};

	const handleVoteSelectPlayer = (playerID) => {
		socket.emit("vote-select", { roomID, playerID });
		setIsVote(false);
	};

	const formatTime = (seconds) => {
		if (seconds == null) return "";
		const m = Math.floor(seconds / 60)
			.toString()
			.padStart(2, "0");
		const s = (seconds % 60).toString().padStart(2, "0");
		return `${m}:${s}`;
	};

	useEffect(() => {
		const handleRoomPlayers = (players) => {
			setRoomPlayers(players);

			// синхронизация ready состояния
			const me = players.find((p) => p.id === socket.id);
			if (me) setIsReady(me.ready);
		};

		const handleCountdown = (time) => {
			setCountdown(time);
			if (time <= 0) setIsPlaying(true);
		};

		const handleStartGame = () => {
			setIsPlaying(true);
		};

		const handleRoundTime = (time) => {
			setRoundTime(time);
		};

		const handlePlayerRole = (role) => {
			setPlayerRole(role);
		};

		socket.on("room-players", handleRoomPlayers);
		socket.on("game-countdown", handleCountdown);
		socket.on("start-game", handleStartGame);
		socket.on("round-time", handleRoundTime);
		socket.on("role-assigned", handlePlayerRole);
		socket.on("vote-start", handleVote);
		socket.on("vote-kick", (data) => {
			console.log("Ирок выгнан!", data);
			alert(`Результат голосования! \n Игрок ${data} выбыл из игры!`);
			setIsVote(false);
		});
		socket.on("vote-message", (message) => {
			alert(message);
			setIsVote(false);
		});
		socket.on("room-error", (message) => {
			alert(message);
		});
		socket.on("game-over", (message) => {
			alert(message);
			setIsGameOver(true);
		});

		// 🔥 правильный запрос игроков
		socket.emit("get-room-players", { roomID });

		return () => {
			socket.off("room-players", handleRoomPlayers);
			socket.off("game-countdown", handleCountdown);
			socket.off("start-game", handleStartGame);
			socket.off("round-time", handleRoundTime);
			socket.off("vote-start", handleVote);
			socket.off("vote-kick");
			socket.off("room-error");
			socket.off("game-over");
		};
	}, [roomID]);

	return (
		<>
			<h2>Комната #{roomID}</h2>
			{!isGameOver && (isPlaying ? (
				<span className="green">Игра идёт</span>
			) : (
				<span className="red">Ожидание</span>
			))}
			{/* {isPlaying ? (
				<span className="green">Игра идёт</span>
			) : (
				<span className="red">Ожидание</span>
			)} */}
			{isGameOver && <span className="red">Игра окончена!</span>}
			<br />

			{countdown !== null && !isPlaying && (
				<span>Игра начнётся через: {countdown}</span>
			)}

			{!isGameOver && isPlaying && roundTime !== null && (
				<span className="green">Осталось времени: {formatTime(roundTime)}</span>
			)}

			{!isPlaying && <h3>Игроки:</h3>}
			{!isPlaying && (
				<ul>
					{roomPlayers.map((player) => (
						<li key={player.id} className={player.ready ? "green" : "red"}>
							{player.username}
						</li>
					))}
				</ul>
			)}

			{!isPlaying && (
				<button onClick={handleReady}>
					{isReady ? "Отменить готовность" : "Готов"}
				</button>
			)}

			{isPlaying && <Card role={playerRole} />}
			{playerRole === "spy" ? <button>Я знаю место</button> : null}

			{isPlaying && (
				<button onClick={handleVoteReady} disabled={isVote ? true : false}>
					Я знаю кто шпион
				</button>
			)}

			{isVote &&
				currentPlayers.map((player) => (
					<div key={player.id}>
						{" "}
						<span>{player.username}</span>{" "}
						<button onClick={() => handleVoteSelectPlayer(player.id)}>
							Выбрать
						</button>{" "}
					</div>
				))}
		</>
	);
}
