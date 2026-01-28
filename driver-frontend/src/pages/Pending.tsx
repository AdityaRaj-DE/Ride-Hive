export default function Pending() {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <h2 className="text-xl">Verification Pending</h2>
          <p className="text-neutral-400">
            Your documents are under review. You’ll be notified once approved.
          </p>
        </div>
      </div>
    );
  }
  