import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store";
import SearchingDriver from "../components/SearchingDriver";
import DriverAssigned from "../components/DriverAssigned";
import RideStarted from "../components/RideStarted";
import CancelRideButton from "../components/CancelRideButton";
import RideMap from "../components/RIdeMap";
import DriverArriving from "../components/DriverArriving";

export default function RideFlow() {

  const ride = useSelector((s: RootState) => s.ride);
  const navigate = useNavigate();

  if (ride.status === "COMPLETED" || ride.status === "CANCELLED") {
    navigate("/book-ride");
  }

  return (
    <div style={{ padding: 20 }}>

      <RideMap
        pickup={ride.pickup}
        drop={ride.drop}
        driverLocation={ride.driverLocation}
        geometry={ride.geometry}
        status={ride.status}
      />

      {ride.status === "SEARCHING" && (<SearchingDriver />)}

      {ride.status === "DRIVER_ASSIGNED" && (
        <DriverAssigned/>
      )}
      {ride.status === "DRIVER_ARRIVING" && (
        <DriverArriving/>
      )}

      {ride.status === "IN_PROGRESS" && (
        <RideStarted ride={ride} />
      )}

      {(ride.status === "SEARCHING" || ride.status === "DRIVER_ASSIGNED") && (
        <CancelRideButton rideId={ride.rideId} />
      )}

    </div>
  );
}