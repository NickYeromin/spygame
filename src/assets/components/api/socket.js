import { io } from "socket.io-client";

// export const socket = io("http://localhost:3000"); //! for local network
export const socket = io("http://192.168.0.220:3000/", { autoConnect: true });
