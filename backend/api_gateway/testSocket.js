const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzc0ZGRmMzNjZjk0MzNiNjJmNDhlZSIsIm1vYmlsZU51bWJlciI6IjkxMTkxMTkxMTkiLCJhY3RpdmVSb2xlIjoicmlkZXIiLCJyb2xlcyI6eyJyaWRlciI6dHJ1ZSwiZHJpdmVyIjp0cnVlfSwib25ib2FyZGluZyI6eyJyaWRlciI6dHJ1ZSwiZHJpdmVyIjp0cnVlfSwiaWF0IjoxNzY5OTUwMDU4LCJleHAiOjE3Njk5NjA4NTh9.OsyOyFHXRGr8LO7FXUz6aLNl-MhZA_I2d_B8gbmH0Oc"
  }
});

let rideId = null;

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.onAny((e,d)=>console.log("EVENT:",e,d));
  socket.emit(
    "createRide",
    {
      pickup: { lat: 26.9, lng: 75.7 },
      drop: { lat: 26.8, lng: 75.9 },
    },
    (res) => {
      console.log("createRide:", res);
      rideId = res.rideId;
    }
  );
});

socket.onAny((e, d) => console.log("EVENT:", e, d));
