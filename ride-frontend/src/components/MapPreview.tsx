import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import api from "../api/axios";

type Location = {
  lat: number;
  lng: number;
};

export default function MapPreview({
  pickup,
  drop,
}: {
  pickup?: Location | null;
  drop?: Location | null;
}) {
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!pickup || !drop) {
      setRoute([]);
      return;
    }

    const fetchRoute = async () => {
      const res = await api.post("/ride/estimate", {
        pickup,
        drop,
      });

      const coords = res.data.geometry.coordinates.map(
        (c: number[]) => [c[1], c[0]]
      );

      setRoute(coords);
    };

    fetchRoute();
  }, [pickup, drop]);

  const center = pickup || drop;

  if (!center) return null;

  return (
    <div style={{ height: "300px", marginTop: "20px" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pickup && <Marker position={[pickup.lat, pickup.lng]} />}
        {drop && <Marker position={[drop.lat, drop.lng]} />}

        {route.length > 0 && <Polyline positions={route} />}
      </MapContainer>
    </div>
  );
}