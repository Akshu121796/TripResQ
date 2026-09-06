import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, MapPin, X, ExternalLink, Globe, Phone, Clock, Bike, ShoppingBag, Sun, Accessibility, Wifi, Cigarette, Info } from 'lucide-react';
import DiningLocationSelector from './DiningLocationSelector';
import NextStopDining from './NextStopDining';
import DiningFilters from './DiningFilters';
import DiningResults from './DiningResults';
import { searchLocation, getUserLocation } from '../../services/locationService';
import { getNearbyRestaurants, getCuratedFallbackRestaurants } from '../../services/restaurantService';
import { getRestaurantImage } from '../../services/restaurantImageService';

const BACKEND_BASE = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_BACKEND_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

function getInstantCoordsForQuery(query = '', fallbackName = 'Mumbai Airport') {
  const q = (query || '').toLowerCase();
  if (q.includes('mumbai') || q.includes('bom')) return { lat: 19.0896, lng: 72.8656, name: fallbackName || 'Mumbai Airport', displayName: 'Chhatrapati Shivaji Maharaj International Airport, Mumbai' };
  if (q.includes('goa') || q.includes('dabolim') || q.includes('aguada')) return { lat: 15.4925, lng: 73.7736, name: fallbackName || 'Taj Fort Aguada, Goa', displayName: 'Taj Fort Aguada, Sinquerim, Goa' };
  if (q.includes('delhi') || q.includes('del') || q.includes('igi')) return { lat: 28.5562, lng: 77.1000, name: fallbackName || 'Delhi Airport', displayName: 'Indira Gandhi International Airport, New Delhi' };
  if (q.includes('pune') || q.includes('pnq')) return { lat: 18.5284, lng: 73.8743, name: fallbackName || 'Pune Railway Station', displayName: 'Pune Railway Station, Pune' };
  if (q.includes('bangalore') || q.includes('bengaluru') || q.includes('blr')) return { lat: 12.9716, lng: 77.5946, name: fallbackName || 'Bangalore', displayName: 'Bangalore, Karnataka, India' };
  if (q.includes('jaipur') || q.includes('jai')) return { lat: 26.9124, lng: 75.7873, name: fallbackName || 'Jaipur', displayName: 'Jaipur, Rajasthan, India' };
  return { lat: 19.0896, lng: 72.8656, name: fallbackName || 'Mumbai Airport', displayName: 'Mumbai Airport' };
}

function deriveNextStopFromNodes(nodes, destinationFallback) {
  const dest = destinationFallback || 'Goa';
  if (!nodes || nodes.length === 0) {
    return {
      available: true,
      node_id: 'default-destination',
      node_type: 'TRAIN',
      name: `${dest} Railway Station`,
      location: `${dest} Railway Station`,
      destination: dest,
      arrival_time: '19:35',
      latitude: null,
      longitude: null
    };
  }

  const hotelNode = nodes.find(n => (n.type || '').toLowerCase() === 'hotel');
  if (hotelNode) {
    return {
      available: true,
      node_id: hotelNode.id,
      node_type: 'HOTEL',
      name: hotelNode.title || `${dest} Hotel`,
      location: hotelNode.location || hotelNode.sub || dest,
      destination: dest,
      arrival_time: hotelNode.scheduledStart || hotelNode.actualStart || '13:00',
      latitude: null,
      longitude: null
    };
  }

  const trainOrFlight = nodes.find(n => (n.type || '').toLowerCase() === 'train' || (n.type || '').toLowerCase() === 'flight');
  if (trainOrFlight) {
    const typeUpper = (trainOrFlight.type || '').toUpperCase();
    let stopName = `${dest} Railway Station`;
    if (typeUpper === 'FLIGHT') stopName = `${dest} Airport`;

    return {
      available: true,
      node_id: trainOrFlight.id,
      node_type: typeUpper,
      name: stopName,
      location: trainOrFlight.location || stopName,
      destination: dest,
      arrival_time: trainOrFlight.scheduledEnd || trainOrFlight.actualEnd || '19:35',
      latitude: null,
      longitude: null
    };
  }

  return {
    available: true,
    node_id: nodes[0].id,
    node_type: (nodes[0].type || 'ACTIVITY').toUpperCase(),
    name: nodes[0].title || `${dest} Destination`,
    location: nodes[0].title,
    destination: dest,
    arrival_time: nodes[0].scheduledStart || '19:35',
    latitude: null,
    longitude: null
  };
}

/**
 * DiningHub: Travel-Aware Real Nearby Restaurant Discovery
 *
 * Implements instant zero-latency demo rendering with bundled deterministic datasets,
 * graceful offline/production fallback, and live OpenStreetMap Overpass search when requested.
 */
export default function DiningHub({
  tripId,
  tripRef,
  currentTripNodes = [],
  activeDestination = 'Goa'
}) {
  // Mode: 'next_stop' | 'current_loc' | 'search'
  const [activeMode, setActiveMode] = useState('next_stop');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial next stop derivation
  const initialStop = deriveNextStopFromNodes(currentTripNodes, activeDestination);
  const initialLocQuery = initialStop?.destination || initialStop?.name || activeDestination || 'Mumbai Airport';
  const initialCoords = getInstantCoordsForQuery(initialLocQuery, initialStop?.name || activeDestination);

  // Next stop data from backend
  const [nextStopData, setNextStopData] = useState(initialStop);
  const [isLoadingNextStop, setIsLoadingNextStop] = useState(false);

  // Active resolved coordinate & location context
  const [currentCoords, setCurrentCoords] = useState(initialCoords);
  const [resolvedLocationName, setResolvedLocationName] = useState(initialCoords.name);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Filters & Radius (1km, 3km, 5km)
  const [radiusKm, setRadiusKm] = useState(3);
  const [activeFilter, setActiveFilter] = useState('all');

  // Pagination state (0-indexed page)
  const [currentPage, setCurrentPage] = useState(0);

  // Results & UI (Instant 9-card load)
  const [rawRestaurants, setRawRestaurants] = useState(() => getCuratedFallbackRestaurants(initialCoords.lat, initialCoords.lng, initialLocQuery));
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const effectiveTripId = tripId || tripRef || 'TR-998827';

  // 1. Fetch next stop from backend API (graceful background check, never crashes demo)
  const fetchNextStop = useCallback(async () => {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    if (isHttps && BACKEND_BASE.startsWith('http://localhost')) {
      const fallbackStop = deriveNextStopFromNodes(currentTripNodes, activeDestination);
      setNextStopData(fallbackStop);
      return fallbackStop;
    }

    setIsLoadingNextStop(true);
    setLocationError(null);
    try {
      if (BACKEND_BASE) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const resp = await fetch(`${BACKEND_BASE}/api/trips/${effectiveTripId}/next-stop`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          setNextStopData(data);
          return data;
        }
      }
      const fallbackStop = deriveNextStopFromNodes(currentTripNodes, activeDestination);
      setNextStopData(fallbackStop);
      return fallbackStop;
    } catch (err) {
      console.warn('[dining] Next-stop backend check skipped, using demo stop:', err);
      const fallbackStop = deriveNextStopFromNodes(currentTripNodes, activeDestination);
      setNextStopData(fallbackStop);
      return fallbackStop;
    } finally {
      setIsLoadingNextStop(false);
    }
  }, [effectiveTripId, currentTripNodes, activeDestination]);

  // 2. Resolve coordinates based on active mode
  const resolveLocationForMode = useCallback(async (mode, customQuery = null, stopOverride = null) => {
    setLocationError(null);
    setCurrentPage(0);

    try {
      if (mode === 'next_stop') {
        const stop = stopOverride || nextStopData || (await fetchNextStop());
        const queryToGeocode = stop?.destination || stop?.name || stop?.location || activeDestination || 'Goa';
        const geocoded = await searchLocation(queryToGeocode);

        if (geocoded) {
          const locName = stop?.name || geocoded.name || queryToGeocode;
          setCurrentCoords({
            lat: geocoded.lat,
            lng: geocoded.lng,
            displayName: geocoded.displayName,
            name: locName
          });
          setResolvedLocationName(locName);
          setRawRestaurants(getCuratedFallbackRestaurants(geocoded.lat, geocoded.lng, locName));
        } else {
          setLocationError("We couldn't locate your next stop. Try searching the location manually.");
        }
      } else if (mode === 'current_loc') {
        setIsLoadingLocation(true);
        try {
          const userLoc = await getUserLocation();
          setCurrentCoords({
            lat: userLoc.lat,
            lng: userLoc.lng,
            name: userLoc.name
          });
          setResolvedLocationName(userLoc.name);
          setRawRestaurants(getCuratedFallbackRestaurants(userLoc.lat, userLoc.lng, userLoc.name));
          console.log(`[dining] mode=CURRENT_LOCATION, location=${userLoc.name}`);
        } catch (geoErr) {
          console.warn('[dining] Geolocation failed:', geoErr.message);
          setLocationError('Location access unavailable. Search an area instead.');
        } finally {
          setIsLoadingLocation(false);
        }
      } else if (mode === 'search') {
        const q = customQuery || searchQuery || activeDestination;
        if (!q.trim()) {
          setLocationError('Please enter a location to search.');
          return;
        }

        setIsLoadingLocation(true);
        try {
          const geocoded = await searchLocation(q);
          if (geocoded) {
            const locName = geocoded.name || q;
            setCurrentCoords({
              lat: geocoded.lat,
              lng: geocoded.lng,
              displayName: geocoded.displayName,
              name: locName
            });
            setResolvedLocationName(locName);
            setRawRestaurants(getCuratedFallbackRestaurants(geocoded.lat, geocoded.lng, locName));
            console.log(`[dining] mode=SEARCH, location=${locName}`);
          } else {
            setLocationError(`Could not find coordinates for "${q}". Please try a nearby station, landmark, or city.`);
          }
        } finally {
          setIsLoadingLocation(false);
        }
      }
    } catch (err) {
      console.error('[dining] Location resolution error:', err);
      setLocationError('Error determining location coordinates.');
    }
  }, [nextStopData, fetchNextStop, activeDestination, searchQuery]);

  // Initial load: Background check for next stop if backend is reachable (never blocks UI)
  useEffect(() => {
    fetchNextStop().catch(() => {});
  }, [fetchNextStop]);

  // 3. Real Nearby Restaurant Query via OpenStreetMap Overpass
  useEffect(() => {
    if (!currentCoords || currentCoords.lat == null || currentCoords.lng == null) {
      return;
    }

    let isMounted = true;
    const radiusMeters = radiusKm * 1000;

    getNearbyRestaurants(currentCoords.lat, currentCoords.lng, radiusMeters, resolvedLocationName)
      .then((results) => {
        if (!isMounted) return;
        if (results && results.length > 0) {
          setRawRestaurants(results);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[dining] Overpass query fell back to curated dataset:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentCoords, radiusKm, resolvedLocationName]);

  // Handle Mode Change
  const handleModeChange = (newMode) => {
    setActiveMode(newMode);
    setCurrentPage(0);
    if (newMode === 'next_stop') {
      resolveLocationForMode('next_stop');
    } else if (newMode === 'current_loc') {
      resolveLocationForMode('current_loc');
    }
  };

  // Handle Manual Search Submit
  const handleSearchSubmit = (q) => {
    setSearchQuery(q);
    setCurrentPage(0);
    resolveLocationForMode('search', q);
  };

  // Handle Filter Change
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setCurrentPage(0);
  };

  // Handle Radius Change
  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    setCurrentPage(0);
  };

  // Filter raw restaurants
  const filteredRestaurants = rawRestaurants.filter((r) => {
    if (activeFilter === 'pure_veg') {
      return r.vegetarian === true;
    }
    if (activeFilter === 'open_now') {
      return r.openStatus?.isOpen === true;
    }
    return true;
  });

  const hasVegOption = rawRestaurants.some(r => r.vegetarian === true);
  const hasOpenNowOption = rawRestaurants.some(r => r.openStatus?.isOpen === true);

  return (
    <div className="w-full space-y-6 text-left">
      {/* Top Header / Brand Section */}
      <div className="border-b border-slate-205 pb-5 text-left">
        <span className="px-3 py-1 rounded-full bg-[#EAF3FF] text-[#287DFA] text-xs font-bold font-mono uppercase tracking-wider">
          🍽️ Transit Dining
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-2 font-serif">
          Local Dining & Bites Near You
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Real nearby eateries detected around your upcoming itinerary arrival hub or chosen location.
        </p>
      </div>

      {/* 3-Way Location Selector */}
      <DiningLocationSelector
        activeMode={activeMode}
        onModeChange={handleModeChange}
        onSearchSubmit={handleSearchSubmit}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoadingLocation={isLoadingLocation}
        locationError={locationError}
        nextStopAvailable={nextStopData?.available}
        nextStopData={nextStopData}
      />

      {/* Next Stop Hero Card */}
      {activeMode === 'next_stop' && (
        <NextStopDining
          nextStop={nextStopData}
          isLoading={isLoadingNextStop}
          onRefresh={() => fetchNextStop().then(s => resolveLocationForMode('next_stop', null, s))}
          radiusKm={radiusKm}
          resolvedLocationName={resolvedLocationName}
          onExploreFood={() => {
            const el = document.getElementById('dining-results-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Active Location Info Bar (When in My Location or Search) */}
      {activeMode !== 'next_stop' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#287DFA]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                {activeMode === 'current_loc' ? 'Current Geolocation' : 'Custom Search Target'}
              </div>
              <div className="text-base font-extrabold text-slate-900">
                {resolvedLocationName}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-semibold font-mono">
            Radius: {radiusKm} km
          </div>
        </div>
      )}

      {/* Filters & Radius Bar */}
      <div id="dining-results-section">
        <DiningFilters
          activeFilter={activeFilter}
          setActiveFilter={handleFilterChange}
          radiusKm={radiusKm}
          setRadiusKm={handleRadiusChange}
          hasVegOption={hasVegOption}
          hasOpenNowOption={hasOpenNowOption}
        />
      </div>

      {/* Paginated Results Grid (9 cards per page) */}
      <DiningResults
        restaurants={filteredRestaurants}
        locationName={resolvedLocationName}
        radiusKm={radiusKm}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isLoading={isLoadingRestaurants || isLoadingLocation}
        error={locationError}
        activeFilter={activeFilter}
        onResetFilters={() => handleFilterChange('all')}
        onSelectRestaurant={(r) => setSelectedRestaurant(r)}
      />

      {/* Comprehensive Real Metadata Detail Modal */}
      <AnimatePresence>
        {selectedRestaurant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setSelectedRestaurant(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#EAF3FF] text-[#287DFA] font-mono">
                  {selectedRestaurant.distanceKm} km from {resolvedLocationName}
                </span>
                {selectedRestaurant.vegetarian && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    🌱 Pure Veg
                  </span>
                )}
                {selectedRestaurant.vegan && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Vegan Options
                  </span>
                )}
              </div>

              {/* Visual Banner */}
              {(() => {
                const imgMeta = selectedRestaurant.resolvedImage || getRestaurantImage(selectedRestaurant);
                const isFallback = imgMeta.isFallback;
                const modalPhotoUrl = imgMeta.url;
                const modalAttribution = !isFallback && imgMeta.source
                  ? (imgMeta.source === 'wikimedia' ? 'Wikimedia Commons' : 'OpenStreetMap')
                  : null;

                return (
                  <div className="h-44 sm:h-48 w-full rounded-xl overflow-hidden mb-4 relative bg-slate-100 flex items-center justify-center border border-slate-200/80">
                    <img
                      src={modalPhotoUrl}
                      alt={selectedRestaurant.name}
                      onError={(e) => {
                        if (!e.target.dataset.failed) {
                          e.target.dataset.failed = "true";
                          e.target.src = imgMeta.fallbackUrl || '/dining/restaurant.jpg';
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                    {modalAttribution && (
                      <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 text-white font-mono text-[10px] font-medium">
                        {modalAttribution}
                      </span>
                    )}
                  </div>
                );
              })()}

              <h3 className="text-xl font-extrabold text-slate-900 font-serif mb-1">
                {selectedRestaurant.name}
              </h3>
              {selectedRestaurant.address && (
                <p className="text-xs text-slate-500 mb-4 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedRestaurant.address}</span>
                </p>
              )}

              {/* Verified OSM Details Table */}
              <div className="space-y-3 mb-6">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Category:</span>
                    <span className="font-bold text-slate-800 capitalize">{selectedRestaurant.type || 'Restaurant'}</span>
                  </div>
                  {selectedRestaurant.cuisine && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Cuisine:</span>
                      <span className="font-bold text-slate-800">{selectedRestaurant.cuisine.join(', ')}</span>
                    </div>
                  )}
                  {selectedRestaurant.openingHours && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Opening Hours:</span>
                      <span className="font-bold text-slate-800">{selectedRestaurant.openingHours}</span>
                    </div>
                  )}
                  {selectedRestaurant.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Phone:</span>
                      <a href={`tel:${selectedRestaurant.phone}`} className="font-bold text-[#287DFA] hover:underline">
                        {selectedRestaurant.phone}
                      </a>
                    </div>
                  )}
                  {selectedRestaurant.smoking && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Smoking Policy:</span>
                      <span className="font-bold text-slate-800 capitalize">{selectedRestaurant.smoking}</span>
                    </div>
                  )}
                </div>

                {/* Amenities Badges if available */}
                {(selectedRestaurant.takeaway || selectedRestaurant.delivery || selectedRestaurant.outdoorSeating || selectedRestaurant.wheelchair || selectedRestaurant.internetAccess) && (
                  <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      Verified Services & Facilities
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRestaurant.delivery === 'yes' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium">
                          <Bike className="w-3.5 h-3.5 text-blue-600" /> Delivery Available
                        </span>
                      )}
                      {selectedRestaurant.takeaway === 'yes' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium">
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Takeaway Available
                        </span>
                      )}
                      {selectedRestaurant.outdoorSeating === 'yes' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium">
                          <Sun className="w-3.5 h-3.5 text-amber-500" /> Outdoor Seating
                        </span>
                      )}
                      {selectedRestaurant.wheelchair === 'yes' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium">
                          <Accessibility className="w-3.5 h-3.5 text-indigo-600" /> Wheelchair Accessible
                        </span>
                      )}
                      {(selectedRestaurant.internetAccess === 'wlan' || selectedRestaurant.internetAccess === 'yes' || selectedRestaurant.internetAccess === 'wifi') && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium">
                          <Wifi className="w-3.5 h-3.5 text-blue-500" /> Free WiFi / WLAN
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* External Action Links */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedRestaurant.latitude},${selectedRestaurant.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-600" />
                    <span>Open in Google Maps</span>
                  </a>
                  {selectedRestaurant.osmUrl && (
                    <a
                      href={selectedRestaurant.osmUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>OSM Data</span>
                    </a>
                  )}
                  {selectedRestaurant.website && (
                    <a
                      href={selectedRestaurant.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#EAF3FF] hover:bg-[#d5e7ff] text-[#287DFA] text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRestaurant(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
