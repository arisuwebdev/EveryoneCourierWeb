import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, WifiOff, MapPin } from "lucide-react";
// import { getGoogleMapsKey } from "@/functions/getGoogleMapsKey";

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve(window.google.maps);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=directions`;
    script.async = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function CustomerTrackingMap({ job, courierName }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [apiKey, setApiKey] = useState(null);

  // Fetch API key
  useEffect(() => {
    getGoogleMapsKey().then(res => setApiKey(res.data.key));
  }, []);

  // Init map once key + container ready
  useEffect(() => {
    if (!apiKey || !mapRef.current) return;
    loadGoogleMaps(apiKey).then((maps) => {
      mapInstanceRef.current = new maps.Map(mapRef.current, {
        zoom: 14,
        center: { lat: -33.8688, lng: 151.2093 }, // default Sydney
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      });
      directionsRendererRef.current = new maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: { strokeColor: "#6366f1", strokeWeight: 4 },
      });
      directionsRendererRef.current.setMap(mapInstanceRef.current);
      courierMarkerRef.current = new maps.Marker({
        map: mapInstanceRef.current,
        title: courierName || "Courier",
        icon: {
          path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#6366f1",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      setMapsReady(true);
    });
  }, [apiKey, mapRef.current]);

  // Draw route pickup → delivery
  useEffect(() => {
    if (!mapsReady || !job.pickup_address || !job.delivery_address) return;
    const maps = window.google.maps;
    const ds = new maps.DirectionsService();
    ds.route(
      {
        origin: job.pickup_address,
        destination: job.delivery_address,
        travelMode: maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") directionsRendererRef.current.setDirections(result);
      }
    );
  }, [mapsReady, job.pickup_address, job.delivery_address]);

  // Update courier marker position
  useEffect(() => {
    if (!mapsReady || !location) return;
    const pos = { lat: location.lat, lng: location.lng };
    courierMarkerRef.current.setPosition(pos);
    mapInstanceRef.current.panTo(pos);
  }, [location, mapsReady]);

  // Poll courier location
  useEffect(() => {
    const fetch = async () => {
      const records = await base44.entities.CourierLocation.filter({ job_id: job.id });
      if (records.length > 0) {
        const rec = records[0];
        setLocation({ lat: rec.latitude, lng: rec.longitude });
        setIsActive(rec.is_active);
        setLastUpdated(new Date(rec.updated_date));
      }
    };
    fetch();
    const interval = setInterval(fetch, 8000);
    return () => clearInterval(interval);
  }, [job.id]);

  const getTimeSince = () => {
    if (!lastUpdated) return "";
    const secs = Math.floor((new Date() - lastUpdated) / 1000);
    if (secs < 60) return `${secs}s ago`;
    return `${Math.floor(secs / 60)}m ago`;
  };

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Navigation className="w-4 h-4 text-indigo-600" />
          Courier Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {!location ? (
            <span className="flex items-center gap-1 text-sm text-slate-500">
              <WifiOff className="w-4 h-4" /> Waiting for courier to share location...
            </span>
          ) : isActive ? (
            <>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                Live tracking
              </Badge>
              <span className="text-xs text-slate-400">Updated {getTimeSince()}</span>
            </>
          ) : (
            <Badge className="bg-slate-100 text-slate-600">Last seen {getTimeSince()}</Badge>
          )}
        </div>

        <div
          ref={mapRef}
          className="rounded-xl overflow-hidden border border-slate-200"
          style={{ height: 320 }}
        />

        <p className="text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Route shown from pickup → delivery. Courier position updates every 8 seconds.
        </p>
      </CardContent>
    </Card>
  );
}