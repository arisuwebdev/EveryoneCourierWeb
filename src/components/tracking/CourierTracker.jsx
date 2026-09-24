// // ---------------------------------------------- this is the code check for waze route runner map

// import React, { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Navigation, MapPin, ExternalLink, WifiOff } from "lucide-react";

// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   Polyline,
//   useMap,
// } from "react-leaflet";

// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// import { useAuth } from "../../lib/AuthContext";
// import { saveJobTracking } from "../../api/ApiServices/tracking/saveJobTrackingService";

// /*
// |--------------------------------------------------------------------------
// | Fix Leaflet marker icons
// |--------------------------------------------------------------------------
// */

// delete L.Icon.Default.prototype._getIconUrl;

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
// });

// /*
// |--------------------------------------------------------------------------
// | Map component
// |--------------------------------------------------------------------------
// | Automatically moves the map when courier location changes.
// */

// function MapUpdater({ currentLocation }) {
//   const map = useMap();

//   useEffect(() => {
//     if (!currentLocation) return;

//     map.setView(
//       [currentLocation.latitude, currentLocation.longitude],
//       map.getZoom(),
//     );
//   }, [currentLocation, map]);

//   return null;
// }

// /*
// |--------------------------------------------------------------------------
// | Geocode address
// |--------------------------------------------------------------------------
// | Converts:
// |
// | "123 Park Street, Kolkata"
// |
// | into:
// |
// | {
// |   lat: 22.xxxxx,
// |   lon: 88.xxxxx
// | }
// |
// */

// const geocodeAddress = async (address) => {
//   console.log("🌍 Geocoding address:", address);

//   if (!address) {
//     console.error("❌ Address is empty");
//     return null;
//   }

//   try {
//     const params = new URLSearchParams({
//       q: address,
//       format: "json",
//       limit: "1",
//       countrycodes: "au",
//     });

//     const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

//     console.log("🌍 Geocoding URL:", url);

//     const response = await fetch(url, {
//       headers: {
//         Accept: "application/json",
//       },
//     });

//     console.log("🌍 Geocoding response status:", response.status);

//     if (!response.ok) {
//       throw new Error("Geocoding request failed");
//     }

//     const data = await response.json();

//     console.log("🌍 Geocoding response:", data);

//     if (!data?.length) {
//       console.error("❌ No location found for:", address);
//       return null;
//     }

//     const location = {
//       lat: Number(data[0].lat),
//       lon: Number(data[0].lon),
//       displayName: data[0].display_name,
//     };

//     console.log("✅ Location found:", location);

//     return location;
//   } catch (error) {
//     console.error("❌ Geocoding error:", error);
//     return null;
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | Get road route
// |--------------------------------------------------------------------------
// */

// const getRoadRoute = async (start, destination) => {
//   if (!start || !destination) {
//     return [];
//   }

//   try {
//     const startPoint = `${start.lon},${start.lat}`;
//     const destinationPoint = `${destination.lon},${destination.lat}`;

//     const url =
//       `https://router.project-osrm.org/route/v1/driving/` +
//       `${startPoint};${destinationPoint}` +
//       `?overview=full&geometries=geojson`;

//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error("Route request failed");
//     }

//     const data = await response.json();

//     if (!data?.routes?.length) {
//       return [];
//     }

//     /*
//      * OSRM returns:
//      *
//      * [longitude, latitude]
//      *
//      * Leaflet needs:
//      *
//      * [latitude, longitude]
//      */

//     return data.routes[0].geometry.coordinates.map(([longitude, latitude]) => [
//       latitude,
//       longitude,
//     ]);
//   } catch (error) {
//     console.error("Route error:", error);
//     return [];
//   }
// };

// export default function CourierTracker({ job }) {
//   const { token } = useAuth();

//   const watchIdRef = useRef(null);
//   const latestPositionRef = useRef(null);
//   const locationIntervalRef = useRef(null);

//   const [isSharing, setIsSharing] = useState(() => {
//     if (!job?.id) return false;

//     return localStorage.getItem(`locationSharing_${job.id}`) === "true";
//   });

//   const [error, setError] = useState(null);

//   const [currentLocation, setCurrentLocation] = useState(null);

//   /*
//   |--------------------------------------------------------------------------
//   | Dynamic pickup/delivery coordinates
//   |--------------------------------------------------------------------------
//   */

//   const [pickupLocation, setPickupLocation] = useState(null);
//   const [deliveryLocation, setDeliveryLocation] = useState(null);

//   /*
//   |--------------------------------------------------------------------------
//   | Route
//   |--------------------------------------------------------------------------
//   */

//   const [routeCoordinates, setRouteCoordinates] = useState([]);

//   const [isLoadingLocations, setIsLoadingLocations] = useState(false);

//   /*
//   |--------------------------------------------------------------------------
//   | 1. Convert pickup & delivery addresses into coordinates
//   |--------------------------------------------------------------------------
//   */

//   useEffect(() => {
//     if (!job?.id) return;

//     const loadLocations = async () => {
//       setIsLoadingLocations(true);
//       setError(null);

//       console.log("========== LOAD LOCATIONS ==========");
//       console.log("Full job:", job);
//       console.log("Pickup API address:", job?.pickup_address);
//       console.log("Delivery API address:", job?.delivery_address);

//       try {
//         const deliveryAddress = job?.delivery_address
//           ?.replace(/^.*?(?=\d+\s)/, "")
//           ?.trim();

//         console.log("📍 Clean delivery address:", deliveryAddress);

//         const [pickup, delivery] = await Promise.all([
//           geocodeAddress(job?.pickup_address),
//           geocodeAddress(deliveryAddress),
//         ]);

//         console.log("========== LOCATION RESULTS ==========");
//         console.log("Pickup location:", pickup);
//         console.log("Delivery location:", delivery);

//         setPickupLocation(pickup);
//         setDeliveryLocation(delivery);

//         if (!pickup) {
//           console.error("❌ Pickup location not found");
//         }

//         if (!delivery) {
//           console.error("❌ Delivery location not found");
//         }
//       } catch (error) {
//         console.error("❌ Location loading error:", error);
//         setError("Unable to find pickup or delivery coordinates.");
//       } finally {
//         setIsLoadingLocations(false);
//       }
//     };

//     loadLocations();
//   }, [job?.id, job?.pickup_address, job?.delivery_address]);

//   /*
//   |--------------------------------------------------------------------------
//   | 2. Restore location sharing
//   |--------------------------------------------------------------------------
//   */

//   useEffect(() => {
//     if (!job?.id) return;

//     const savedSharing =
//       localStorage.getItem(`locationSharing_${job.id}`) === "true";

//     if (savedSharing && watchIdRef.current === null) {
//       startSharing();
//     }

//     return () => {
//       stopSharing();
//     };
//   }, [job?.id]);

//   /*
//   |--------------------------------------------------------------------------
//   | 3. Send location to backend
//   |--------------------------------------------------------------------------
//   */

//   const sendLocationToBackend = async (position) => {
//     if (!token || !job?.id) {
//       return;
//     }

//     const { latitude, longitude, accuracy } = position.coords;

//     try {
//       const data = {
//         job_id: String(job.id),
//         lat: String(latitude),
//         long: String(longitude),
//         gps_accuracy: String(accuracy || ""),
//         time: new Date().toISOString(),
//       };

//       await saveJobTracking(data, token);
//     } catch (error) {
//       console.error("Failed to save courier location:", error);
//     }
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | 4. Handle GPS position
//   |--------------------------------------------------------------------------
//   */

//   const handlePosition = (position) => {
//     const { latitude, longitude, accuracy } = position.coords;

//     latestPositionRef.current = position;

//     setCurrentLocation({
//       latitude,
//       longitude,
//       accuracy,
//     });
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | 5. Start GPS sharing
//   |--------------------------------------------------------------------------
//   */

//   const startSharing = () => {
//     setError(null);

//     if (!navigator.geolocation) {
//       setError("Your browser doesn't support GPS.");
//       return;
//     }

//     if (!token) {
//       setError("Authentication token is missing.");
//       return;
//     }

//     if (!job?.id) {
//       setError("Job ID is missing.");
//       return;
//     }

//     if (watchIdRef.current !== null) {
//       return;
//     }

//     localStorage.setItem(`locationSharing_${job.id}`, "true");

//     /*
//      * Watch device GPS continuously
//      */

//     watchIdRef.current = navigator.geolocation.watchPosition(
//       (position) => {
//         handlePosition(position);
//       },
//       (err) => {
//         console.error("GPS error:", err);

//         setError(err.message);
//       },
//       {
//         enableHighAccuracy: true,
//         maximumAge: 3000,
//         timeout: 10000,
//       },
//     );

//     setIsSharing(true);

//     /*
//      * Get first location immediately
//      */

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         handlePosition(position);

//         await sendLocationToBackend(position);
//       },
//       (err) => {
//         setError(err.message);
//       },
//       {
//         enableHighAccuracy: true,
//         maximumAge: 0,
//         timeout: 10000,
//       },
//     );

//     /*
//      * Send latest location every 5 seconds
//      */

//     locationIntervalRef.current = setInterval(() => {
//       if (latestPositionRef.current) {
//         sendLocationToBackend(latestPositionRef.current);
//       }
//     }, 5000);
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | 6. Stop sharing
//   |--------------------------------------------------------------------------
//   */

//   const stopSharing = () => {
//     if (watchIdRef.current !== null) {
//       navigator.geolocation.clearWatch(watchIdRef.current);

//       watchIdRef.current = null;
//     }

//     if (locationIntervalRef.current) {
//       clearInterval(locationIntervalRef.current);

//       locationIntervalRef.current = null;
//     }

//     latestPositionRef.current = null;

//     if (job?.id) {
//       localStorage.removeItem(`locationSharing_${job.id}`);
//     }

//     setCurrentLocation(null);
//     setRouteCoordinates([]);
//     setIsSharing(false);
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | 7. Cleanup
//   |--------------------------------------------------------------------------
//   */

//   useEffect(() => {
//     return () => {
//       if (watchIdRef.current !== null) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//       }

//       if (locationIntervalRef.current) {
//         clearInterval(locationIntervalRef.current);
//       }
//     };
//   }, []);

//   /*
//   |--------------------------------------------------------------------------
//   | 8. Decide current destination
//   |--------------------------------------------------------------------------
//   */

//   const destination =
//     job?.status === "ASSIGNED" ? pickupLocation : deliveryLocation;

//   const destinationAddress =
//     job?.status === "ASSIGNED" ? job?.pickup_address : job?.delivery_address;

//   /*
//   |--------------------------------------------------------------------------
//   | 9. Get route
//   |--------------------------------------------------------------------------
//   */

//   useEffect(() => {
//     if (!currentLocation || !destination) {
//       setRouteCoordinates([]);
//       return;
//     }

//     const start = {
//       lat: currentLocation.latitude,
//       lon: currentLocation.longitude,
//     };

//     let cancelled = false;

//     const loadRoute = async () => {
//       const route = await getRoadRoute(start, destination);

//       if (!cancelled) {
//         setRouteCoordinates(route);
//       }
//     };

//     loadRoute();

//     return () => {
//       cancelled = true;
//     };
//   }, [
//     currentLocation?.latitude,
//     currentLocation?.longitude,
//     destination?.lat,
//     destination?.lon,
//   ]);

//   /*
//   |--------------------------------------------------------------------------
//   | 10. Waze Pickup URL
//   |--------------------------------------------------------------------------
//   */

//   const getPickupWazeUrl = () => {
//     if (!pickupLocation) {
//       return null;
//     }

//     const params = new URLSearchParams({
//       ll: `${pickupLocation.lat},${pickupLocation.lon}`,
//       navigate: "yes",
//     });

//     return `https://waze.com/ul?${params.toString()}`;
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | 11. Waze Delivery URL
//   |--------------------------------------------------------------------------
//   */

//   const getDeliveryWazeUrl = () => {
//     if (!deliveryLocation) {
//       return null;
//     }

//     const params = new URLSearchParams({
//       ll: `${deliveryLocation.lat},${deliveryLocation.lon}`,
//       navigate: "yes",
//     });

//     return `https://waze.com/ul?${params.toString()}`;
//   };

//   const getCurrentLocationWazeUrl = () => {
//     console.log("========== WAZE ==========");

//     console.log("Current GPS:", currentLocation);
//     console.log("Delivery location:", deliveryLocation);

//     if (!currentLocation) {
//       console.error("❌ Current GPS location missing");
//       return null;
//     }

//     if (!deliveryLocation) {
//       console.error("❌ Delivery location missing");
//       return null;
//     }

//     const url =
//       `https://waze.com/ul?` +
//       `ll=${deliveryLocation.lat},${deliveryLocation.lon}` +
//       `&navigate=yes`;

//     console.log("✅ Waze URL:", url);

//     return url;
//   };

//   // const getCurrentLocationWazeUrl = () => {
//   //   return "https://waze.com/ul";
//   // };

//   /*
//   |--------------------------------------------------------------------------
//   | 12. Open Pickup in Waze
//   |--------------------------------------------------------------------------
//   */

//   const openPickupInWaze = () => {
//     const url = getPickupWazeUrl();

//     if (!url) {
//       setError("Pickup coordinates are not available.");
//       return;
//     }

//     window.open(url, "_blank");
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | 13. Open Delivery in Waze
//   |--------------------------------------------------------------------------
//   */

//   const openDeliveryInWaze = () => {
//     const url = getDeliveryWazeUrl();

//     if (!url) {
//       setError("Delivery coordinates are not available.");
//       return;
//     }

//     window.open(url, "_blank");
//   };

// const openCurrentLocationInWaze = () => {
//   console.log("========== WAZE ROUTE TEST ==========");

//   if (!currentLocation) {
//     console.error("❌ Current GPS location missing");
//     setError("Current GPS location is not available.");
//     return;
//   }

//   if (!deliveryLocation) {
//     console.error("❌ Delivery location missing");
//     setError("Delivery location is not available.");
//     return;
//   }

//   const currentLat = currentLocation.latitude;
//   const currentLon = currentLocation.longitude;

//   const deliveryLat = deliveryLocation.lat;
//   const deliveryLon = deliveryLocation.lon;

//   console.log("🚗 CURRENT GPS:");
//   console.log("Latitude:", currentLat);
//   console.log("Longitude:", currentLon);

//   console.log("🎯 DELIVERY:");
//   console.log("Latitude:", deliveryLat);
//   console.log("Longitude:", deliveryLon);

//   const url =
//     `https://waze.com/ul?` +
//     `ll=${deliveryLat},${deliveryLon}` +
//     `&navigate=yes`;

//   console.log("🚀 WAZE URL:", url);

//   window.location.href = url;
// };

//   /*
//   |--------------------------------------------------------------------------
//   | 14. Map center
//   |--------------------------------------------------------------------------
//   */

//   const mapCenter = currentLocation
//     ? [currentLocation.latitude, currentLocation.longitude]
//     : pickupLocation
//       ? [pickupLocation.lat, pickupLocation.lon]
//       : null;

//   /*
//   |--------------------------------------------------------------------------
//   | UI
//   |--------------------------------------------------------------------------
//   */

//   return (
//     <Card className="border-emerald-200 bg-emerald-50/40">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-base flex items-center gap-2">
//           <Navigation className="w-4 h-4 text-emerald-600" />
//           Navigation & Location Sharing
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-3">
//         {/* Destination text */}

//         <p className="text-sm text-slate-600">
//           {job?.status === "ASSIGNED"
//             ? `Next stop: Pick up from ${
//                 job?.pickup_address || "Pickup address unavailable"
//               }`
//             : `Deliver to: ${
//                 job?.delivery_address || "Delivery address unavailable"
//               }`}
//         </p>

//         {/* Error */}

//         {error && (
//           <p className="text-sm text-red-600 flex items-center gap-1">
//             <WifiOff className="w-4 h-4" />

//             {error}
//           </p>
//         )}

//         {/* Waze section */}

//         <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
//           <div className="p-6 space-y-4">
//             <div className="text-center">
//               <Navigation className="w-10 h-10 mx-auto text-blue-600" />

//               <p className="font-semibold text-slate-800 mt-2">
//                 Waze Navigation
//               </p>

//               <p className="text-sm text-slate-500 mt-1">
//                 Navigate to pickup or delivery location using Waze.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Live Map */}

//         <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
//           <div className="px-4 pt-3 pb-3 flex items-center gap-2">
//             <MapPin className="w-4 h-4 text-emerald-600" />

//             <span className="text-sm font-medium text-slate-800">
//               Live Route Map
//             </span>
//           </div>

//           {isLoadingLocations ? (
//             <div className="h-[300px] flex items-center justify-center text-sm text-slate-500">
//               Finding pickup and delivery locations...
//             </div>
//           ) : !mapCenter ? (
//             <div className="h-[300px] flex items-center justify-center text-sm text-slate-500">
//               Waiting for location...
//             </div>
//           ) : (
//             <MapContainer
//               center={mapCenter}
//               zoom={13}
//               style={{
//                 height: "300px",
//                 width: "100%",
//               }}
//             >
//               <TileLayer
//                 attribution="&copy; OpenStreetMap contributors"
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />

//               {/* Update map when GPS changes */}

//               <MapUpdater currentLocation={currentLocation} />

//               {/* Courier */}

//               {currentLocation && (
//                 <Marker
//                   position={[
//                     currentLocation.latitude,
//                     currentLocation.longitude,
//                   ]}
//                 >
//                   <Popup>
//                     <strong>Current Courier Location</strong>
//                     <br />
//                     Accuracy:{" "}
//                     {currentLocation.accuracy
//                       ? `${Math.round(currentLocation.accuracy)} m`
//                       : "Unknown"}
//                   </Popup>
//                 </Marker>
//               )}

//               {/* Pickup */}

//               {pickupLocation && (
//                 <Marker position={[pickupLocation.lat, pickupLocation.lon]}>
//                   <Popup>
//                     <strong>Pickup</strong>
//                     <br />
//                     {job?.pickup_address}
//                   </Popup>
//                 </Marker>
//               )}

//               {/* Delivery */}

//               {deliveryLocation && (
//                 <Marker position={[deliveryLocation.lat, deliveryLocation.lon]}>
//                   <Popup>
//                     <strong>Delivery</strong>
//                     <br />
//                     {job?.delivery_address}
//                   </Popup>
//                 </Marker>
//               )}

//               {/* Route */}

//               {routeCoordinates.length > 0 && (
//                 <Polyline
//                   positions={routeCoordinates}
//                   pathOptions={{
//                     color: "#2563eb",
//                     weight: 5,
//                     opacity: 0.8,
//                   }}
//                 />
//               )}
//             </MapContainer>
//           )}
//         </div>

//         {/* Current location information */}

//         {currentLocation && (
//           <div className="rounded-lg border bg-white p-3">
//             <div className="flex items-center gap-2 mb-2">
//               <MapPin className="w-4 h-4 text-emerald-600" />

//               <span className="text-sm font-medium">Current Location</span>
//             </div>

//             <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
//               <div>
//                 <span className="font-medium">Latitude:</span>{" "}
//                 {currentLocation.latitude.toFixed(6)}
//               </div>

//               <div>
//                 <span className="font-medium">Longitude:</span>{" "}
//                 {currentLocation.longitude.toFixed(6)}
//               </div>

//               <div>
//                 <span className="font-medium">Accuracy:</span>{" "}
//                 {currentLocation.accuracy
//                   ? `${Math.round(currentLocation.accuracy)} m`
//                   : "Unknown"}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Sharing */}

//         <div className="flex items-center gap-3">
//           {isSharing ? (
//             <>
//               <Badge
//                 className="
//         bg-green-100
//         text-green-800
//         hover:bg-green-100
//         flex items-center gap-1
//       "
//               >
//                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
//                 Live — sharing location
//               </Badge>

//               <Button variant="outline" size="sm" onClick={stopSharing}>
//                 Stop Sharing
//               </Button>

//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={openCurrentLocationInWaze}
//               >
//                 <Navigation className="w-4 h-4 mr-1" />
//                 Open Current Location in Waze
//               </Button>
//             </>
//           ) : (
//             <Button
//               size="sm"
//               onClick={startSharing}
//               className="bg-emerald-600 hover:bg-emerald-700"
//             >
//               <MapPin className="w-4 h-4 mr-1" />
//               Start Navigation & Share Location
//             </Button>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// --------------------------------------  this is the use for google map

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

  // const [isSharing, setIsSharing] = useState(false);
  const [isSharing, setIsSharing] = useState(() => {
    if (!job?.id) return false;

    return localStorage.getItem(`locationSharing_${job.id}`) === "true";
  });
  const [error, setError] = useState(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    if (!job?.id) return;

    const savedSharing =
      localStorage.getItem(`locationSharing_${job.id}`) === "true";

    if (savedSharing && watchIdRef.current === null) {
      startSharing();
    }
  }, [job?.id]);

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
      job.status === "ASSIGNED" ? job.pickup_address : job.delivery_address;

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
      },
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

    } catch (error) {
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

    if (watchIdRef.current !== null) {
      return;
    }

    // SAVE SHARING STATE
    localStorage.setItem(`locationSharing_${job.id}`, "true");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        handlePosition(position);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      },
    );

    setIsSharing(true);

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
      },
    );

    locationIntervalRef.current = setInterval(() => {
      if (latestPositionRef.current) {
        sendLocationToBackend(latestPositionRef.current);
      }
    }, 5000);
  };

  useEffect(() => {
    if (!job?.id) return;

    const savedSharing =
      localStorage.getItem(`locationSharing_${job.id}`) === "true";

    if (savedSharing && watchIdRef.current === null) {
      startSharing();
    }
  }, [job?.id]);

  // --------------------------------------------------
  // Stop sharing
  // --------------------------------------------------
  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    latestPositionRef.current = null;

    // REMOVE SAVED SHARING STATE
    if (job?.id) {
      localStorage.removeItem(`locationSharing_${job.id}`);
    }

    setIsSharing(false);
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
              <Badge
                className="
    bg-green-100
    text-green-800
    hover:bg-green-100
    flex items-center gap-1
  "
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                Live — sharing location
              </Badge>

              <Button variant="outline" size="sm" onClick={stopSharing}>
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
