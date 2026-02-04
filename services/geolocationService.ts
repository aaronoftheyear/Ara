/**
 * Geolocation Service
 * Detects user's country from IP address
 */

export interface UserLocation {
  country: string;
  countryCode: string;
  city?: string;
}

/**
 * Get user's location from IP address
 * Uses free ipapi.co service (no API key required for basic usage)
 */
export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    console.log("🌍 Detecting user location...");
    
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      console.warn("⚠️ Geolocation API failed, using default (US)");
      return {
        country: 'United States',
        countryCode: 'US'
      };
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.warn("⚠️ Geolocation error:", data.reason);
      return {
        country: 'United States',
        countryCode: 'US'
      };
    }
    
    console.log(`✅ User location detected: ${data.country_name} (${data.country_code})`);
    
    return {
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city
    };
  } catch (error) {
    console.error("❌ Geolocation error:", error);
    // Return default US location on error
    return {
      country: 'United States',
      countryCode: 'US'
    };
  }
}

/**
 * Get cached user location from localStorage
 */
export function getCachedLocation(): UserLocation | null {
  try {
    const cached = localStorage.getItem('user_location');
    if (cached) {
      const location = JSON.parse(cached);
      // Cache expires after 24 hours
      const cacheTime = localStorage.getItem('user_location_time');
      if (cacheTime && Date.now() - parseInt(cacheTime) < 24 * 60 * 60 * 1000) {
        console.log("📦 Using cached location:", location);
        return location;
      }
    }
  } catch (error) {
    console.error("❌ Error reading cached location:", error);
  }
  return null;
}

/**
 * Cache user location to localStorage
 */
export function cacheLocation(location: UserLocation): void {
  try {
    localStorage.setItem('user_location', JSON.stringify(location));
    localStorage.setItem('user_location_time', Date.now().toString());
    console.log("💾 Cached location:", location);
  } catch (error) {
    console.error("❌ Error caching location:", error);
  }
}

/**
 * Get user's location (cached or fresh)
 */
export async function getUserLocationCached(): Promise<UserLocation> {
  // Try cache first
  const cached = getCachedLocation();
  if (cached) {
    return cached;
  }
  
  // Fetch fresh location
  const location = await getUserLocation();
  
  if (location) {
    cacheLocation(location);
    return location;
  }
  
  // Default fallback
  return {
    country: 'United States',
    countryCode: 'US'
  };
}

