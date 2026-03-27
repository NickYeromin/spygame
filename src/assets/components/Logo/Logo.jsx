import logo from "/images/logo.png";
import "./Logo.css";

export default function Logo() {
	return (
		<div className="logo-box">
			<img src={logo} className="logo" />
			<h1 className="rubik-mono-one-regular text-logo">ШПИЙОН</h1>
		</div>
	);
}
