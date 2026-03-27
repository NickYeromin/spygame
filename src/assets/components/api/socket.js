import { io } from "socket.io-client";

export const socket = io("http://localhost:3000"); //! for local network

//  export const socket = io("Your server address");
