import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';

interface LocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, label: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSearch({ onLocationSelect, placeholder = "Search for a location...", className = "" }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside to close
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length < 3) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (result: LocationResult) => {
    setQuery(result.display_name.split(',')[0]); // Set basic name
    setIsOpen(false);
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative flex items-center w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-accent" />
          )}
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-3 sm:py-4 bg-surface/90 backdrop-blur-md border border-border rounded-xl focus:ring-accent focus:border-accent sm:text-sm shadow-lg text-primary placeholder-muted outline-none transition-all"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-[100] mt-2 w-full bg-surface/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl max-h-60 overflow-auto">
          <ul className="py-2">
            {results.map((result) => (
              <li
                key={result.place_id}
                className="px-4 py-3 hover:bg-background cursor-pointer flex items-start gap-3 transition-colors border-b border-border/50 last:border-0"
                onClick={() => handleSelect(result)}
              >
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-primary">
                    {result.display_name.split(',')[0]}
                  </span>
                  <span className="text-xs text-secondary line-clamp-1">
                    {result.display_name.substring(result.display_name.indexOf(',') + 1).trim()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
