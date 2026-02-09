const { io } = require("socket.io-client");

const rideId = "6989baa6eae485039e1e69a2"; // paste from rider output

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzc0ZGRmMzNjZjk0MzNiNjJmNDhlZSIsIm1vYmlsZU51bWJlciI6IjkxMTkxMTkxMTkiLCJhY3RpdmVSb2xlIjoicmlkZXIiLCJyb2xlcyI6eyJyaWRlciI6dHJ1ZSwiZHJpdmVyIjp0cnVlfSwib25ib2FyZGluZyI6eyJyaWRlciI6dHJ1ZSwiZHJpdmVyIjp0cnVlfSwiaWF0IjoxNzcwNjMyMzM1LCJleHAiOjE3NzA2NDMxMzV9.lFq76hD2jNsE82yp-LqrosN7M5XlbgltTBZJ5Vt0ydY"
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
