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

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, WifiOff, Clock } from "lucide-react";

import { useAuth } from "../../lib/AuthContext";
import { saveJobTracking } from "../../api/ApiServices/tracking/saveJobTrackingService";

/*
|--------------------------------------------------------------------------
| Google Maps Loader
|--------------------------------------------------------------------------
|
| We load:
| - Maps JavaScript API
| - Routes library
| - Marker library
|
| Routes replaces the old DirectionsService / DirectionsRenderer.
|
*/

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    const existingScript = document.querySelector(
      'script[data-google-maps="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        resolve(window.google.maps);
      });

      existingScript.addEventListener("error", reject);

      return;
    }

    const script = document.createElement("script");

    script.src =
      `https://maps.googleapis.com/maps/api/js` +
      `?key=${apiKey}` +
      `&v=weekly` +
      `&libraries=routes,marker`;

    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "true";

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

export default function CourierTracker({ job }) {
  const { token } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | DOM / Google Maps refs
  |--------------------------------------------------------------------------
  */

  const mapRef = useRef(null);

  const mapInstanceRef = useRef(null);

  const courierMarkerRef = useRef(null);

  const accuracyCircleRef = useRef(null);

  const routePolylinesRef = useRef([]);

  const gpsPolylineRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | GPS refs
  |--------------------------------------------------------------------------
  */

  const watchIdRef = useRef(null);

  const locationIntervalRef = useRef(null);

  const latestPositionRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | GPS travelled path
  |--------------------------------------------------------------------------
  */

  const gpsPathRef = useRef([]);

  /*
  |--------------------------------------------------------------------------
  | Route request control
  |--------------------------------------------------------------------------
  */

  const lastRouteRequestRef = useRef(0);

  const routeRequestInProgressRef = useRef(false);

  /*
  |--------------------------------------------------------------------------
  | Google Maps libraries
  |--------------------------------------------------------------------------
  */

  const RouteClassRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | React state
  |--------------------------------------------------------------------------
  */

  const [isSharing, setIsSharing] = useState(() => {
    if (!job?.id) {
      return false;
    }

    return localStorage.getItem(`locationSharing_${job.id}`) === "true";
  });

  const [error, setError] = useState(null);

  const [mapsReady, setMapsReady] = useState(false);

  const [routeInfo, setRouteInfo] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Google Maps API Key
  |--------------------------------------------------------------------------
  */

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  /*
  |--------------------------------------------------------------------------
  | Get destination
  |--------------------------------------------------------------------------
  */

  const getDestination = () => {
    if (!job) {
      return null;
    }

    /*
     * ASSIGNED:
     * Courier is travelling to pickup.
     *
     * PICKED_UP:
     * Courier is travelling to delivery.
     */

    if (job.status === "ASSIGNED") {
      return job.pickup_address;
    }

    if (job.status === "PICKED_UP" || job.status === "IN_TRANSIT") {
      return job.delivery_address;
    }

    /*
     * Fallback
     */

    return job.delivery_address || job.pickup_address;
  };

  /*
  |--------------------------------------------------------------------------
  | Clear Google calculated route
  |--------------------------------------------------------------------------
  */

  const clearRoute = () => {
    routePolylinesRef.current.forEach((polyline) => {
      polyline.setMap(null);
    });

    routePolylinesRef.current = [];

    setRouteInfo(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Clear actual GPS path
  |--------------------------------------------------------------------------
  */

  const clearGpsPath = () => {
    gpsPathRef.current = [];

    if (gpsPolylineRef.current) {
      gpsPolylineRef.current.setPath([]);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Create Google Maps
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    if (!apiKey) {
      setError(
        "Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.",
      );
      return;
    }

    if (!mapRef.current) {
      return;
    }

    const initializeMap = async () => {
      try {
        const maps = await loadGoogleMaps(apiKey);

        if (cancelled || !mapRef.current) {
          return;
        }

        /*
         * Load Maps library
         */

        const { Map } = await maps.importLibrary("maps");

        /*
         * Load Routes library
         */

        const { Route } = await maps.importLibrary("routes");

        RouteClassRef.current = Route;

        /*
         * Load Marker library
         */

        const { AdvancedMarkerElement } = await maps.importLibrary("marker");

        /*
         * Create map
         */

        const map = new Map(mapRef.current, {
          center: {
            lat: 20.5937,
            lng: 78.9629,
          },

          zoom: 13,

          mapId: "DEMO_MAP_ID",

          mapTypeControl: false,

          fullscreenControl: false,

          streetViewControl: false,

          zoomControl: true,

          gestureHandling: "greedy",
        });

        mapInstanceRef.current = map;

        /*
         |--------------------------------------------------------------------------
         | Blue courier location marker
         |--------------------------------------------------------------------------
         */

        const markerElement = document.createElement("div");

        markerElement.style.width = "18px";
        markerElement.style.height = "18px";
        markerElement.style.borderRadius = "50%";
        markerElement.style.background = "#4285F4";
        markerElement.style.border = "3px solid #ffffff";
        markerElement.style.boxShadow = "0 1px 5px rgba(0,0,0,0.35)";

        courierMarkerRef.current = new AdvancedMarkerElement({
          map,

          position: {
            lat: 20.5937,
            lng: 78.9629,
          },

          title: "Your current location",

          content: markerElement,
        });

        /*
         |--------------------------------------------------------------------------
         | Accuracy circle
         |--------------------------------------------------------------------------
         */

        accuracyCircleRef.current = new maps.Circle({
          map,

          center: {
            lat: 20.5937,
            lng: 78.9629,
          },

          radius: 30,

          fillColor: "#4285F4",

          fillOpacity: 0.12,

          strokeColor: "#4285F4",

          strokeOpacity: 0.25,

          strokeWeight: 1,

          clickable: false,
        });

        /*
         |--------------------------------------------------------------------------
         | Actual GPS travelled path
         |--------------------------------------------------------------------------
         */

        gpsPolylineRef.current = new maps.Polyline({
          map,

          path: [],

          geodesic: true,

          strokeColor: "#4285F4",

          strokeOpacity: 0.75,

          strokeWeight: 5,

          clickable: false,

          zIndex: 2,
        });

        setMapsReady(true);

        /*
         |--------------------------------------------------------------------------
         | If GPS position already exists, display it
         |--------------------------------------------------------------------------
         */

        if (latestPositionRef.current) {
          updateMapPosition(latestPositionRef.current);
        }
      } catch (err) {
        // console.error("Google Maps initialization error:", err);

        setError(
          "Failed to load Google Maps. Please check your Google Maps API configuration.",
        );
      }
    };

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  /*
  |--------------------------------------------------------------------------
  | Update map with GPS position
  |--------------------------------------------------------------------------
  */

  const updateMapPosition = (position) => {
    if (!position) {
      return;
    }

    const maps = window.google?.maps;

    if (!maps || !mapInstanceRef.current) {
      return;
    }

    const { latitude, longitude, accuracy } = position.coords;

    const currentLocation = {
      lat: latitude,
      lng: longitude,
    };

    /*
     * Update blue location marker
     */

    if (courierMarkerRef.current) {
      courierMarkerRef.current.position = currentLocation;
    }

    /*
     * Update accuracy circle
     */

    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setCenter(currentLocation);

      /*
       * Don't allow the circle to become extremely large.
       */

      const safeAccuracy = Math.min(Math.max(Number(accuracy) || 30, 10), 100);

      accuracyCircleRef.current.setRadius(safeAccuracy);
    }

    /*
     * Add location to actual GPS path
     */

    const lastPoint = gpsPathRef.current[gpsPathRef.current.length - 1];

    /*
     * Only add a point when courier has moved
     * at least approximately 5 meters.
     */

    if (lastPoint) {
      const distance = calculateDistanceMeters(
        lastPoint.lat,
        lastPoint.lng,
        latitude,
        longitude,
      );

      if (distance >= 5) {
        gpsPathRef.current.push(currentLocation);
      }
    } else {
      gpsPathRef.current.push(currentLocation);
    }

    /*
     * Update actual travelled GPS polyline
     */

    if (gpsPolylineRef.current) {
      gpsPolylineRef.current.setPath(gpsPathRef.current);
    }

    /*
     * Keep courier visible
     */

    mapInstanceRef.current.panTo(currentLocation);
  };

  /*
  |--------------------------------------------------------------------------
  | Calculate distance between two GPS coordinates
  |--------------------------------------------------------------------------
  */

  const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const earthRadius = 6371000;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;

    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Google route
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | This uses the new Route.computeRoutes()
  | instead of the deprecated DirectionsService.
  |
  */

  // const fetchRoute = async (
  //   latitude,
  //   longitude,
  //   force = false
  // ) => {
  //   if (!mapsReady || !mapInstanceRef.current) {
  //     return;
  //   }

  //   const Route = RouteClassRef.current;

  //   if (!Route) {
  //     return;
  //   }

  //   const destination = getDestination();

  //   if (!destination) {
  //     return;
  //   }

  //   /*
  //    * Don't call Google Routes API on every GPS update.
  //    *
  //    * Normal refresh:
  //    * once every 30 seconds.
  //    *
  //    * Force:
  //    * immediately.
  //    */

  //   const now = Date.now();

  //   if (
  //     !force &&
  //     now - lastRouteRequestRef.current < 30000
  //   ) {
  //     return;
  //   }

  //   if (routeRequestInProgressRef.current) {
  //     return;
  //   }

  //   routeRequestInProgressRef.current = true;

  //   lastRouteRequestRef.current = now;

  //   try {
  //     clearRoute();

  //     const request = {
  //       origin: {
  //         lat: latitude,
  //         lng: longitude,
  //       },

  //       destination,

  //       travelMode: "DRIVING",

  //       routingPreference: "TRAFFIC_AWARE",

  //       /*
  //        * We need:
  //        * - path for route polyline
  //        * - distanceMeters
  //        * - durationMillis
  //        */

  //       fields: [
  //         "path",
  //         "distanceMeters",
  //         "durationMillis",
  //       ],
  //     };

  //     const result =
  //       await Route.computeRoutes(request);

  //     if (
  //       !result?.routes ||
  //       result.routes.length === 0
  //     ) {
  //       // console.warn(
  //       //   "No Google route found."
  //       // );

  //       return;
  //     }

  //     const route = result.routes[0];

  //     /*
  //      * Draw Google calculated route
  //      */

  //     const polylines =
  //       route.createPolylines({
  //         polylineOptions: {
  //           strokeColor: "#2563EB",

  //           strokeOpacity: 0.9,

  //           strokeWeight: 5,
  //         },
  //       });

  //     polylines.forEach((polyline) => {
  //       polyline.setMap(
  //         mapInstanceRef.current
  //       );
  //     });

  //     routePolylinesRef.current = polylines;

  //     /*
  //      * Route distance
  //      */

  //     const distanceKm =
  //       Number(route.distanceMeters || 0) /
  //       1000;

  //     /*
  //      * Route duration
  //      */

  //     const durationMinutes =
  //       Number(route.durationMillis || 0) /
  //       60000;

  //     let durationText = "";

  //     if (durationMinutes < 1) {
  //       durationText = "< 1 min";
  //     } else if (durationMinutes < 60) {
  //       durationText =
  //         `${Math.round(durationMinutes)} min`;
  //     } else {
  //       const hours =
  //         Math.floor(durationMinutes / 60);

  //       const minutes =
  //         Math.round(durationMinutes % 60);

  //       durationText =
  //         minutes > 0
  //           ? `${hours} hr ${minutes} min`
  //           : `${hours} hr`;
  //     }

  //     setRouteInfo({
  //       duration: durationText,

  //       distance:
  //         distanceKm < 1
  //           ? `${Math.round(
  //               Number(route.distanceMeters || 0)
  //             )} m`
  //           : `${distanceKm.toFixed(1)} km`,
  //     });
  //   } catch (err) {
  //     // console.error(
  //     //   "Google Routes API error:",
  //     //   err
  //     // );

  //     /*
  //      * Don't show a scary error every time a route
  //      * calculation temporarily fails.
  //      */

  //     setError(
  //       "Unable to calculate the current route."
  //     );
  //   } finally {
  //     routeRequestInProgressRef.current = false;
  //   }
  // };

  const routeNeedsRefreshRef = useRef(false);

  const fetchRoute = async (latitude, longitude, force = false) => {
    if (!mapsReady || !mapInstanceRef.current) {
      return;
    }

    const Route = RouteClassRef.current;

    if (!Route) {
      return;
    }

    const destination = getDestination();

    if (!destination) {
      return;
    }

    const now = Date.now();

    // If another route request is already running,
    // remember that we need to calculate again.
    if (routeRequestInProgressRef.current) {
      routeNeedsRefreshRef.current = true;
      return;
    }

    if (!force && now - lastRouteRequestRef.current < 300000) {
      return;
    }

    routeRequestInProgressRef.current = true;
    routeNeedsRefreshRef.current = false;
    lastRouteRequestRef.current = now;

    try {
      clearRoute();

      const request = {
        origin: {
          lat: latitude,
          lng: longitude,
        },
        destination,
        travelMode: "DRIVING",
        routingPreference: "TRAFFIC_AWARE",
        fields: ["path", "distanceMeters", "durationMillis"],
      };

      const result = await Route.computeRoutes(request);

      if (!result?.routes || result.routes.length === 0) {
        return;
      }

      const route = result.routes[0];

      const polylines = route.createPolylines({
        polylineOptions: {
          strokeColor: "#2563EB",
          strokeOpacity: 0.9,
          strokeWeight: 5,
        },
      });

      polylines.forEach((polyline) => {
        polyline.setMap(mapInstanceRef.current);
      });

      routePolylinesRef.current = polylines;

      const distanceMeters = Number(route.distanceMeters || 0);

      const distanceKm = distanceMeters / 1000;

      const durationMinutes = Number(route.durationMillis || 0) / 60000;

      let durationText = "";

      if (durationMinutes < 1) {
        durationText = "< 1 min";
      } else if (durationMinutes < 60) {
        durationText = `${Math.round(durationMinutes)} min`;
      } else {
        const hours = Math.floor(durationMinutes / 60);

        const minutes = Math.round(durationMinutes % 60);

        durationText =
          minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
      }

      setRouteInfo({
        duration: durationText,
        distance:
          distanceKm < 1
            ? `${Math.round(distanceMeters)} m`
            : `${distanceKm.toFixed(1)} km`,
      });
    } catch (err) {
      console.error("Route calculation error:", err);

      setError("Unable to calculate the current route.");
    } finally {
      routeRequestInProgressRef.current = false;

      // Status may have changed while the previous
      // route was being calculated.
      if (routeNeedsRefreshRef.current) {
        routeNeedsRefreshRef.current = false;

        const latestPosition = latestPositionRef.current;

        if (latestPosition) {
          const { latitude, longitude } = latestPosition.coords;

          // Force a new request so the 30-second
          // throttle does not block it.
          fetchRoute(latitude, longitude, true);
        }
      }
    }
  };
  /*
  |--------------------------------------------------------------------------
  | Send GPS location to backend
  |--------------------------------------------------------------------------
  */

  const sendLocationToBackend = async (position) => {
    if (!token || !job?.id || !position) {
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

      await saveJobTracking(data, token);
    } catch (err) {
      // console.error(
      //   "Failed to save courier location:",
      //   err
      // );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Handle GPS position
  |--------------------------------------------------------------------------
  */

  const handlePosition = async (position) => {
    if (!position) {
      return;
    }

    latestPositionRef.current = position;

    /*
     * Update blue dot and actual GPS path
     */

    updateMapPosition(position);

    /*
     * Send location immediately
     */

    await sendLocationToBackend(position);

    /*
     * Route request is throttled inside fetchRoute().
     */

    const { latitude, longitude } = position.coords;

    await fetchRoute(latitude, longitude);
  };

  /*
  |--------------------------------------------------------------------------
  | Start GPS sharing
  |--------------------------------------------------------------------------
  */

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

    /*
     * Already sharing
     */

    if (watchIdRef.current !== null) {
      return;
    }

    /*
     * Save sharing state
     */

    localStorage.setItem(`locationSharing_${job.id}`, "true");

    setIsSharing(true);

    /*
     * Watch live GPS
     */

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        handlePosition(position);
      },

      (err) => {
        // console.error(
        //   "GPS watch error:",
        //   err
        // );

        setError(getGeolocationErrorMessage(err));
      },

      {
        enableHighAccuracy: true,

        maximumAge: 3000,

        timeout: 15000,
      },
    );

    /*
     * Get immediate location
     */

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        latestPositionRef.current = position;

        updateMapPosition(position);

        /*
         * First route request should happen immediately.
         */

        const { latitude, longitude } = position.coords;

        await sendLocationToBackend(position);

        await fetchRoute(latitude, longitude, true);
      },

      (err) => {
        // console.error(
        //   "Initial GPS error:",
        //   err
        // );

        setError(getGeolocationErrorMessage(err));
      },

      {
        enableHighAccuracy: true,

        maximumAge: 0,

        timeout: 15000,
      },
    );

    /*
     * Backup backend update every 5 seconds.
     *
     * watchPosition() itself can update more or less
     * frequently depending on the device/browser.
     */

locationIntervalRef.current = setInterval(() => {
  if (latestPositionRef.current) {
    sendLocationToBackend(latestPositionRef.current);
  }
}, 300000);

  };

  /*
  |--------------------------------------------------------------------------
  | Stop GPS sharing
  |--------------------------------------------------------------------------
  */

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

    /*
     * Keep travelled path on the map while component
     * is mounted, but stop receiving GPS.
     */

    if (job?.id) {
      localStorage.removeItem(`locationSharing_${job.id}`);
    }

    setIsSharing(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Automatically restore sharing after refresh
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!job?.id) {
      return;
    }

    const savedSharing =
      localStorage.getItem(`locationSharing_${job.id}`) === "true";

    if (savedSharing && watchIdRef.current === null) {
      startSharing();
    }

    /*
     * eslint-disable-next-line react-hooks/exhaustive-deps
     */
  }, [job?.id]);

  /*
  |--------------------------------------------------------------------------
  | Recalculate route when job status changes
  |--------------------------------------------------------------------------
  |
  | ASSIGNED  -> pickup
  | PICKED_UP -> delivery
  |
  */

  useEffect(() => {
    if (!mapsReady) {
      return;
    }

    const latestPosition = latestPositionRef.current;

    if (!latestPosition) {
      return;
    }

    const { latitude, longitude } = latestPosition.coords;

    // Always force a new route when job status changes.
    fetchRoute(latitude, longitude, true);
  }, [job?.status, mapsReady]);

  /*
  |--------------------------------------------------------------------------
  | Cleanup
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);

        watchIdRef.current = null;
      }

      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);

        locationIntervalRef.current = null;
      }

      routePolylinesRef.current.forEach((polyline) => {
        polyline.setMap(null);
      });

      routePolylinesRef.current = [];

      if (gpsPolylineRef.current) {
        gpsPolylineRef.current.setMap(null);
      }

      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setMap(null);
      }

      if (courierMarkerRef.current) {
        courierMarkerRef.current.map = null;
      }

      mapInstanceRef.current = null;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Geolocation error helper
  |--------------------------------------------------------------------------
  */

  function getGeolocationErrorMessage(err) {
    if (!err) {
      return "Unable to get your location.";
    }

    switch (err.code) {
      case 1:
        return "Location permission was denied. Please allow location access.";

      case 2:
        return "Your location is currently unavailable.";

      case 3:
        return "Getting your location timed out. Please try again.";

      default:
        return err.message || "Unable to get your location.";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

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
          {job?.status === "ASSIGNED"
            ? `Next stop: Pick up from ${job?.pickup_address || "pickup location"}`
            : `Deliver to: ${job?.delivery_address || "delivery location"}`}
        </p>

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <WifiOff className="w-4 h-4" />

            {error}
          </p>
        )}

        {/* {routeInfo && (
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
        )} */}

        <div
          ref={mapRef}
          className="rounded-xl overflow-hidden border border-slate-200"
          style={{
            height: 300,
            width: "100%",
          }}
        />

        <div className="flex items-center gap-3 flex-wrap">
          {isSharing ? (
            <>
              <Badge
                className="
                  bg-green-100
                  text-green-800
                  hover:bg-green-100
                  flex
                  items-center
                  gap-1
                "
              >
                <span
                  className="
                    w-2
                    h-2
                    bg-green-500
                    rounded-full
                    animate-pulse
                    inline-block
                  "
                />
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

        {isSharing && (
          <p className="text-xs text-slate-500">
            Your live GPS location is being shared with the job tracking system.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
