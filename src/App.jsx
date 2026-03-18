import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Loginpage from "./assets/components/pages/Loginpage/Loginpage";
import Mainpage from "./assets/components/pages/Mainpage/Mainpage";
import Createroompage from "./assets/components/pages/Createroompage/Createroompage";
import Connectpage from "./assets/components/pages/Connectpage/Connectpage";
import Roompage from "./assets/components/pages/Roompage/Roompage";

function App() {
	return (
		<>
			<Routes>
				<Route path="/" element={<Loginpage />} />
				<Route path="/main" element={<Mainpage />} />
				<Route path="/createroom" element={<Createroompage />} />
				<Route path="/connect" element={<Connectpage />} />
				<Route path="/room/:roomID" element={<Roompage />} />

				{/* <Route path="*" element={<NotFound/>}/> */}
			</Routes>
		</>
	);
}

export default App;
