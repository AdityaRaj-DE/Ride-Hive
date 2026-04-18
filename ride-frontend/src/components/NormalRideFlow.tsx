import { useSelector } from "react-redux";
import type { RootState } from "../store";
import DriverAssigned from "./DriverAssigned";
import DriverArriving from "./DriverArriving";
import RideStarted from "./RideStarted";
import CancelRideButton from "./CancelRideButton";

export default function NormalRideFlow() {
  const ride = useSelector((s: RootState) => s.ride);

  return (
    <div className="flex flex-col gap-6">
      {/* Main Status Components */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
         {ride.status === "DRIVER_ASSIGNED" && <DriverAssigned />}
         {ride.status === "DRIVER_ARRIVING" && <DriverArriving />}
         {ride.status === "IN_PROGRESS" && <RideStarted />}
      </div>

      {/* Cancel Button */}
      {(ride.status === "SEARCHING" || ride.status === "DRIVER_ASSIGNED") && ride.rideId && (
        <div className="animate-in fade-in duration-700 delay-500">
           <CancelRideButton rideId={ride.rideId} />
        </div>
      )}
    </div>
  );
}
