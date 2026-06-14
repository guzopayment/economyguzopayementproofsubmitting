// src/socket.js
import { io } from "socket.io-client";

const apiBase = import.meta.env.VITE_API_BASE_URL || "https://server-y72m.onrender.com/api";
const socketBase = apiBase.replace(/\/api\/?$/, "");

const socket = io(socketBase, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
