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

import React, { useState, useEffect, useRef, useCallback,} from "react";

import {Card,CardContent,CardHeader,CardTitle,} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {Navigation, WifiOff, MapPin, Clock,} from "lucide-react";

import { useAuth } from "../../lib/AuthContext";

import { getJobTrackLocation } from "../../api/ApiServices/tracking/getJobTrackLocationService";

/*
|--------------------------------------------------------------------------
| Google Maps loader
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Do NOT use:
|
| libraries=directions
|
| We use the new Routes library instead.
|
*/

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    /*
     * Already loaded
     */

    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    /*
     * Check whether another component is already loading Maps.
     */

    const existingScript = document.querySelector(
      'script[data-google-maps="true"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google?.maps) {
          resolve(window.google.maps);
        } else {
          reject(
            new Error(
              "Google Maps failed to initialize."
            )
          );
        }
      });

      existingScript.addEventListener(
        "error",
        () => {
          reject(
            new Error(
              "Failed to load Google Maps."
            )
          );
        }
      );

      return;
    }

    /*
     * Create new Google Maps script.
     */

    const script = document.createElement(
      "script"
    );

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
        reject(
          new Error(
            "Google Maps failed to initialize."
          )
        );
      }
    };

    script.onerror = () => {
      reject(
        new Error(
          "Failed to load Google Maps."
        )
      );
    };

    document.head.appendChild(script);
  });
}

export default function CustomerTrackingMap({
  job,
  courierName,
}) {
  const { token } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | Map refs
  |--------------------------------------------------------------------------
  */

  const mapRef = useRef(null);

  const mapInstanceRef = useRef(null);

  const courierMarkerRef = useRef(null);

  const accuracyCircleRef = useRef(null);

  const routePolylinesRef = useRef([]);

  /*
  |--------------------------------------------------------------------------
  | Routes API
  |--------------------------------------------------------------------------
  */

  const RouteClassRef = useRef(null);

  const lastRouteRequestRef = useRef(0);

  const routeRequestInProgressRef =
    useRef(false);

  /*
  |--------------------------------------------------------------------------
  | Polling
  |--------------------------------------------------------------------------
  */

  const pollingIntervalRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [location, setLocation] =
    useState(null);

  const [isActive, setIsActive] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [mapsReady, setMapsReady] =
    useState(false);

  const [mapError, setMapError] =
    useState(null);

  const [trackingError, setTrackingError] =
    useState(null);

  const [routeInfo, setRouteInfo] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Google Maps API key
  |--------------------------------------------------------------------------
  */

  const apiKey =
    import.meta.env
      .VITE_GOOGLE_MAPS_API_KEY;

  /*
  |--------------------------------------------------------------------------
  | Get tracking destination
  |--------------------------------------------------------------------------
  */

  const getDestination = useCallback(() => {
    if (!job) {
      return null;
    }

    /*
     * ASSIGNED:
     *
     * Courier is going to pickup.
     */

    if (job.status === "ASSIGNED") {
      return job.pickup_address;
    }

    /*
     * PICKED_UP:
     *
     * Courier is going to delivery.
     */

    if (
      job.status === "PICKED_UP" ||
      job.status === "IN_TRANSIT"
    ) {
      return job.delivery_address;
    }

    /*
     * Fallback
     */

    return (
      job.delivery_address ||
      job.pickup_address ||
      null
    );
  }, [job]);

  /*
  |--------------------------------------------------------------------------
  | Clear existing route
  |--------------------------------------------------------------------------
  */

  const clearRoute = useCallback(() => {
    routePolylinesRef.current.forEach(
      (polyline) => {
        polyline.setMap(null);
      }
    );

    routePolylinesRef.current = [];

    setRouteInfo(null);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Calculate route
  |--------------------------------------------------------------------------
  */

  const fetchRoute = useCallback(
    async (
      latitude,
      longitude,
      force = false
    ) => {
      if (
        !mapsReady ||
        !mapInstanceRef.current
      ) {
        return;
      }

      const Route =
        RouteClassRef.current;

      if (!Route) {
        return;
      }

      const destination =
        getDestination();

      if (!destination) {
        return;
      }

      /*
       * Avoid making a Routes API request
       * every 5 seconds.
       *
       * Normal:
       * 30 seconds
       *
       * Force:
       * immediately
       */

      const now = Date.now();

      if (
        !force &&
        now -
          lastRouteRequestRef.current <
          30000
      ) {
        return;
      }

      if (
        routeRequestInProgressRef.current
      ) {
        return;
      }

      routeRequestInProgressRef.current =
        true;

      lastRouteRequestRef.current =
        now;

      try {
        const result =
          await Route.computeRoutes({
            origin: {
              lat: latitude,
              lng: longitude,
            },

            destination,

            travelMode: "DRIVING",

            routingPreference:
              "TRAFFIC_AWARE",

            fields: [
              "path",
              "distanceMeters",
              "durationMillis",
            ],
          });

        if (
          !result?.routes ||
          result.routes.length === 0
        ) {
          // console.warn(
          //   "No route found."
          // );

          return;
        }

        const route =
          result.routes[0];

        /*
         * Remove previous route
         */

        clearRoute();

        /*
         * Create new route polyline
         */

        const polylines =
          route.createPolylines({
            polylineOptions: {
              strokeColor:
                "#4f46e5",

              strokeOpacity: 0.9,

              strokeWeight: 5,
            },
          });

        polylines.forEach(
          (polyline) => {
            polyline.setMap(
              mapInstanceRef.current
            );
          }
        );

        routePolylinesRef.current =
          polylines;

        /*
         * Distance
         */

        const distanceMeters =
          Number(
            route.distanceMeters || 0
          );

        const distanceKm =
          distanceMeters / 1000;

        /*
         * Duration
         */

        const durationMinutes =
          Number(
            route.durationMillis || 0
          ) / 60000;

        let durationText = "";

        if (durationMinutes < 1) {
          durationText = "< 1 min";
        } else if (
          durationMinutes < 60
        ) {
          durationText =
            `${Math.round(
              durationMinutes
            )} min`;
        } else {
          const hours =
            Math.floor(
              durationMinutes / 60
            );

          const minutes =
            Math.round(
              durationMinutes % 60
            );

          durationText =
            minutes > 0
              ? `${hours} hr ${minutes} min`
              : `${hours} hr`;
        }

        setRouteInfo({
          duration: durationText,

          distance:
            distanceKm < 1
              ? `${Math.round(
                  distanceMeters
                )} m`
              : `${distanceKm.toFixed(
                  1
                )} km`,
        });
      } catch (error) {
        // console.error(
        //   "Routes API error:",
        //   error
        // );

        /*
         * Don't overwrite the whole map with
         * a route error.
         */

        setRouteInfo(null);
      } finally {
        routeRequestInProgressRef.current =
          false;
      }
    },
    [
      mapsReady,
      getDestination,
      clearRoute,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | Initialize Google Map
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!apiKey) {
      setMapError(
        "Google Maps API key is missing."
      );

      return;
    }

    if (!mapRef.current) {
      return;
    }

    let cancelled = false;

    const initializeMap =
      async () => {
        try {
          const maps =
            await loadGoogleMaps(
              apiKey
            );

          if (
            cancelled ||
            !mapRef.current
          ) {
            return;
          }

          /*
           * Maps library
           */

          const { Map } =
            await maps.importLibrary(
              "maps"
            );

          /*
           * Routes library
           */

          const { Route } =
            await maps.importLibrary(
              "routes"
            );

          RouteClassRef.current =
            Route;

          /*
           * Marker library
           */

          const {
            AdvancedMarkerElement,
          } =
            await maps.importLibrary(
              "marker"
            );

          /*
           * Default map center
           */

          const defaultCenter = {
            lat: -33.8688,
            lng: 151.2093,
          };

          /*
           * Create map
           */

          const map = new Map(
            mapRef.current,
            {
              center:
                defaultCenter,

              zoom: 13,

              mapId:
                "DEMO_MAP_ID",

              mapTypeControl:
                false,

              fullscreenControl:
                false,

              streetViewControl:
                false,

              zoomControl:
                true,

              gestureHandling:
                "greedy",
            }
          );

          mapInstanceRef.current =
            map;

          /*
           |--------------------------------------------------------------------------
           | Blue courier marker
           |--------------------------------------------------------------------------
           */

          const markerElement =
            document.createElement(
              "div"
            );

          markerElement.style.width =
            "18px";

          markerElement.style.height =
            "18px";

          markerElement.style.borderRadius =
            "50%";

          markerElement.style.background =
            "#2563EB";

          markerElement.style.border =
            "3px solid white";

          markerElement.style.boxShadow =
            "0 1px 6px rgba(0,0,0,0.35)";

          courierMarkerRef.current =
            new AdvancedMarkerElement({
              map,

              position:
                defaultCenter,

              title:
                courierName ||
                "Courier",

              content:
                markerElement,
            });

          /*
           * Initially hide marker
           */

          courierMarkerRef.current.map =
            null;

          /*
           |--------------------------------------------------------------------------
           | GPS accuracy circle
           |--------------------------------------------------------------------------
           */

          accuracyCircleRef.current =
            new maps.Circle({
              map: null,

              center:
                defaultCenter,

              radius: 30,

              fillColor:
                "#2563EB",

              fillOpacity:
                0.12,

              strokeColor:
                "#2563EB",

              strokeOpacity:
                0.25,

              strokeWeight: 1,

              clickable: false,
            });

          setMapsReady(true);

          setMapError(null);
        } catch (error) {
          // console.error(
          //   "Google Maps initialization error:",
          //   error
          // );

          setMapError(
            error?.message ||
              "Failed to load Google Maps."
          );
        }
      };

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, [apiKey, courierName]);

  /*
  |--------------------------------------------------------------------------
  | Fetch latest courier location
  |--------------------------------------------------------------------------
  */

  const fetchCourierLocation =
    useCallback(async () => {
      if (
        !token ||
        !job?.id
      ) {
        return;
      }

      try {
        const response =
          await getJobTrackLocation(
            job.id,
            token
          );

        if (
          response?.status !== 1
        ) {
          setTrackingError(
            response?.msg ||
              "Unable to get courier location."
          );

          return;
        }

        const locations =
          response?.payload
            ?.locations || [];

        if (
          locations.length === 0
        ) {
          setTrackingError(
            "Courier location is not available yet."
          );

          setIsActive(false);

          return;
        }

        /*
         * Get latest location
         */

        const locationData =
          locations[
            locations.length - 1
          ];

        if (!locationData) {
          return;
        }

        const lat = Number(
          locationData.lat ??
            locationData.latitude
        );

        const lng = Number(
          locationData.long ??
            locationData.lng ??
            locationData.longitude
        );

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng)
        ) {
          setTrackingError(
            "Invalid courier location received from server."
          );

          return;
        }

        /*
         * Backend timestamp
         */

        const backendTime =
          locationData.time
            ? new Date(
                locationData.time
              )
            : new Date();

        setLocation({
          lat,

          lng,

          gps_accuracy:
            locationData.gps_accuracy,

          time:
            locationData.time,
        });

        setLastUpdated(
          backendTime
        );

        setIsActive(true);

        setTrackingError(null);

        /*
         |--------------------------------------------------------------------------
         | Update courier marker
         |--------------------------------------------------------------------------
         */

        if (
          mapsReady &&
          mapInstanceRef.current &&
          courierMarkerRef.current
        ) {
          const newPosition = {
            lat,
            lng,
          };

          courierMarkerRef.current.position =
            newPosition;

          courierMarkerRef.current.map =
            mapInstanceRef.current;

          /*
           * Accuracy circle
           */

          if (
            accuracyCircleRef.current
          ) {
            const accuracy =
              Math.min(
                Math.max(
                  Number(
                    locationData.gps_accuracy
                  ) || 30,
                  10
                ),
                100
              );

            accuracyCircleRef.current.setCenter(
              newPosition
            );

            accuracyCircleRef.current.setRadius(
              accuracy
            );

            accuracyCircleRef.current.setMap(
              mapInstanceRef.current
            );
          }

          /*
           * Move map to courier
           */

          mapInstanceRef.current.panTo(
            newPosition
          );

          /*
           * Calculate route
           */

          fetchRoute(
            lat,
            lng
          );
        }
      } catch (error) {
        // console.error(
        //   "Courier tracking error:",
        //   error
        // );

        setTrackingError(
          error?.response?.data?.msg ||
            "Failed to get courier location."
        );
      }
    }, [
      token,
      job?.id,
      mapsReady,
      fetchRoute,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Start polling
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | 5000 = 5 seconds
  |
  */

  useEffect(() => {
    if (
      !mapsReady ||
      !token ||
      !job?.id
    ) {
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
}, 60000);


    return () => {
      if (
        pollingIntervalRef.current
      ) {
        clearInterval(
          pollingIntervalRef.current
        );

        pollingIntervalRef.current =
          null;
      }
    };
  }, [
    mapsReady,
    token,
    job?.id,
    fetchCourierLocation,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Recalculate route when job status changes
  |--------------------------------------------------------------------------
  |
  | ASSIGNED:
  | pickup route
  |
  | PICKED_UP:
  | delivery route
  |
  */

  useEffect(() => {
    if (
      !mapsReady ||
      !location
    ) {
      return;
    }

    fetchRoute(
      location.lat,
      location.lng,
      true
    );
  }, [
    job?.status,
    mapsReady,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Detect stale location
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!lastUpdated) {
      return;
    }

    const timer =
      setInterval(() => {
        const seconds =
          (
            new Date() -
            lastUpdated
          ) / 1000;

        /*
         * Backend has not provided
         * a new location for 20+ seconds.
         */

        if (seconds > 20) {
          setIsActive(false);
        }
      }, 1000);

    return () =>
      clearInterval(timer);
  }, [lastUpdated]);

  /*
  |--------------------------------------------------------------------------
  | Time since last update
  |--------------------------------------------------------------------------
  */

  const getTimeSince = () => {
    if (!lastUpdated) {
      return "";
    }

    const seconds = Math.floor(
      (new Date() -
        lastUpdated) /
        1000
    );

    if (seconds < 60) {
      return `${seconds}s ago`;
    }

    return `${Math.floor(
      seconds / 60
    )}m ago`;
  };

  /*
  |--------------------------------------------------------------------------
  | Cleanup
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (
        pollingIntervalRef.current
      ) {
        clearInterval(
          pollingIntervalRef.current
        );
      }

      routePolylinesRef.current.forEach(
        (polyline) => {
          polyline.setMap(null);
        }
      );

      routePolylinesRef.current = [];

      if (
        accuracyCircleRef.current
      ) {
        accuracyCircleRef.current.setMap(
          null
        );
      }

      if (
        courierMarkerRef.current
      ) {
        courierMarkerRef.current.map =
          null;
      }

      mapInstanceRef.current =
        null;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Navigation className="w-4 h-4 text-indigo-600" />

          {courierName
            ? `${courierName} Tracking`
            : "Courier Tracking"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Tracking status */}

        <div className="flex items-center gap-2 flex-wrap">
          {!location ? (
            <span className="flex items-center gap-1 text-sm text-slate-500">
              <WifiOff className="w-4 h-4" />

              Waiting for courier to share
              location...
            </span>
          ) : isActive ? (
            <>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />

                Live tracking
              </Badge>

              <span className="text-xs text-slate-400">
                Updated{" "}
                {getTimeSince()}
              </span>
            </>
          ) : (
            <Badge className="bg-slate-100 text-slate-600">
              Last seen{" "}
              {getTimeSince()}
            </Badge>
          )}
        </div>

        {/* Google Maps error */}

        {mapError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {mapError}
            </p>

            <p className="text-xs text-red-500 mt-1">
              Check your Google Maps API
              key and Google Cloud API
              configuration.
            </p>
          </div>
        )}

        {/* Tracking error */}

        {trackingError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              {trackingError}
            </p>
          </div>
        )}

        {/* Map */}

        <div
          ref={mapRef}
          className="rounded-xl overflow-hidden border border-slate-200"
          style={{
            height: 320,
            width: "100%",
          }}
        />

        {/* Last update */}

        {lastUpdated && (
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />

            Last location update:{" "}
            {getTimeSince()}
          </p>
        )}

        {/* Route information */}

 {/*       {routeInfo && (
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
        )} */}
 
        {/* Polling information */}

        <p className="text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />

          Courier position updates every
          5 seconds.
        </p>
      </CardContent>
    </Card>
  );
}