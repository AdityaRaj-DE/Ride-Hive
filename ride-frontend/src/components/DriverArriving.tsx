import { useSelector } from "react-redux";
import type { RootState } from "../store";

export default function DriverArriving() {
  const ride = useSelector((s: RootState) => s.ride);
  return (
    <div>
      <h2>Driver Arrived</h2>
      <p>Your driver is at pickup location.</p>
       {ride.rideStartOtp && (
        <div
          style={{
            padding: "20px",
            background: "#f3f3f3",
            borderRadius: "8px",
            textAlign: "center",
            width: "200px",
          }}
        >
          <p>Give this OTP to your driver</p>

          <h1 style={{ fontSize: "32px", letterSpacing: "4px" }}>
            {ride.rideStartOtp.code}
          </h1>
        </div>
      )}
    </div>
  );
}