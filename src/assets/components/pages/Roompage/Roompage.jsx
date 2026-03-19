import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../api/socket";
import "./Roompage.css";

export default function Roompage() {
	const [roomPlayers, setRoomPlayers] = useState([]);
	const [isReady, setIsReady] = useState(false);
	const [countdown, setCountdown] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [roundTime, setRoundTime] = useState(null);

	const { roomID } = useParams();

	const handleReady = () => {
		const newReady = !isReady;
		setIsReady(newReady);

		socket.emit("player-ready", {
			roomID,
			ready: newReady,
		});
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
		};

		const handleStartGame = () => {
			setIsPlaying(true);
		};

		const handleRoundTime = (time) => {
			setRoundTime(time);
		};

		socket.on("room-players", handleRoomPlayers);
		socket.on("game-countdown", handleCountdown);
		socket.on("start-game", handleStartGame);
		socket.on("round-time", handleRoundTime);

		// 🔥 правильный запрос игроков
		socket.emit("get-room-players", { roomID });

		return () => {
			socket.off("room-players", handleRoomPlayers);
			socket.off("game-countdown", handleCountdown);
			socket.off("start-game", handleStartGame);
			socket.off("round-time", handleRoundTime);
		};
	}, [roomID]);

	return (
		<>
			<h2>Комната #{roomID}</h2>

			{isPlaying ? (
				<span className="green">Игра идёт</span>
			) : (
				<span className="red">Ожидание</span>
			)}

			<br />

			{countdown !== null && !isPlaying && (
				<span>Игра начнётся через: {countdown}</span>
			)}

			{isPlaying && roundTime !== null && (
				<span>Осталось времени: {formatTime(roundTime)}</span>
			)}

			<h3>Игроки:</h3>
			<ul>
				{roomPlayers.map((player) => (
					<li key={player.id} className={player.ready ? "green" : "red"}>
						{player.username}
					</li>
				))}
			</ul>

			{!isPlaying && (
				<button onClick={handleReady}>
					{isReady ? "Отменить готовность" : "Готов"}
				</button>
			)}
		</>
	);
}
