import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

export default function RideMap({
  pickup,
  drop,
  driverLocation,
  status,
}: any) {

  const center = driverLocation || pickup;

  return (
    <div style={{ height: "350px" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pickup && <Marker position={[pickup.lat, pickup.lng]} />}
        {drop && <Marker position={[drop.lat, drop.lng]} />}

        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} />
        )}

        {status === "DRIVER_ASSIGNED" && driverLocation && (
          <Polyline
            positions={[
              [driverLocation.lat, driverLocation.lng],
              [pickup.lat, pickup.lng],
            ]}
          />
        )}

        {status === "IN_PROGRESS" && (
          <Polyline
            positions={[
              [pickup.lat, pickup.lng],
              [drop.lat, drop.lng],
            ]}
          />
        )}
      </MapContainer>
    </div>
  );
}