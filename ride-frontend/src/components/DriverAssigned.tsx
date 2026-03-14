import { useSelector } from "react-redux";
import type { RootState } from "../store";

export default function DriverAssigned() {
  const ride = useSelector((s: RootState) => s.ride);
  console.log(ride);
  return (
    <div style={{ marginTop: 20 }}>

      <h2>Driver Assigned</h2>

      {/* Driver Info */}
      <div style={{ marginBottom: 20 }}>
        <p><strong>Driver:</strong> {ride.driver?.name}</p>
        <p><strong>Vehicle:</strong> {ride.driver?.vehicle}</p>
        <p><strong>Plate:</strong> {ride.driver?.plate}</p>
      </div>

      {/* OTP Display */}
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

      <p style={{ marginTop: 10 }}>
        The driver will start the ride after verifying this OTP.
      </p>

    </div>
  );
}