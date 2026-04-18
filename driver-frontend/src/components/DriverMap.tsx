import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { renderToString } from "react-dom/server";
import { Navigation, MapPin, ShieldCheck, Zap, Activity, Cpu, Target } from "lucide-react";
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

// Custom pin matching the Nocturnal Concierge theme (Premium HUD Style)
const createCustomIcon = (color: string, IconComponent: any, isDriver = false, label = "") => {
  const iconHtml = renderToString(
    <div className="relative flex items-center justify-center translate-x-[-18px] translate-y-[-18px] group">
      {/* Outer Glow Ring */}
      <div className={`absolute inset-0 rounded-full blur-xl opacity-40 group-hover:opacity-80 transition-opacity duration-1000 ${isDriver ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} style={{ backgroundColor: color }}></div>
      
      {/* Animated Orbitals for Driver */}
      {isDriver && (
        <>
          <div className="absolute inset-[-12px] border-2 border-emerald-500/20 rounded-full animate-[spin_5s_linear_infinite]"></div>
          <div className="absolute inset-[-8px] border border-emerald-500/10 rounded-full animate-[spin_3s_linear_infinite] reverse"></div>
        </>
      )}

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

const driverIcon = createCustomIcon('#10b981', Navigation, true, "PILOT NODE");
const pickupIcon = createCustomIcon('#10b981', Target, false, "INGEST POINT");
const dropIcon = createCustomIcon('#f43f5e', MapPin, false, "DISCHARGE POINT");

type LatLng = { lat: number, lng: number };

// Map Controller for smooth panning
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, { duration: 2 });
  }, [center, map]);
  return null;
}

export default function DriverMap({
  driverLocation,
  pickup,
  drop,
  status
}: {
  driverLocation?: LatLng | null;
  pickup?: LatLng | any | null;
  drop?: LatLng | any | null;
  status?: string;
}) {
  const [activePath, setActivePath] = useState<[number, number][] | null>(null);
  const lastUpdatePos = useRef<[number, number] | null>(null);
  const isRouting = useRef(false);

  const getCoords = (data: any): [number, number] | null => {
    if (!data) return null;
    if (data.lat !== undefined && data.lng !== undefined) return [data.lat, data.lng];
    if (Array.isArray(data.coordinates)) return [data.coordinates[1], data.coordinates[0]];
    return null;
  };

  const driverCoords = getCoords(driverLocation);
  const pickupCoords = getCoords(pickup);
  const dropCoords = getCoords(drop);

  useEffect(() => {
    const fetchNewRoute = async () => {
      if (isRouting.current || !driverCoords) return;
      
      const target = (status === "DRIVER_ASSIGNED" || status === "DRIVER_ARRIVING") ? pickupCoords : dropCoords;
      if (!target) return;

      if (lastUpdatePos.current) {
        const dist = getDistance(lastUpdatePos.current, driverCoords);
        if (dist < 50) return; 
      }

      isRouting.current = true;
      try {
        const { data } = await api.post("/ride/route", {
          start: { lat: driverCoords[0], lng: driverCoords[1] },
          end: { lat: target[0], lng: target[1] }
        });
        if (data.geometry?.coordinates) {
          setActivePath(data.geometry.coordinates.map((c: any) => [c[1], c[0]]));
          lastUpdatePos.current = driverCoords;
        }
      } catch (err) {
        console.error("Re-routing failed:", err);
      } finally {
        isRouting.current = false;
      }
    };

    fetchNewRoute();
  }, [driverCoords, status, pickupCoords, dropCoords]);

  const defaultCenter: [number, number] = [26.8467, 80.9462]; 
  const center = driverCoords || pickupCoords || dropCoords || defaultCenter;

  return (
    <div className="absolute inset-0 z-0 group overflow-hidden">
      {/* Map Atmosphere Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none z-10"></div>
      
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController center={center} />

        {driverCoords && <Marker position={driverCoords} icon={driverIcon} />}
        {pickupCoords && <Marker position={pickupCoords} icon={pickupIcon} />}
        {dropCoords && <Marker position={dropCoords} icon={dropIcon} />}
        
        {activePath && (
          <Polyline 
            positions={activePath} 
            pathOptions={{ 
              color: '#10b981', 
              weight: 8, 
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: '2, 20',
              className: 'animate-[dash_30s_linear_infinite]'
            }} 
          />
        )}
      </MapContainer>

      {/* Floating HUD Telemetry Center */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 w-fit">
         <div className="glass-panel px-10 py-5 rounded-[2.5rem] flex items-center gap-8 border border-white/10 shadow-[0_64px_128px_rgba(0,0,0,0.8)] backdrop-blur-3xl group/hud hover:border-emerald-500/50 transition-all duration-700">
            <div className="relative">
               <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover/hud:rotate-12 transition-all">
                  <Activity className="w-6 h-6 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] animate-pulse" />
               </div>
            </div>
            
            <div className="flex flex-col">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-500 italic">Grid Telemetry Active</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 mt-1 italic group-hover/hud:opacity-100 transition-opacity">AES-256 Quantum Handshake Secure</span>
            </div>
            
            <div className="border-l border-white/5 pl-8 ml-2 flex items-center gap-4">
               <Cpu className="w-5 h-5 text-emerald-500/40 group-hover/hud:text-emerald-500 transition-colors" />
               <ShieldCheck className="w-5 h-5 text-emerald-500/40 group-hover/hud:text-emerald-500 transition-colors" />
            </div>
         </div>
      </div>
      
      {/* Scanning HUD Decorative Overlays */}
      <div className="absolute top-0 left-0 w-full h-full border-[30px] border-emerald-500/[0.02] pointer-events-none z-10 rounded-[4rem]"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 border-l border-b border-emerald-500/20 pointer-events-none z-10 opacity-40 group-hover:scale-110 transition-transform duration-1000"></div>
      <div className="absolute top-20 right-20 w-40 h-40 border-r border-t border-emerald-500/20 pointer-events-none z-10 opacity-40 group-hover:scale-110 transition-transform duration-1000"></div>
    </div>
  );
}
