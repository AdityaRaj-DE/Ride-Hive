import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { renderToString } from "react-dom/server";
import { Navigation, MapPin, Target, Activity, Zap } from "lucide-react";

// Custom pin matching the Nocturnal Concierge theme (Premium HUD Style)
const createCustomIcon = (color: string, IconComponent: any, isDriver = false, label = "") => {
  const iconHtml = renderToString(
    <div className="relative flex items-center justify-center translate-x-[-18px] translate-y-[-18px] group">
      {/* Outer Glow Ring */}
      <div className={`absolute inset-0 rounded-full blur-xl opacity-40 group-hover:opacity-80 transition-opacity duration-1000 ${isDriver ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} style={{ backgroundColor: color }}></div>
      
      {/* Main Node */}
      <div 
        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-2xl backdrop-blur-3xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 ${isDriver ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-white/5 border-white/20 text-white'}`}
        style={{ borderColor: isDriver ? undefined : color, color: isDriver ? undefined : color }}
      >
        <IconComponent 
          size={24} 
          className={isDriver ? "animate-pulse" : ""} 
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        
        {/* Label Tag */}
        {label && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-bg-primary/90 border border-white/10 rounded-full backdrop-blur-3xl shadow-2xl transition-all duration-700 group-hover:-top-12">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] italic whitespace-nowrap text-main">{label}</span>
          </div>
        )}
      </div>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

const driverIcon = createCustomIcon('#10b981', Navigation, true, "PILOT");
const pickupIcon = createCustomIcon('#10b981', Target, false, "PICKUP");
const destinationIcon = createCustomIcon('#f43f5e', MapPin, false, "DROP");

// Smooth follow
const Recenter = ({ lat, lng }: any) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], map.getZoom(), { duration: 1.5 });
    }
  }, [lat, lng]);
  return null;
};

export default function RideMap({
  pickup,
  destination,
  driverLocation,
  route = [],
}: any) {
  const fallback = pickup || driverLocation || { lat: 26.8467, lng: 80.9462 };

  return (
    <div className="relative w-full h-full group overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl">
      <MapContainer
        center={[fallback.lat, fallback.lng]}
        zoom={15}
        zoomControl={false}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* Polyline → pure OSRM route passed from dashboard */}
        {route.length > 1 && (
          <Polyline
            positions={route.map((p: any) => [p.lat, p.lng])}
            pathOptions={{ 
              color: '#10b981', 
              weight: 6, 
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: '2, 15',
              className: 'animate-[dash_20s_linear_infinite]'
            }}
          />
        )}

        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
        )}

        {driverLocation && (
          <>
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
            <Recenter lat={driverLocation.lat} lng={driverLocation.lng} />
          </>
        )}
      </MapContainer>

      {/* Decorative HUD Scaling Labels */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity duration-700 cursor-help">
         <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Zap className="w-5 h-5 text-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-emerald-500">Trajectory Stream v4.2</p>
      </div>
      
      <div className="absolute bottom-6 right-6 z-10 hidden md:flex items-center gap-4 opacity-[0.05] group-hover:opacity-30 transition-opacity duration-1000">
         <Activity className="w-4 h-4 text-emerald-500" />
         <p className="text-[8px] font-black uppercase tracking-[0.6em] italic">Real-time Node Synchronization: OK</p>
      </div>
    </div>
  );
}
