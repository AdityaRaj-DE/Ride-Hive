import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import api from "../api/axios";
import L from "leaflet";
import { renderToString } from "react-dom/server";
import { MapPin, Navigation } from "lucide-react";

type Location = {
  lat: number;
  lng: number;
};

// Custom Premium Icons
const createCustomIcon = (color: string, IconComponent: any) => {
  const iconHtml = renderToString(
    <div style={{ 
      color: color,
      filter: `drop-shadow(0 0 8px ${color}66)`,
      transform: 'translate(-50%, -50%)'
    }}>
      <IconComponent size={32} fill="currentColor" fillOpacity={0.2} strokeWidth={2.5} />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const pickupIcon = createCustomIcon('#0ea5e9', Navigation); // Sky 500
const dropIcon = createCustomIcon('#6366f1', MapPin);     // Indigo 500

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
      try {
        const res = await api.post("/ride/estimate", {
          pickup,
          drop,
        });

        if (res.data?.geometry?.coordinates) {
          const coords = res.data.geometry.coordinates.map(
            (c: number[]) => [c[1], c[0]]
          );
          setRoute(coords);
        }
      } catch (err) {
        console.error("Failed to fetch route for preview:", err);
      }
    };

    fetchRoute();
  }, [pickup, drop]);

  const center = pickup || drop;

  if (!center) return null;

  return (
    <div className="w-full h-full min-h-[300px] overflow-hidden rounded-xl relative z-0 group">
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/20 to-transparent z-10 pointer-events-none"></div>
      
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {drop && <Marker position={[drop.lat, drop.lng]} icon={dropIcon} />}

        {route.length > 0 && (
          <Polyline 
            positions={route} 
            pathOptions={{ 
              color: '#38bdf8', 
              weight: 5, 
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: '1, 10',
              dashOffset: '0'
            }} 
          />
        )}
      </MapContainer>
      
      {/* Interactive Overlay */}
      <div className="absolute bottom-4 left-4 z-20 flex gap-2">
         <div className="glass-panel px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-main flex items-center gap-2 border border-white/10 shadow-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Live Preview
         </div>
      </div>
    </div>
  );
}