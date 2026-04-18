import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import api from "../api/axios";

// Helper to calculate distance in meters
function getDistance(p1: [number, number], p2: [number, number]) {
  const R = 6371000;
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Auto-recenters map to fit markers
function RecenterMap({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [positions, map]);
  return null;
}

export default function RideMap({
  pickup,
  drop,
  driverLocation,
  status,
  geometry,
}: any) {
  const [activePath, setActivePath] = useState<[number, number][] | null>(null);
  const lastUpdatePos = useRef<[number, number] | null>(null);
  const isRouting = useRef(false);

  const getTargetCoords = (target: any): [number, number] | null => {
    if (!target) return null;
    if (target.lat !== undefined && target.lng !== undefined) return [target.lat, target.lng];
    if (Array.isArray(target.coordinates)) return [target.coordinates[1], target.coordinates[0]];
    return null;
  };

  // Initialize path from provided geometry
  useEffect(() => {
    if (geometry?.coordinates && !activePath) {
      setActivePath(geometry.coordinates.map((c: any) => [c[1], c[0]]));
    }
  }, [geometry, activePath]);

  // Real-time re-routing as driver moves
  useEffect(() => {
    const fetchNewRoute = async () => {
      if (isRouting.current || !driverLocation) return;
      
      const currentPos: [number, number] = [driverLocation.lat, driverLocation.lng];
      const targetData = (status === "DRIVER_ASSIGNED" || status === "DRIVER_ARRIVING") ? pickup : drop;
      const targetCoords = getTargetCoords(targetData);
      if (!targetCoords) return;

      // Throttle: only update if moved > 50 meters or first time
      if (lastUpdatePos.current) {
        const dist = getDistance(lastUpdatePos.current, currentPos);
        if (dist < 50) return; 
      }

      isRouting.current = true;
      try {
        const { data } = await api.post("/ride/route", {
          start: { lat: currentPos[0], lng: currentPos[1] },
          end: { lat: targetCoords[0], lng: targetCoords[1] }
        });
        if (data.geometry?.coordinates) {
          setActivePath(data.geometry.coordinates.map((c: any) => [c[1], c[0]]));
          lastUpdatePos.current = currentPos;
        }
      } catch (err) {
        console.error("Re-routing failed:", err);
      } finally {
        isRouting.current = false;
      }
    };

    fetchNewRoute();
  }, [driverLocation, status, pickup, drop]);

  if (!pickup) return <div className="w-full h-[400px] flex items-center justify-center bg-white/5 rounded-xl border border-white/10 italic opacity-40">Initializing Navigation...</div>;

  const center = driverLocation || pickup || { lat: 26.8467, lng: 80.9462 };

  return (
    <div className="w-full h-[400px] overflow-hidden rounded-xl ghost-border ambient-shadow relative z-0">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {pickup && <Marker position={[pickup.lat, pickup.lng]} />}
        {drop && <Marker position={[drop.lat, drop.lng]} />}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} />
        )}

        {activePath && (
          <Polyline 
            positions={activePath} 
            color="#8fd1d9" 
            weight={4} 
            opacity={0.6}
            lineCap="round"
          />
        )}
        
        {activePath && <RecenterMap positions={activePath} />}
      </MapContainer>
    </div>
  );
}