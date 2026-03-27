import { useState, useEffect } from "react";
import Logo from "../../Logo/Logo";
import { useNavigate } from "react-router-dom";
import { socket } from "../../api/socket";

export default function Connectpage() {
	const [roomID, setRoomID] = useState("");

	const navigate = useNavigate();
	const username = sessionStorage.getItem("username");

	const handlerConnect = (e) => {
		e.preventDefault();

		if (!username) return alert("Сначала войдите!");
		if (!roomID.trim()) return alert("Введите код комнаты!");

		socket.emit("join-room", {
			roomID: roomID.trim(),
		});
	};

	useEffect(() => {
		const onJoin = (roomID) => {
			navigate(`/room/${roomID}`);
		};

		const onError = (message) => {
			alert(message);
		};

		socket.on("room-joined", onJoin);
		socket.on("room-error", onError);

		return () => {
			socket.off("room-joined", onJoin);
			socket.off("room-error", onError);
		};
	}, [navigate]);

	return (
		<>
			<Logo />
			<form className="box" onSubmit={handlerConnect}>
				<input
					type="text"
					placeholder="Введите код комнаты"
					value={roomID}
					onChange={(e) => setRoomID(e.target.value)}
				/>
				<button className="btn-st" type="submit">Подключиться</button>
			</form>
		</>
	);
}
