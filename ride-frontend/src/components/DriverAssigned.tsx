import { useState } from "react";
import api from "../api/axios";

export default function DriverAssigned({ ride }: any) {

  const [otp, setOtp] = useState("");

  const verifyOtp = async () => {
    await api.post(`/ride/${ride.rideId}/verify-otp`, {
      otp
    });
  };

  return (
    <div>

      <h2>Driver Assigned</h2>

      <p>Driver: {ride.driver?.name}</p>
      <p>Vehicle: {ride.driver?.vehicle}</p>

      <p>Ride OTP: {ride.rideStartOtp?.code}</p>

      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />

      <button onClick={verifyOtp}>
        Verify Driver
      </button>

    </div>
  );
}