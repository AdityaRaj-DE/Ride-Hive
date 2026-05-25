import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectDriverSocket = (token: string) => {
  if (socket && (socket as any)._lastToken !== token) {
     disconnectDriverSocket();
  }

  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
       auth: { token },
       withCredentials: true,
       extraHeaders: {
         "Bypass-Tunnel-Reminder": "true"
       }
    });
    (socket as any)._lastToken = token;

    socket.on("connect", () => {
      console.log("Driver socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Driver socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });
  }

  return socket;
};

export const getDriverSocket = () => socket;

export const disconnectDriverSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
