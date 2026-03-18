import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../Logo/Logo";
import "./Createroompage.css";
import { socket } from "../../api/socket";

export default function Createroompage() {
	const [roomID, setRoomID] = useState("");
	const [numberPlayers, setNumberPlayers] = useState("");
	const [numberSpy, setNumberSpy] = useState("");
	const [timeRound, setTimeRound] = useState("");
	const [location, setLocation] = useState("");

	const navigate = useNavigate();

	const handleCreateRoom = (e) => {
		e.preventDefault();

		if (!roomID.trim()) return alert("Введите код комнаты!");
		if (Number(numberPlayers) < 3) return alert("Минимум 3 игрока!");
		if (Number(numberSpy) < 1) return alert("Минимум 1 шпион!");
		if (Number(numberSpy) > Number(numberPlayers))
			return alert("Шпионов не может быть больше игроков!");

		alert("Комната создана!");
		socket.emit("create-room", {
			roomID: Number(roomID),
			numberPlayers: Number(numberPlayers),
			numberSpy: Number(numberSpy),
			location: String(location),
		});
	};

	useEffect(() => {
		socket.on("room-created", (roomID) => {
			console.log("Комната создана:", roomID);
			navigate(`/room/${roomID}`);
		});

		socket.on("room-error", (message) => {
			console.log("Ошибка:", message);
		});

		return () => {
			socket.off("room-created");
			socket.off("room-error");
		};
	}, []);

	return (
		<>
			<Logo />
			<h2>Создание комнаты</h2>
			<form className="create-room-form" onSubmit={handleCreateRoom}>
				<label>
					Код комнаты:
					<input
						type="number"
						value={roomID}
						min={1000}
						max={9999}
						onChange={(e) => setRoomID(e.target.value)}
					/>
				</label>
				<label>
					Кол-во игроков:
					<input
						type="number"
						min={3}
						max={15}
						value={numberPlayers}
						onChange={(e) => setNumberPlayers(e.target.value)}
					/>
				</label>
				<label>
					Кол-во шпионов:
					<input
						type="number"
						min={1}
						max={15}
						value={numberSpy}
						onChange={(e) => setNumberSpy(e.target.value)}
					/>
				</label>
				<label>
					Время игры:
					<select
						value={timeRound}
						onChange={(e) => setTimeRound(e.target.value)}
					>
						<option value="5">5 мин.</option>
						<option value="7">7 мин.</option>
						<option value="10">10 мин.</option>
						<option value="15">15 мин.</option>
						<option value="30">30 мин.</option>
					</select>
				</label>
				<label>
					Локация:
					<select
						value={location}
						onChange={(e) => setLocation(e.target.value)}
					>
						<option value="school">Школа</option>
						<option value="room">Помещения</option>
						<option value="tower">Небоскреб</option>
						<option value="metro">Метро</option>
						<option value="island">Безлюдный остров</option>
					</select>
				</label>
				<button type="submit">Создать</button>
			</form>
		</>
	);
}
