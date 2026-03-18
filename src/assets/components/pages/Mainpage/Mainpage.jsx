import Logo from "../../Logo/Logo";
import { Link } from "react-router-dom";

export default function Mainpage() {
	return (
		<>
			<Logo />

			<Link to="/createroom">Создать комнату</Link>
			<Link to="/connect">Подключиться</Link>
		</>
	);
}
