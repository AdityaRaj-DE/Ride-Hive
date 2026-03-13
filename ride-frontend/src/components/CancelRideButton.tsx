import api from "../api/axios";

export default function CancelRideButton({ rideId }: any) {

  const cancelRide = async () => {
    try {
      await api.post(`/ride/${rideId}/cancel`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={cancelRide}
      style={{
        marginTop: 20,
        padding: "10px 16px",
        background: "red",
        color: "white"
      }}
    >
      Cancel Ride
    </button>
  );
}