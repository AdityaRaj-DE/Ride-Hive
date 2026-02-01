const { io } = require("socket.io-client");

const rideId = "697f4b926af137499ff3e185"; // paste from rider output

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzc0ZGRmMzNjZjk0MzNiNjJmNDhlZSIsIm1vYmlsZU51bWJlciI6IjkxMTkxMTkxMTkiLCJhY3RpdmVSb2xlIjoicmlkZXIiLCJyb2xlcyI6eyJyaWRlciI6dHJ1ZSwiZHJpdmVyIjp0cnVlfSwib25ib2FyZGluZyI6eyJyaWRlciI6dHJ1ZSwiZHJpdmVyIjp0cnVlfSwiaWF0IjoxNzY5OTUwMDU4LCJleHAiOjE3Njk5NjA4NTh9.OsyOyFHXRGr8LO7FXUz6aLNl-MhZA_I2d_B8gbmH0Oc"
  }
});

socket.on("connect", () => {
  console.log("Driver connected:", socket.id);

  socket.onAny((e, d) => console.log("EVENT:", e, d));

  setTimeout(() => {
    socket.emit("acceptRide", { rideId }, (res) => {
      console.log("acceptRide:", res);
    });
  }, 1500);
});
