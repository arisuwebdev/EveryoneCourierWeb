// import React, { useState, useEffect, useRef, useCallback } from "react";
// // import { base44 } from "@/api/base44Client";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Navigation, WifiOff, MapPin } from "lucide-react";
// import { useAuth } from "../../lib/AuthContext";
// import { getJobTrackLocation } from "../../api/ApiServices/tracking/getJobTrackLocationService";
// // import { getGoogleMapsKey } from "@/functions/getGoogleMapsKey";

// function loadGoogleMaps(apiKey) {
//   return new Promise((resolve, reject) => {
//     if (window.google?.maps) return resolve(window.google.maps);
//     const script = document.createElement("script");
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=directions`;
//     script.async = true;
//     script.onload = () => resolve(window.google.maps);
//     script.onerror = reject;
//     document.head.appendChild(script);
//   });
// }

// export default function CustomerTrackingMap({ job, courierName }) {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const courierMarkerRef = useRef(null);
//   const directionsRendererRef = useRef(null);
//   const [location, setLocation] = useState(null);
//   const [isActive, setIsActive] = useState(false);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [mapsReady, setMapsReady] = useState(false);
//   const [apiKey, setApiKey] = useState(null);
//   const { token } = useAuth();

// useEffect(() => {
//   setLocation(null);
//   setIsActive(false);
//   setLastUpdated(null);
// }, []);

//   const getTimeSince = () => {
//     if (!lastUpdated) return "";
//     const secs = Math.floor((new Date() - lastUpdated) / 1000);
//     if (secs < 60) return `${secs}s ago`;
//     return `${Math.floor(secs / 60)}m ago`;
//   };

//   return (
//     <Card className="border-indigo-200">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-base flex items-center gap-2">
//           <Navigation className="w-4 h-4 text-indigo-600" />
//           Courier Tracking
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         <div className="flex items-center gap-2 flex-wrap">
//           {!location ? (
//             <span className="flex items-center gap-1 text-sm text-slate-500">
//               <WifiOff className="w-4 h-4" /> Waiting for courier to share location...
//             </span>
//           ) : isActive ? (
//             <>
//               <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
//                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
//                 Live tracking
//               </Badge>
//               <span className="text-xs text-slate-400">Updated {getTimeSince()}</span>
//             </>
//           ) : (
//             <Badge className="bg-slate-100 text-slate-600">Last seen {getTimeSince()}</Badge>
//           )}
//         </div>

//         <div
//           ref={mapRef}
//           className="rounded-xl overflow-hidden border border-slate-200"
//           style={{ height: 320 }}
//         />

//         <p className="text-xs text-slate-500 flex items-center gap-1">
//           <MapPin className="w-3 h-3" />
//           Route shown from pickup → delivery. Courier position updates every 8 seconds.
//         </p>
//       </CardContent>
//     </Card>
//   );
// }

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, WifiOff, MapPin, Clock } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { getJobTrackLocation } from "../../api/ApiServices/tracking/getJobTrackLocationService";

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google?.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error("Google Maps failed to initialize."));
        }
      });

      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=directions`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps failed to initialize."));
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load Google Maps."));
    };

    document.head.appendChild(script);
  });
}

export default function CustomerTrackingMap({ job, courierName }) {
  const { token } = useAuth();

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [trackingError, setTrackingError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  /*
   * ---------------------------------------------------------
   * 1. INITIALIZE GOOGLE MAP
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const apiKey = "AIzaSyBCVw6il2IO_JKc1yuIC4zQ8vTv-a1hEl8";

    if (!apiKey) {
      setMapError("Google Maps API key is missing.");
      return;
    }

    if (!mapRef.current) {
      return;
    }

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapRef.current) {
          return;
        }

        const defaultCenter = {
          lat: -33.8688,
          lng: 151.2093,
        };

        mapInstanceRef.current = new maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 13,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        /*
         * Courier marker
         */
        courierMarkerRef.current = new maps.Marker({
          map: mapInstanceRef.current,
          position: defaultCenter,
          title: courierName || "Courier",
          visible: false,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#2563eb",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });

        /*
         * Route renderer
         */
        directionsRendererRef.current = new maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#4f46e5",
            strokeWeight: 4,
          },
        });

        directionsRendererRef.current.setMap(mapInstanceRef.current);

        setMapsReady(true);
        setMapError(null);
      })
      .catch((error) => {
        console.error("Google Maps error:", error);
        setMapError(error?.message || "Failed to load Google Maps.");
      });

    return () => {
      cancelled = true;
    };
  }, [courierName]);

  /*
   * ---------------------------------------------------------
   * 2. GET LOCATION FROM BACKEND
   * ---------------------------------------------------------
   */
  const fetchCourierLocation = useCallback(async () => {
    if (!token || !job?.id) {
      return;
    }

    try {
      const response = await getJobTrackLocation(job.id, token);

      console.log("Courier tracking response:", response);

      if (response?.status !== 1) {
        setTrackingError(response?.msg || "Unable to get courier location.");
        return;
      }

      /*
       * Try different possible backend response structures.
       *
       * Preferred:
       * payload.location
       *
       * Also supports:
       * payload.jobTrackLocation
       * payload.tracking
       * payload
       */
      const locations = response?.payload?.locations || [];

      if (locations.length === 0) {
        setTrackingError("Courier location is not available yet.");
        setIsActive(false);
        return;
      }

      const locationData = locations[locations.length - 1];

      if (!locationData) {
        setTrackingError("Courier location is not available yet.");
        setIsActive(false);
        return;
      }

      const lat = Number(locationData.lat ?? locationData.latitude);

      const lng = Number(
        locationData.long ?? locationData.lng ?? locationData.longitude,
      );

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.warn("Invalid courier location:", locationData);

        setTrackingError("Invalid courier location received from server.");

        return;
      }

      /*
       * Save location in React state
       */
      setLocation({
        lat,
        lng,
        gps_accuracy: locationData.gps_accuracy,
        time: locationData.time,
      });

      setLastUpdated(new Date());
      setIsActive(true);
      setTrackingError(null);

      /*
       * -------------------------------------------------------
       * 3. MOVE COURIER MARKER
       * -------------------------------------------------------
       */
      if (mapsReady && mapInstanceRef.current && courierMarkerRef.current) {
        const newPosition = {
          lat,
          lng,
        };

        courierMarkerRef.current.setPosition(newPosition);
        courierMarkerRef.current.setVisible(true);

        /*
         * Move map to courier location
         */
        mapInstanceRef.current.panTo(newPosition);
      }
    } catch (error) {
      console.error("Failed to get courier location:", error);

      setTrackingError(
        error?.response?.data?.msg || "Failed to get courier location.",
      );
    }
  }, [token, job?.id, mapsReady]);

  /*
   * ---------------------------------------------------------
   * 4. START LOCATION POLLING
   * ---------------------------------------------------------
   *
   * First request immediately.
   * Then every 5 seconds.
   */
  useEffect(() => {
    if (!mapsReady || !token || !job?.id) {
      return;
    }

    /*
     * First request immediately
     */
    fetchCourierLocation();

    /*
     * Then every 5 seconds
     */
    pollingIntervalRef.current = setInterval(() => {
      fetchCourierLocation();
    }, 5000);

    /*
     * Cleanup
     */
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [mapsReady, token, job?.id, fetchCourierLocation]);

  /*
   * ---------------------------------------------------------
   * 5. CHECK IF LOCATION IS OLD
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!lastUpdated) {
      return;
    }

    const timer = setInterval(() => {
      const seconds = (new Date() - lastUpdated) / 1000;

      /*
       * Consider tracking inactive if no update
       * has been received for more than 20 seconds.
       */
      if (seconds > 20) {
        setIsActive(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdated]);

  /*
   * ---------------------------------------------------------
   * 6. GET TIME SINCE LAST UPDATE
   * ---------------------------------------------------------
   */
  const getTimeSince = () => {
    if (!lastUpdated) {
      return "";
    }

    const seconds = Math.floor((new Date() - lastUpdated) / 1000);

    if (seconds < 60) {
      return `${seconds}s ago`;
    }

    return `${Math.floor(seconds / 60)}m ago`;
  };

  /*
   * ---------------------------------------------------------
   * 7. RENDER
   * ---------------------------------------------------------
   */
  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Navigation className="w-4 h-4 text-indigo-600" />

          {courierName ? `${courierName} Tracking` : "Courier Tracking"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Tracking status */}
        <div className="flex items-center gap-2 flex-wrap">
          {!location ? (
            <span className="flex items-center gap-1 text-sm text-slate-500">
              <WifiOff className="w-4 h-4" />
              Waiting for courier to share location...
            </span>
          ) : isActive ? (
            <>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                Live tracking
              </Badge>

              <span className="text-xs text-slate-400">
                Updated {getTimeSince()}
              </span>
            </>
          ) : (
            <Badge className="bg-slate-100 text-slate-600">
              Last seen {getTimeSince()}
            </Badge>
          )}
        </div>

        {/* Google Maps error */}
        {mapError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{mapError}</p>

            <p className="text-xs text-red-500 mt-1">
              Check your Google Maps API key and Google Cloud API configuration.
            </p>
          </div>
        )}

        {/* Tracking error */}
        {trackingError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">{trackingError}</p>
          </div>
        )}

        {/* Location information */}
        {/* {location && (
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span>Latitude: {location.lat.toFixed(6)}</span>

            <span>Longitude: {location.lng.toFixed(6)}</span>

            {location.gps_accuracy && (
              <span>Accuracy: {location.gps_accuracy}m</span>
            )}
          </div>
        )} */}

        {/* Map */}
        <div
          ref={mapRef}
          className="rounded-xl overflow-hidden border border-slate-200"
          style={{
            height: 320,
            width: "100%",
          }}
        />
        

        {/* Last updated */}
        {lastUpdated && (
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last location update: {getTimeSince()}
          </p>
        )}

        {/* Route information */}
        {routeInfo && (
          <div className="flex gap-3 text-sm">
            <span className="flex items-center gap-1 text-indigo-700 font-medium">
              <Clock className="w-4 h-4" />

              {routeInfo.duration}
            </span>

            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-4 h-4" />

              {routeInfo.distance}
            </span>
          </div>
        )}

        <p className="text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Courier position updates every 5 seconds.
        </p>
      </CardContent>
    </Card>
  );
}
