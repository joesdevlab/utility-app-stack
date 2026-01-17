"use client";

import { useState, useCallback } from "react";

interface Location {
  latitude: number;
  longitude: number;
  suburb: string;
}

interface UseLocationReturn {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
  getLocation: () => Promise<Location | null>;
}

// Map of NZ suburbs/areas by approximate coordinates
// In a real app, you'd use a geocoding service
const NZ_SUBURBS = [
  { name: "Auckland CBD", lat: -36.848, lng: 174.763 },
  { name: "Ponsonby", lat: -36.853, lng: 174.743 },
  { name: "Grey Lynn", lat: -36.859, lng: 174.734 },
  { name: "Mt Eden", lat: -36.878, lng: 174.764 },
  { name: "Newmarket", lat: -36.870, lng: 174.778 },
  { name: "Parnell", lat: -36.855, lng: 174.783 },
  { name: "Remuera", lat: -36.874, lng: 174.802 },
  { name: "Epsom", lat: -36.891, lng: 174.773 },
  { name: "Mt Albert", lat: -36.890, lng: 174.718 },
  { name: "Sandringham", lat: -36.889, lng: 174.741 },
  { name: "Kingsland", lat: -36.874, lng: 174.749 },
  { name: "Henderson", lat: -36.878, lng: 174.632 },
  { name: "New Lynn", lat: -36.906, lng: 174.686 },
  { name: "Manukau", lat: -36.993, lng: 174.879 },
  { name: "Takapuna", lat: -36.787, lng: 174.770 },
  { name: "Devonport", lat: -36.831, lng: 174.795 },
  { name: "Wellington CBD", lat: -41.286, lng: 174.776 },
  { name: "Christchurch CBD", lat: -43.532, lng: 172.637 },
  { name: "Hamilton CBD", lat: -37.787, lng: 175.279 },
  { name: "Tauranga CBD", lat: -37.687, lng: 176.167 },
];

function findNearestSuburb(lat: number, lng: number): string {
  let nearest = NZ_SUBURBS[0];
  let minDistance = Infinity;

  for (const suburb of NZ_SUBURBS) {
    const distance = Math.sqrt(
      Math.pow(lat - suburb.lat, 2) + Math.pow(lng - suburb.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = suburb;
    }
  }

  // If too far from known suburbs, return generic location
  if (minDistance > 0.5) {
    return "New Zealand";
  }

  return nearest.name;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = useCallback(async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const suburb = findNearestSuburb(latitude, longitude);

          const loc: Location = {
            latitude,
            longitude,
            suburb,
          };

          setLocation(loc);
          setIsLoading(false);
          resolve(loc);
        },
        (err) => {
          let errorMessage = "Unable to get your location";

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }

          setError(errorMessage);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  return { location, error, isLoading, getLocation };
}

// Calculate distance between two points in km
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
