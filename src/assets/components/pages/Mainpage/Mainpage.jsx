import Logo from "../../Logo/Logo";
import { Link } from "react-router-dom";

export default function Mainpage() {
	return (<>
		<Logo />
		<div className="box">
			

			<Link className="btn-st" to="/createroom">Создать комнату</Link>
			<Link className="btn-st" to="/connect">Подключиться</Link>
		</div></>
	);
}
