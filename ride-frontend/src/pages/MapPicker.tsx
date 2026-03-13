import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useState } from "react";

type LatLng = {
  lat: number;
  lng: number;
};

export default function MapPicker() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();

  const type = params.get("type"); // pickup or drop
  const state = location.state as any;

  const existingPickup = state?.pickup;
  const existingDrop = state?.drop;

  const [center, setCenter] = useState<LatLng>({
    lat: existingPickup?.lat || 26.8467,
    lng: existingPickup?.lng || 80.9462,
  });

  function MapEvents() {
    useMapEvents({
      moveend: (e) => {
        const c = e.target.getCenter();
        setCenter({ lat: c.lat, lng: c.lng });
      },
    });

    return null;
  }

  const confirmLocation = () => {
    if (type === "pickup") {
      navigate("/book-ride", {
        state: {
          pickup: center,
          drop: existingDrop,
        },
      });
    } else {
      navigate("/book-ride", {
        state: {
          pickup: existingPickup,
          drop: center,
        },
      });
    }
  };

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents />
      </MapContainer>

      {/* CROSSHAIR */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "30px",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      >
        +
      </div>

      {/* CONFIRM BUTTON */}
      <button
        onClick={confirmLocation}
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "12px 20px",
          fontSize: "16px",
          zIndex: 1000,
        }}
      >
        Select Location
      </button>
    </div>
  );
}