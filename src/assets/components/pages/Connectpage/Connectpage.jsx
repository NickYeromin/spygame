import { useState } from "react";
import Logo from "../../Logo/Logo";
import { useNavigate } from "react-router-dom";
import { socket } from "../../api/socket";
import { useEffect } from "react";

export default function Connectpage() {
	const [roomID, setRoomID] = useState("");

	const navigate = useNavigate();
	const username = sessionStorage.getItem("username");

	const handlerConnect = (e) => {
		e.preventDefault();
		if (!roomID.trim()) return alert("Введите код комнаты!");
		socket.emit("join-room", { roomID: roomID, username });
	};

	useEffect(() => {
		socket.on("room-joined", (roomID) => {
			console.log("Успешный вход:", roomID);
			navigate(`/room/${roomID}`);
		});

		socket.on("room-error", (message) => {
			alert(message);
		});

		return () => {
			socket.off("room-error");
			socket.off("");
		};
	}, []);

	return (
		<>
			<Logo />
			<form onSubmit={handlerConnect}>
				<input
					type="number"
					placeholder="Введите код комнаты"
					value={roomID}
					onChange={(e) => {
						setRoomID(e.target.value);
					}}
				/>
				<button type="submit">Подключиться</button>
			</form>
		</>
	);
}
