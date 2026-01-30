const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NmY4ZTdiODJjZWYyNDI1YTQ4Y2RjMyIsIm1vYmlsZU51bWJlciI6Ijk5OTk5OTk5OTkiLCJhY3RpdmVSb2xlIjoicmlkZXIiLCJyb2xlcyI6eyJyaWRlciI6dHJ1ZSwiZHJpdmVyIjpmYWxzZX0sIm9uYm9hcmRpbmciOnsicmlkZXIiOmZhbHNlLCJkcml2ZXIiOmZhbHNlfSwiaWF0IjoxNzY5Nzg0NzgzLCJleHAiOjE3Njk3ODU2ODN9.YHoJHCrh203RHJUBfLqpkLoJSuV4kDruMNLGoibhfy0"
  }
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("ride.restore", data => {
  console.log("RESTORED:", data);
});

socket.onAny((e,d)=>console.log("EVENT:",e,d));
