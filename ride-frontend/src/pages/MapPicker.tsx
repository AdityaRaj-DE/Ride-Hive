import { useState, useMemo } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { CheckCircle2, ChevronLeft, Target } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import LocationSearch from "../components/LocationSearch";

type LatLng = {
  lat: number;
  lng: number;
  label?: string;
};

export default function MapPicker() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();
  const { theme } = useTheme();

  const type = params.get("type"); // pickup or drop
  const state = location.state as { pickup?: LatLng; drop?: LatLng } | null;

  const existingPickup = state?.pickup;
  const existingDrop = state?.drop;

  // Stable initial center to prevent re-render loops
  const initialCenter = useMemo(() => {
    return [
      existingPickup?.lat || 26.8467,
      existingPickup?.lng || 80.9462,
    ] as [number, number];
  }, []);

  const [center, setCenter] = useState<LatLng>({
    lat: initialCenter[0],
    lng: initialCenter[1],
  });
  const [locationLabel, setLocationLabel] = useState<string | undefined>(
    type === "pickup" ? existingPickup?.label : existingDrop?.label
  );
  const [map, setMap] = useState<LeafletMap | null>(null);

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
          pickup: { ...center, label: locationLabel || "Selected Pickup" },
          drop: existingDrop,
        },
      });
    } else {
      navigate("/book-ride", {
        state: {
          pickup: existingPickup,
          drop: { ...center, label: locationLabel || "Selected Drop" },
        },
      });
    }
  };

  return (
    <div className="flex-1 w-full relative bg-background selection:bg-accent/30 font-sans">
      {/* Background Map Layer - Full Absolute */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={initialCenter}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          ref={setMap}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">Carto</a>'
            url={theme === 'dark' 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
          />
          <MapEvents />
        </MapContainer>
      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-[30] bg-gradient-to-b from-background via-background/80 to-transparent pb-8 sm:pb-12 pointer-events-none">
         <div className="max-w-7xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 pointer-events-auto">
               <div className="flex items-center gap-3 sm:gap-4">
                  <button 
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-surface border border-border flex items-center justify-center text-primary hover:bg-background transition-all active:scale-95 shadow-sm backdrop-blur-md"
                  >
                     <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="space-y-0.5">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-accent">Precision Mode</p>
                     </div>
                     <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tighter text-primary uppercase">
                        Set <span className="text-accent">{type === "pickup" ? "Pickup" : "Drop"}</span>
                     </h1>
                  </div>
               </div>
            </div>
            
            <div className="pointer-events-auto mt-2">
               <LocationSearch 
                  placeholder={`Search for ${type === "pickup" ? "pickup" : "drop"} location...`}
                  onLocationSelect={(lat, lng, label) => {
                     setCenter({ lat, lng });
                     setLocationLabel(label);
                     if (map) {
                        map.flyTo([lat, lng], 15);
                     }
                  }}
               />
            </div>
         </div>
      </div>

      {/* MINIMAL CROSSHAIR - Centered strictly */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-24 h-24 pointer-events-none z-10">
        <div className="absolute inset-0 border border-accent/10 rounded-full animate-ping opacity-20"></div>
        <div className="absolute w-8 h-0.5 bg-accent/40 rounded-full"></div>
        <div className="absolute h-8 w-0.5 bg-accent/40 rounded-full"></div>
        <div className="w-2.5 h-2.5 bg-white border-2 border-accent rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] z-10"></div>
        
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
           <div className="bg-surface/90 backdrop-blur-md px-3 py-1 rounded-lg border border-border shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Target Node</span>
           </div>
        </div>
      </div>

      {/* FOOTER ACTION AREA */}
      <div className="absolute bottom-32 sm:bottom-10 left-0 right-0 p-4 z-[30] flex flex-col items-center justify-end pointer-events-none">
        <div className="w-full max-w-xl space-y-4 pointer-events-auto">
          
          <div className="glass-card p-4 sm:p-6 border-accent/10 shadow-2xl backdrop-blur-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 shadow-sm">
                 <Target className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[8px] font-black uppercase tracking-widest text-accent opacity-60">Matrix Coordinates</p>
                 <p className="text-lg font-black tracking-tighter text-primary truncate">
                    {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                 </p>
              </div>
            </div>
          </div>

          <button
            onClick={confirmLocation}
            className="btn-primary w-full h-16 rounded-2xl bg-accent text-background font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] transition-all border border-white/10"
          >
             <span>Confirm {type === "pickup" ? "Pickup" : "Drop"} Point</span>
             <CheckCircle2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}