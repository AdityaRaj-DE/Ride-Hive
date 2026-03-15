export default function RideCompleted({ onDone }: any) {

  return (
    <div>

      <h2>Ride Completed</h2>

      <button onClick={onDone}>
        Book Another Ride
      </button>

    </div>
  );
}