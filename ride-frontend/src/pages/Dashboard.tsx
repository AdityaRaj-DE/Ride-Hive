import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px" }}>
      <h1>Rider Dashboard</h1>

      <p>Choose what you want to do</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <FeatureCard
          title="Book a Ride"
          description="Request a ride instantly"
          onClick={() => navigate("/book-ride")}
        />

        {/* <FeatureCard
          title="Ride History"
          description="See your past rides"
          onClick={() => navigate("/ride-history")}
        />

        <FeatureCard
          title="Profile"
          description="Manage your account"
          onClick={() => navigate("/profile")}
        /> */}
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "20px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        cursor: "pointer",
        background: "#fff",
      }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}