import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../api/socket";
import "./Roompage.css";

export default function Roompage() {
	const [roomPlayers, setRoomPlayers] = useState([]);
	const [isReady, setIsReady] = useState(false);
	const [countdown, setCountdown] = useState(null);

	const { roomID } = useParams();

	const handleReady = () => {
		const newReady = !isReady;
		setIsReady(newReady);
		socket.emit("player-ready", { roomID, ready: newReady });
	};

	const formatTime = (seconds) => {
		const m = Math.floor(seconds / 60)
			.toString()
			.padStart(2, "0");
		const s = (seconds % 60).toString().padStart(2, "0");
		return `${m}:${s}`;
	};

	useEffect(() => {
		const handleRoomPlayers = (players) => {
			console.log("Обновление списка игроков:", players);
			setRoomPlayers(players);
		};
		const handleCountdown = (time) => setCountdown(time);

		socket.on("room-players", handleRoomPlayers);
		socket.on("game-countdown", handleCountdown);

		// Получаем текущий список игроков сразу при подключении
		socket.emit("get-room-players", { roomID });

		return () => {
			socket.off("room-players", handleRoomPlayers);
			socket.off("game-countdown", handleCountdown);
		};
	}, [roomID, roomPlayers, countdown]);

	return (
		<>
			<h2>Комната #{roomID}</h2>
			{countdown !== null ? (
				<span>Игра начнется через:{countdown}</span>
			) : (
				<span>ОЖИДАЕМ ИГРОКОВ</span>
			)}
			<span>Игроки:</span>
			{roomPlayers.map((player) => (
				<li key={player.id} className={player.ready === true ? "green" : "red"}>
					{player.username}
				</li>
			))}
			<button onClick={handleReady}>Готов</button>
		</>
	);
}
