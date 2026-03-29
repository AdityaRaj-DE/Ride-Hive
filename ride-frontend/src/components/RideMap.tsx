import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

export default function RideMap({
  pickup,
  drop,
  driverLocation,
  status,
}: any) {

  if (!pickup) {
    return <div>Loading map...</div>;
  }

  const center = driverLocation || pickup || { lat: 0, lng: 0 };

  let polyline: any = null;

  if (status === "DRIVER_ASSIGNED" && driverLocation && pickup) {
    polyline = [
      [driverLocation.lat, driverLocation.lng],
      [pickup.lat, pickup.lng],
    ];
  }

  if (status === "IN_PROGRESS" && driverLocation && drop) {
    polyline = [
      [driverLocation.lat, driverLocation.lng],
      [drop.lat, drop.lng],
    ];
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      style={{ height: 400 }}
    >
      <TileLayer
        attribution="OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {pickup && <Marker position={[pickup.lat, pickup.lng]} />}
      {drop && <Marker position={[drop.lat, drop.lng]} />}
      {driverLocation && (
        <Marker position={[driverLocation.lat, driverLocation.lng]} />
      )}

      {polyline && <Polyline positions={polyline} />}
    </MapContainer>
  );
}