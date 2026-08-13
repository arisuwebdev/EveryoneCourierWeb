// import React, { useState, useEffect, useRef } from "react";
// // import { base44 } from "@/api/base44Client";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { MapPin, Navigation, WifiOff, Clock } from "lucide-react";
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

// export default function CourierTracker({ job }) {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const myMarkerRef = useRef(null);
//   const directionsRendererRef = useRef(null);
//   const watchIdRef = useRef(null);

//   const [isSharing, setIsSharing] = useState(false);
//   const [locationRecord, setLocationRecord] = useState(null);
//   const [error, setError] = useState(null);
//   const [mapsReady, setMapsReady] = useState(false);
//   const [routeInfo, setRouteInfo] = useState(null); // { duration, distance }
//   const [apiKey, setApiKey] = useState(null);

//   // Fetch API key
//  useEffect(() => {
//   setApiKey("YOUR_GOOGLE_MAPS_API_KEY");
// }, []);

//   // Init map
//   useEffect(() => {
//     if (!apiKey || !mapRef.current) return;
//     loadGoogleMaps(apiKey).then((maps) => {
//       mapInstanceRef.current = new maps.Map(mapRef.current, {
//         zoom: 13,
//         center: { lat: -33.8688, lng: 151.2093 },
//         mapTypeControl: false,
//         fullscreenControl: false,
//         streetViewControl: false,
//       });
//       directionsRendererRef.current = new maps.DirectionsRenderer({
//         suppressMarkers: false,
//         polylineOptions: { strokeColor: "#10b981", strokeWeight: 4 },
//       });
//       directionsRendererRef.current.setMap(mapInstanceRef.current);
//       myMarkerRef.current = new maps.Marker({
//         map: mapInstanceRef.current,
//         title: "You",
//         icon: {
//           path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
//           scale: 7,
//           fillColor: "#10b981",
//           fillOpacity: 1,
//           strokeColor: "#fff",
//           strokeWeight: 2,
//         },
//       });
//       setMapsReady(true);
//     });
//   }, [apiKey, mapRef.current]);

//   // Fetch optimized route from current position to delivery
//   const fetchRoute = (lat, lng) => {
//     if (!mapsReady || !job.delivery_address) return;
//     const maps = window.google.maps;
//     const ds = new maps.DirectionsService();
//     const destination = job.status === "assigned" ? job.pickup_address : job.delivery_address;
//     ds.route(
//       {
//         origin: { lat, lng },
//         destination,
//         travelMode: maps.TravelMode.DRIVING,
//       },
//       (result, status) => {
//         if (status === "OK") {
//           directionsRendererRef.current.setDirections(result);
//           const leg = result.routes[0]?.legs[0];
//           if (leg) setRouteInfo({ duration: leg.duration.text, distance: leg.distance.text });
//         }
//       }
//     );
//   };

// const startSharing = () => {
//   if (!navigator.geolocation) {
//     setError("Your browser doesn't support GPS.");
//     return;
//   }

//   navigator.geolocation.getCurrentPosition(
//     (pos) => {
//       const { latitude, longitude } = pos.coords;

//       if (myMarkerRef.current) {
//         myMarkerRef.current.setPosition({ lat: latitude, lng: longitude });
//         mapInstanceRef.current?.panTo({ lat: latitude, lng: longitude });
//       }

//       fetchRoute(latitude, longitude);
//       setIsSharing(true);
//     },
//     (err) => setError(err.message)
//   );
// };

//   useEffect(() => {
//     return () => {
//       if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
//     };
//   }, []);

//   const destination = job.status === "assigned" ? job.pickup_address : job.delivery_address;

//   return (
//     <Card className="border-emerald-200 bg-emerald-50/40">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-base flex items-center gap-2">
//           <Navigation className="w-4 h-4 text-emerald-600" />
//           Navigation & Location Sharing
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         <p className="text-sm text-slate-600">
//           {job.status === "assigned"
//             ? `Next stop: Pick up from ${job.pickup_address}`
//             : `Deliver to: ${job.delivery_address}`}
//         </p>

//         {error && (
//           <p className="text-sm text-red-600 flex items-center gap-1">
//             <WifiOff className="w-4 h-4" /> {error}
//           </p>
//         )}

//         {routeInfo && (
//           <div className="flex gap-3 text-sm">
//             <span className="flex items-center gap-1 text-emerald-700 font-medium">
//               <Clock className="w-4 h-4" /> {routeInfo.duration}
//             </span>
//             <span className="flex items-center gap-1 text-slate-600">
//               <MapPin className="w-4 h-4" /> {routeInfo.distance}
//             </span>
//           </div>
//         )}

//         <div
//           ref={mapRef}
//           className="rounded-xl overflow-hidden border border-slate-200"
//           style={{ height: 300 }}
//         />

//         <div className="flex items-center gap-3">
//           {isSharing ? (
//             <>
//               <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
//                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
//                 Live — sharing location
//               </Badge>
//               <Button variant="outline" size="sm" onClick={stopSharing}>
//                 Stop Sharing
//               </Button>
//             </>
//           ) : (
//             <Button size="sm" onClick={startSharing} className="bg-emerald-600 hover:bg-emerald-700">
//               <MapPin className="w-4 h-4 mr-1" /> Start Navigation & Share Location
//             </Button>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }



import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, WifiOff, Clock } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { saveJobTracking } from "../../api/ApiServices/tracking/saveJobTrackingService";

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      return resolve(window.google.maps);
    }

    const script = document.createElement("script");

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=directions`;
    script.async = true;

    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

export default function CourierTracker({ job }) {
  const { token } = useAuth();

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const myMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const watchIdRef = useRef(null);

  // Used to control the 5 second API calls
  const locationIntervalRef = useRef(null);

  // Store latest GPS position
  const latestPositionRef = useRef(null);

  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  // --------------------------------------------------
  // Google Maps API Key
  // --------------------------------------------------
  useEffect(() => {
    setApiKey("AIzaSyBCVw6il2IO_JKc1yuIC4zQ8vTv-a1hEl8");
  }, []);

  // --------------------------------------------------
  // Initialize Google Map
  // --------------------------------------------------
  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        mapInstanceRef.current = new maps.Map(mapRef.current, {
          zoom: 13,
          center: {
            lat: -33.8688,
            lng: 151.2093,
          },
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        directionsRendererRef.current = new maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#10b981",
            strokeWeight: 4,
          },
        });

        directionsRendererRef.current.setMap(mapInstanceRef.current);

        myMarkerRef.current = new maps.Marker({
          map: mapInstanceRef.current,
          title: "You",
          icon: {
            path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 7,
            fillColor: "#10b981",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });

        setMapsReady(true);
      })
      .catch(() => {
        setError("Failed to load Google Maps.");
      });
  }, [apiKey]);

  // --------------------------------------------------
  // Fetch route
  // --------------------------------------------------
  const fetchRoute = (lat, lng) => {
    if (!mapsReady || !job) return;

    const maps = window.google.maps;

    const directionsService = new maps.DirectionsService();

    const destination =
      job.status === "ASSIGNED"
        ? job.pickup_address
        : job.delivery_address;

    if (!destination) return;

    directionsService.route(
      {
        origin: {
          lat,
          lng,
        },
        destination,
        travelMode: maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          directionsRendererRef.current?.setDirections(result);

          const leg = result.routes[0]?.legs[0];

          if (leg) {
            setRouteInfo({
              duration: leg.duration.text,
              distance: leg.distance.text,
            });
          }
        }
      }
    );
  };

  // --------------------------------------------------
  // Send location to backend
  // --------------------------------------------------
  const sendLocationToBackend = async (position) => {
    if (!token || !job?.id) {
      return;
    }

    const { latitude, longitude, accuracy } = position.coords;

    try {
      const data = {
        job_id: String(job.id),
        lat: String(latitude),
        long: String(longitude),
        gps_accuracy: String(accuracy || ""),
        time: new Date().toISOString(),
      };

      const response = await saveJobTracking(data, token);

      console.log("Location saved:", response);
    } catch (error) {
      console.error(
        "Failed to save courier location:",
        error.response?.data || error.message
      );
    }
  };

  // --------------------------------------------------
  // Handle GPS position
  // --------------------------------------------------
  const handlePosition = (position) => {
    const { latitude, longitude } = position.coords;

    // Save latest GPS position
    latestPositionRef.current = position;

    // Move courier marker
    if (myMarkerRef.current) {
      myMarkerRef.current.setPosition({
        lat: latitude,
        lng: longitude,
      });
    }

    // Move map
    mapInstanceRef.current?.panTo({
      lat: latitude,
      lng: longitude,
    });

    // Update route
    fetchRoute(latitude, longitude);
  };

  // --------------------------------------------------
  // Start sharing
  // --------------------------------------------------
  const startSharing = () => {
    setError(null);

    if (!navigator.geolocation) {
      setError("Your browser doesn't support GPS.");
      return;
    }

    if (!token) {
      setError("Authentication token is missing.");
      return;
    }

    if (!job?.id) {
      setError("Job ID is missing.");
      return;
    }

    // Prevent duplicate tracking
    if (watchIdRef.current !== null) {
      return;
    }

    // Watch GPS continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        handlePosition(position);
      },
      (err) => {
        console.error("GPS error:", err);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );

    setIsSharing(true);

    // --------------------------------------------------
    // Send location immediately when available
    // --------------------------------------------------
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        handlePosition(position);

        await sendLocationToBackend(position);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    // --------------------------------------------------
    // Send latest location every 5 seconds
    // --------------------------------------------------
    locationIntervalRef.current = setInterval(() => {
      if (latestPositionRef.current) {
        sendLocationToBackend(latestPositionRef.current);
      }
    }, 5000);
  };

  // --------------------------------------------------
  // Stop sharing
  // --------------------------------------------------
  const stopSharing = () => {
    // Stop browser GPS
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Stop 5 second API calls
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    latestPositionRef.current = null;

    setIsSharing(false);

    console.log("Courier location sharing stopped.");
  };

  // --------------------------------------------------
  // Cleanup
  // --------------------------------------------------
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);

  return (
    <Card className="border-emerald-200 bg-emerald-50/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-600" />
          Navigation & Location Sharing
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600">
          {job.status === "ASSIGNED"
            ? `Next stop: Pick up from ${job.pickup_address}`
            : `Deliver to: ${job.delivery_address}`}
        </p>

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <WifiOff className="w-4 h-4" />
            {error}
          </p>
        )}

        {routeInfo && (
          <div className="flex gap-3 text-sm">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Clock className="w-4 h-4" />
              {routeInfo.duration}
            </span>

            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-4 h-4" />
              {routeInfo.distance}
            </span>
          </div>
        )}

        <div
          ref={mapRef}
          className="rounded-xl overflow-hidden border border-slate-200"
          style={{ height: 300 }}
        />

        <div className="flex items-center gap-3">
          {isSharing ? (
            <>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                Live — sharing location
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={stopSharing}
              >
                Stop Sharing
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={startSharing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <MapPin className="w-4 h-4 mr-1" />
              Start Navigation & Share Location
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}