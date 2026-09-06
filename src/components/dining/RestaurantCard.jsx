import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ChevronRight, Bike, ShoppingBag, Sun, Accessibility, Wifi, Image as ImageIcon } from 'lucide-react';
import { getRestaurantImage } from '../../services/restaurantImageService';

export default function RestaurantCard({
  restaurant,
  index,
  categoryIndex,
  onSelect
}) {
  const fallbackIndex = categoryIndex ?? (typeof index === 'number' ? index - 1 : 0);
  const imageMeta = getRestaurantImage(restaurant, fallbackIndex);

  const [currentImgSrc, setCurrentImgSrc] = useState(imageMeta.url);
  const [isFallbackActive, setIsFallbackActive] = useState(imageMeta.isFallback);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Sync if restaurant props change
  useEffect(() => {
    const updated = getRestaurantImage(restaurant, fallbackIndex);
    setCurrentImgSrc(updated.url);
    setIsFallbackActive(updated.isFallback);
    setImageLoaded(false);
  }, [restaurant, fallbackIndex]);

  const {
    name,
    cuisine,
    type,
    distanceKm,
    address,
    openingHours,
    openStatus,
    vegetarian,
    vegan,
    takeaway,
    delivery,
    outdoorSeating,
    wheelchair,
    internetAccess
  } = restaurant;

  const handleImageError = () => {
    if (currentImgSrc !== imageMeta.fallbackUrl && imageMeta.fallbackUrl) {
      setCurrentImgSrc(imageMeta.fallbackUrl);
    } else if (currentImgSrc !== '/dining/restaurant.jpg') {
      setCurrentImgSrc('/dining/restaurant.jpg');
    }
  };

  const renderTypeLabel = () => {
    switch (type) {
      case 'cafe': return 'Café';
      case 'fast_food': return 'Fast Food';
      default: return 'Restaurant';
    }
  };

  const renderOpenStatusBadge = () => {
    if (openStatus?.isOpen === true) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{openStatus.statusText}</span>
        </span>
      );
    }

    if (openStatus?.isOpen === false) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
          <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>{openStatus.statusText}</span>
        </span>
      );
    }

    if (openingHours) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="line-clamp-1">{openingHours}</span>
        </span>
      );
    }

    return (
      <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Opening hours unavailable</span>
      </span>
    );
  };

  return (
    <div
      className="bg-white border border-slate-200/90 hover:border-[#287DFA]/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between text-left group h-full"
      id={`restaurant-card-${restaurant.id}`}
    >
      <div>
        {/* Visual Media Header */}
        <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-slate-100 flex items-center justify-center">
          <img
            src={currentImgSrc}
            alt={name}
            loading="eager"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />

          {/* Overlaid Source Attribution Badge (only when real OSM or Wikimedia source) */}
          {!isFallbackActive && imageMeta.source && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono font-medium">
              {imageMeta.source === 'wikimedia' ? 'Wikimedia Commons' : 'OpenStreetMap'}
            </span>
          )}

          {/* Overlaid Distance Badge */}
          {distanceKm != null && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200/80 text-[#287DFA] text-xs font-extrabold font-mono shadow-xs">
              {distanceKm} km
            </div>
          )}

          {/* Overlaid Rank Index */}
          {index != null && (
            <div className="absolute top-3 left-3 w-6 h-6 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold font-mono flex items-center justify-center shadow-xs">
              {index}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Title and Category */}
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#287DFA] transition-colors font-serif leading-snug line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 line-clamp-1 font-medium">
              <span className="font-bold text-slate-600">{renderTypeLabel()}</span>
              {cuisine && cuisine.length > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="line-clamp-1">{cuisine.join(', ')}</span>
                </>
              )}
            </div>
          </div>

          {/* Real Address Line (rendered only if available) */}
          {address && (
            <p className="text-xs text-slate-500 flex items-start gap-1.5 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{address}</span>
            </p>
          )}

          {/* Opening Hours Line */}
          <div className="pt-0.5">
            {renderOpenStatusBadge()}
          </div>

          {/* Verified OSM Tags (Veg, Vegan, Delivery, Takeaway, Wheelchair, WiFi) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {vegetarian && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 uppercase tracking-wide">
                🌱 Pure Veg
              </span>
            )}
            {vegan && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 uppercase tracking-wide">
                Vegan
              </span>
            )}
            {delivery === 'yes' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                <Bike className="w-3 h-3 text-slate-500" /> Delivery
              </span>
            )}
            {takeaway === 'yes' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                <ShoppingBag className="w-3 h-3 text-slate-500" /> Takeaway
              </span>
            )}
            {outdoorSeating === 'yes' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                <Sun className="w-3 h-3 text-slate-500" /> Outdoor
              </span>
            )}
            {wheelchair === 'yes' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                <Accessibility className="w-3 h-3 text-slate-500" /> Accessible
              </span>
            )}
            {(internetAccess === 'wlan' || internetAccess === 'yes' || internetAccess === 'wifi') && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                <Wifi className="w-3 h-3 text-slate-500" /> WiFi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: View Details CTA */}
      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-end mt-auto">
        <button
          type="button"
          onClick={() => onSelect && onSelect({ ...restaurant, resolvedImage: { url: currentImgSrc, isFallback: isFallbackActive, attribution: imageMeta.attribution, source: imageMeta.source } })}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-[#EAF3FF] hover:bg-[#287DFA] text-[#287DFA] hover:text-white text-xs font-bold transition-all duration-150 cursor-pointer"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
