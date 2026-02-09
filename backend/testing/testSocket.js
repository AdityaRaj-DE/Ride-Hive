const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NmY4ZTdiODJjZWYyNDI1YTQ4Y2RjMyIsIm1vYmlsZU51bWJlciI6Ijk5OTk5OTk5OTkiLCJhY3RpdmVSb2xlIjoicmlkZXIiLCJyb2xlcyI6eyJyaWRlciI6dHJ1ZSwiZHJpdmVyIjpmYWxzZX0sIm9uYm9hcmRpbmciOnsicmlkZXIiOnRydWUsImRyaXZlciI6ZmFsc2V9LCJpYXQiOjE3NzA2MzE5ODEsImV4cCI6MTc3MDY0Mjc4MX0.FtQtF2-cf8P2Hi28WHSZek9HHOfBkWW5zSL2Z8iZYIk"
  }
});
let restored = false;

socket.on("ride.restore", (ride) => {
  restored = true;
  console.log("RESTORED:", ride);
});
socket.on("connect", () => {
  console.log("Connected:", socket.id);

  setTimeout(() => {
    if (!restored) {
      console.log("No active ride → creating new one");
      socket.emit(
        "createRide",
        {
          pickup: { lat: 26.9, lng: 75.7 },
          drop: { lat: 26.8, lng: 75.9 },
        },
        (res) => {
          console.log("createRide ACK:", res);
        }
      );
    }
  }, 500);
});


socket.on("connect_error", (e) => {
  console.error("CONNECT ERROR:", e.message);
});

socket.onAny((e, d) => console.log("EVENT:", e, d));

