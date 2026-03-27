import "./Loginpage.css";
import { useState, useEffect } from "react";
import { socket } from "../../api/socket";
import { useNavigate } from "react-router-dom";
import Logo from "../../Logo/Logo";

export default function Loginpage() {
	const [username, setUsername] = useState("");
	const [logged, setLogged] = useState(false);

	const navigate = useNavigate();

	const handleLogin = (e) => {
		e.preventDefault();

		if (!username.trim()) return alert("Введите имя !");
		sessionStorage.setItem("username", username);
		socket.emit("join", { username: username });
	};

	useEffect(() => {
		socket.on("login-success", (username) => {
			setLogged(true);
			console.log("Успешный вход:", username);
			sessionStorage.setItem("username", username);
			navigate("/main");
		});

		socket.on("login-error", (message) => {
			alert(message);
		});

		return () => {
			socket.off("login-success");
			socket.off("login-error");
		};
	}, []);

	return (
		<>
			<Logo />
			<form className="box" onSubmit={handleLogin}>
				<input
					className="el-standard"
					type="text"
					placeholder="Введите имя"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<button
					className="el-standard btn-st"
					type="submit"
					disabled={!username.trim()}
				>
					Играть
				</button>
			</form>
		</>
	);
}
