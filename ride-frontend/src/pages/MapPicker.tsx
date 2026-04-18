import { useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { CheckCircle2, ChevronLeft, Target } from "lucide-react";

type LatLng = {
  lat: number;
  lng: number;
};

export default function MapPicker() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();

  const type = params.get("type"); // pickup or drop
  const state = location.state as { pickup?: LatLng; drop?: LatLng } | null;

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
    <div className="h-screen w-full relative bg-background overflow-hidden selection:bg-accent/30 font-sans">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-[1000] bg-gradient-to-b from-background via-background/80 to-transparent pb-12">
         <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => navigate(-1)}
                 className="h-12 w-12 rounded-xl bg-surface border border-border flex items-center justify-center text-primary hover:bg-background transition-all active:scale-95 shadow-sm group backdrop-blur-md"
               >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
               </button>
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse"></div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Location Precision</p>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary uppercase">
                     Set <span className="text-accent">{type === "pickup" ? "Pickup" : "Drop-off"}</span> Location
                  </h1>
               </div>
            </div>

            <div className="hidden lg:flex items-center gap-8 opacity-40">
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold uppercase tracking-widest mb-0.5">Latitude</span>
                  <span className="text-xs font-bold text-primary">{center.lat.toFixed(6)}°</span>
               </div>
               <div className="w-px h-8 bg-border"></div>
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold uppercase tracking-widest mb-0.5">Longitude</span>
                  <span className="text-xs font-bold text-primary">{center.lng.toFixed(6)}°</span>
               </div>
            </div>
         </div>
      </div>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapEvents />
      </MapContainer>

      {/* MINIMAL CROSSHAIR */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-32 h-32 pointer-events-none z-10">
        <div className="absolute inset-0 border border-accent/10 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-8 border border-accent/20 rounded-full opacity-40"></div>
        
        <div className="absolute w-12 h-0.5 bg-accent/40 rounded-full"></div>
        <div className="absolute h-12 w-0.5 bg-accent/40 rounded-full"></div>
        
        <div className="w-3 h-3 bg-white border-2 border-accent rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] z-10 transition-transform hover:scale-125"></div>
        
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
           <div className="bg-surface/80 backdrop-blur-md px-4 py-2 rounded-xl border border-border shadow-lg flex items-center gap-2 whitespace-nowrap animate-bounce">
              <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                 {type === "pickup" ? "Pickup Node" : "Drop Node"}
              </span>
           </div>
        </div>
      </div>

      {/* FOOTER TERMINAL */}
      <div className="absolute bottom-6 left-0 right-0 p-4 z-[9999] flex flex-col items-center justify-end pointer-events-none">
        <div className="w-full max-w-xl space-y-4 pointer-events-auto">
          <button
            onClick={confirmLocation}
            className="w-full h-16 rounded-2xl bg-accent text-white font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-white/20"
          >
             <span>Confirm {type === "pickup" ? "Pickup" : "Destination"} Location</span>
             <CheckCircle2 className="w-6 h-6" />
          </button>

          <div className="glass-card p-6 border-accent/10 shadow-2xl backdrop-blur-3xl group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 shadow-sm">
                 <Target className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5 text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest text-accent opacity-60">Selection Coordinates</p>
                 <p className="text-xl font-black tracking-tight text-white/90 truncate">
                    {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}