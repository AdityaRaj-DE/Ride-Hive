const axios = require("axios");

module.exports = async function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) return next(new Error("Unauthorized: token missing"));

    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
    const { data } = await axios.get(`${AUTH_SERVICE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });

    
    socket.user = {
      id: data.id,
      roles: data.roles,
      activeRole: data.activeRole,
      onboarding: data.onboarding,
    };

    socket.accessToken = token;

    next();
  } catch (err) {
    return next(new Error("Unauthorized: invalid token"));
  }
};
