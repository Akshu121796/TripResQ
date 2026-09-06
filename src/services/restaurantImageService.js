/**
 * Free Hybrid Restaurant Image Service for TripResQ
 *
 * Resolves restaurant imagery without any paid APIs (Google Places/Yelp/Foursquare):
 * Priority:
 * 1. OpenStreetMap `image` tag (direct URL or File: format)
 * 2. `wikimedia_commons` tag (resolved to canonical Wikimedia Commons FilePath)
 * 3. Local high-quality cuisine-based fallback asset stored in /dining/<category>.jpg
 */

/**
 * Normalizes cuisine, amenity, and name strings to match 9 core cuisine categories.
 * @param {Object} restaurant
 * @returns {'indian'|'south-indian'|'chinese'|'pizza'|'cafe'|'bakery'|'fast-food'|'vegetarian'|'restaurant'}
 */
export function detectCuisineCategory(restaurant = {}) {
  const { cuisine, type, amenity, name } = restaurant;

  // Flatten and normalize all text tokens
  const tokens = [];

  if (Array.isArray(cuisine)) {
    tokens.push(...cuisine);
  } else if (typeof cuisine === 'string') {
    tokens.push(...cuisine.split(/[;,|/]/));
  }

  if (type) tokens.push(type);
  if (amenity) tokens.push(amenity);
  if (name) tokens.push(name);

  const combined = tokens.join(' ').toLowerCase().replace(/_/g, ' ');

  // 1. South Indian (specialized before generic Indian)
  if (
    combined.includes('south indian') ||
    combined.includes('south_indian') ||
    combined.includes('dosa') ||
    combined.includes('idli') ||
    combined.includes('udupi') ||
    combined.includes('kerala') ||
    combined.includes('tamil') ||
    combined.includes('chettinad') ||
    combined.includes('andhra')
  ) {
    return 'south-indian';
  }

  // 2. Pizza / Italian
  if (
    combined.includes('pizza') ||
    combined.includes('italian') ||
    combined.includes('pasta') ||
    combined.includes('pizzeria')
  ) {
    return 'pizza';
  }

  // 3. Chinese & Asian
  if (
    combined.includes('chinese') ||
    combined.includes('asian') ||
    combined.includes('dim sum') ||
    combined.includes('noodles') ||
    combined.includes('noodle') ||
    combined.includes('wok') ||
    combined.includes('thai') ||
    combined.includes('momos') ||
    combined.includes('momo')
  ) {
    return 'chinese';
  }

  // 4. Cafe & Coffee
  if (
    combined.includes('cafe') ||
    combined.includes('café') ||
    combined.includes('coffee') ||
    combined.includes('tea') ||
    combined.includes('chai') ||
    combined.includes('espresso') ||
    combined.includes('brew')
  ) {
    return 'cafe';
  }

  // 5. Bakery & Desserts
  if (
    combined.includes('bakery') ||
    combined.includes('pastry') ||
    combined.includes('pastries') ||
    combined.includes('cake') ||
    combined.includes('bread') ||
    combined.includes('dessert') ||
    combined.includes('bakes')
  ) {
    return 'bakery';
  }

  // 6. Fast Food & Quick Bites
  if (
    combined.includes('fast food') ||
    combined.includes('fast_food') ||
    combined.includes('burger') ||
    combined.includes('sandwich') ||
    combined.includes('street food') ||
    combined.includes('chaat') ||
    combined.includes('rolls') ||
    combined.includes('shawarma') ||
    combined.includes('kiosk') ||
    combined.includes('pav bhaji') ||
    combined.includes('vada pav')
  ) {
    return 'fast-food';
  }

  // 7. Pure Vegetarian / Vegan
  if (
    restaurant.vegetarian === true ||
    combined.includes('pure veg') ||
    combined.includes('pure_veg') ||
    combined.includes('vegetarian') ||
    combined.includes('vegan') ||
    combined.includes('jain') ||
    combined.includes('shakahari')
  ) {
    return 'vegetarian';
  }

  // 8. General Indian / Regional Cuisines
  if (
    combined.includes('indian') ||
    combined.includes('north indian') ||
    combined.includes('north_indian') ||
    combined.includes('mughlai') ||
    combined.includes('punjabi') ||
    combined.includes('maharashtrian') ||
    combined.includes('biryani') ||
    combined.includes('thali') ||
    combined.includes('tandoor') ||
    combined.includes('dhaba') ||
    combined.includes('bhojanalaya') ||
    combined.includes('curry') ||
    combined.includes('bengali') ||
    combined.includes('gujarati') ||
    combined.includes('rajasthani')
  ) {
    return 'indian';
  }

  // 9. Default Generic Restaurant
  return 'restaurant';
}

/**
 * Multi-variant local fallback images by category.
 */
export const CUISINE_FALLBACK_IMAGES = {
  'bakery': [
    '/dining/bakery.jpg',
    '/dining/bakery-2.jpg',
    '/dining/bakery-3.jpg'
  ],
  'cafe': [
    '/dining/cafe.jpg',
    '/dining/cafe-2.jpg',
    '/dining/cafe-3.jpg'
  ],
  'chinese': [
    '/dining/chinese.jpg',
    '/dining/chinese-2.jpg',
    '/dining/chinese-3.jpg'
  ],
  'fast-food': [
    '/dining/fast-food.jpg',
    '/dining/fast-food-2.jpg',
    '/dining/fast-food-3.jpg'
  ],
  'indian': [
    '/dining/indian.jpg',
    '/dining/indian-2.jpg',
    '/dining/indian-3.jpg'
  ],
  'pizza': [
    '/dining/pizza.jpg',
    '/dining/pizza-1.jpg',
    '/dining/pizza-2.jpg',
    '/dining/pizza-3.jpg'
  ],
  'restaurant': [
    '/dining/restaurant.jpg',
    '/dining/restaurant-2.jpg',
    '/dining/restaurant-3.jpg'
  ],
  'south-indian': [
    '/dining/south-indian.jpg',
    '/dining/south-indian-2.jpg',
    '/dining/south-indian-3.jpg'
  ],
  'vegetarian': [
    '/dining/vegetarian.jpg',
    '/dining/vegetarian-2.jpg',
    '/dining/vegetarian-3.jpg'
  ]
};

/**
 * Returns the local fallback image URL for a given cuisine category and rotation index/seed.
 * @param {string} cuisineCategory
 * @param {number|string} [indexOrSeed=0]
 * @returns {string}
 */
export function getCuisineFallbackImage(cuisineCategory, indexOrSeed = 0) {
  const category = cuisineCategory || 'restaurant';
  const images = CUISINE_FALLBACK_IMAGES[category] || CUISINE_FALLBACK_IMAGES['restaurant'];

  let idx = 0;
  if (typeof indexOrSeed === 'number' && !isNaN(indexOrSeed)) {
    idx = Math.abs(Math.floor(indexOrSeed)) % images.length;
  } else if (typeof indexOrSeed === 'string' && indexOrSeed.length > 0) {
    let hash = 0;
    for (let i = 0; i < indexOrSeed.length; i++) {
      hash = (hash * 31 + indexOrSeed.charCodeAt(i)) & 0x7fffffff;
    }
    idx = hash % images.length;
  }

  return images[idx];
}

/**
 * Clean and format a Wikimedia Commons filename into a Special:FilePath URL.
 * @param {string} rawFileName
 * @returns {string|null}
 */
export function formatWikimediaCommonsUrl(rawFileName) {
  if (!rawFileName || typeof rawFileName !== 'string') return null;

  let clean = rawFileName.trim();
  if (clean.startsWith('File:') || clean.startsWith('Image:') || clean.startsWith('file:') || clean.startsWith('image:')) {
    clean = clean.replace(/^(File|Image):/i, '').trim();
  }

  if (clean.startsWith('Category:') || clean.length === 0) {
    return null;
  }

  // If already a full HTTP URL, return as-is
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(clean)}?width=640`;
}

/**
 * Resolves the final image for a restaurant with strict priority:
 * 1. OSM `image` tag (direct URL or File: prefix)
 * 2. `wikimedia_commons` tag
 * 3. Local cuisine fallback asset (rotating across available category variants)
 *
 * @param {Object} restaurant
 * @param {number|string} [occurrenceIndex]
 * @returns {{url: string, source: 'osm'|'wikimedia'|'fallback', isFallback: boolean, attribution?: string, cuisineCategory: string, fallbackUrl: string}}
 */
export function getRestaurantImage(restaurant = {}, occurrenceIndex) {
  const cuisineCategory = detectCuisineCategory(restaurant);

  // Determine rotation index / seed for fallback image
  let fallbackSeed = occurrenceIndex;
  if (fallbackSeed === undefined || fallbackSeed === null) {
    if (restaurant.fallbackIndex !== undefined) {
      fallbackSeed = restaurant.fallbackIndex;
    } else if (restaurant.categoryIndex !== undefined) {
      fallbackSeed = restaurant.categoryIndex;
    } else if (typeof restaurant.index === 'number') {
      fallbackSeed = restaurant.index - 1;
    } else {
      fallbackSeed = restaurant.id || restaurant.name || 0;
    }
  }

  const fallbackUrl = getCuisineFallbackImage(cuisineCategory, fallbackSeed);

  // 0. Explicit local image asset (e.g., bundled fallback dataset with /dining/ paths)
  const explicitImage = restaurant.imageUrl || restaurant.image;
  if (explicitImage && typeof explicitImage === 'string') {
    const trimmed = explicitImage.trim();
    if (trimmed.startsWith('/')) {
      return {
        url: trimmed,
        source: 'local',
        isFallback: true,
        attribution: restaurant.imageAttribution || 'TripResQ Curated',
        cuisineCategory,
        fallbackUrl: trimmed
      };
    }
  }

  // 1. First priority: OSM direct `image` tag
  const rawImage = restaurant.rawImage || restaurant.image;
  if (rawImage && typeof rawImage === 'string') {
    const trimmed = rawImage.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return {
        url: trimmed,
        source: 'osm',
        isFallback: false,
        attribution: 'Image source: OpenStreetMap tag',
        cuisineCategory,
        fallbackUrl
      };
    }
    if (trimmed.startsWith('File:') || trimmed.startsWith('Image:')) {
      const wikiUrl = formatWikimediaCommonsUrl(trimmed);
      if (wikiUrl) {
        return {
          url: wikiUrl,
          source: 'wikimedia',
          isFallback: false,
          attribution: 'Image source: Wikimedia Commons',
          cuisineCategory,
          fallbackUrl
        };
      }
    }
  }

  // 2. Second priority: OSM `wikimedia_commons` tag
  const rawWiki = restaurant.wikimediaCommons || restaurant.wikimedia_commons;
  if (rawWiki && typeof rawWiki === 'string') {
    const wikiUrl = formatWikimediaCommonsUrl(rawWiki);
    if (wikiUrl) {
      return {
        url: wikiUrl,
        source: 'wikimedia',
        isFallback: false,
        attribution: 'Image source: Wikimedia Commons',
        cuisineCategory,
        fallbackUrl
      };
    }
  }

  // 3. Third priority: Local cuisine fallback image
  return {
    url: fallbackUrl,
    source: 'fallback',
    isFallback: true,
    attribution: 'Representative cuisine image',
    cuisineCategory,
    fallbackUrl
  };
}
