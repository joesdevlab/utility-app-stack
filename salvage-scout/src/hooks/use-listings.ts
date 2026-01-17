"use client";

import { useState, useEffect, useCallback } from "react";
import type { Material } from "@/types";
import { calculateDistance } from "./use-location";

const STORAGE_KEY = "salvage-scout-listings";

// Demo listings for testing
const DEMO_LISTINGS: Material[] = [
  {
    id: "demo-1",
    title: "Leftover Pine Framing Timber",
    description: "About 15 lengths of 90x45mm pine framing timber, 2.4m long. Left over from garage build. Some minor marks but structurally sound.",
    category: "timber",
    condition: "good",
    quantity: "~15 lengths",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop",
    location: { latitude: -36.878, longitude: 174.764, suburb: "Mt Eden" },
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: "message",
    status: "available",
  },
  {
    id: "demo-2",
    title: "Double Glazed Window Unit",
    description: "1200x900mm double glazed aluminum window, removed during renovation. Glass is perfect, frame has minor scratches.",
    category: "windows",
    condition: "good",
    quantity: "1 unit",
    imageUrl: "https://images.unsplash.com/photo-1558618047-8b8e2cc66e75?w=800&h=450&fit=crop",
    location: { latitude: -36.853, longitude: 174.743, suburb: "Ponsonby" },
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: "call",
    status: "available",
  },
  {
    id: "demo-3",
    title: "Concrete Pavers - Grey",
    description: "Approx 50 square pavers, 400x400mm, grey color. Lifted from old patio. Good condition, some have moss which can be pressure washed off.",
    category: "landscaping",
    condition: "fair",
    quantity: "~50 pavers",
    imageUrl: "https://images.unsplash.com/photo-1558618140-514a16c5b5e3?w=800&h=450&fit=crop",
    location: { latitude: -36.890, longitude: 174.718, suburb: "Mt Albert" },
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: "message",
    status: "available",
  },
  {
    id: "demo-4",
    title: "Interior Door with Handle",
    description: "Standard hollow core interior door, white painted, 1980x810mm. Includes handle and hinges. Perfect working condition.",
    category: "doors",
    condition: "good",
    quantity: "1 door",
    imageUrl: "https://images.unsplash.com/photo-1558618044-c67d43c4c8a3?w=800&h=450&fit=crop",
    location: { latitude: -36.870, longitude: 174.778, suburb: "Newmarket" },
    postedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: "message",
    status: "available",
  },
  {
    id: "demo-5",
    title: "Pink Batts Insulation Offcuts",
    description: "Various offcuts from ceiling insulation job. R3.2 rating. Enough to do a small room or patch job. Must take all.",
    category: "insulation",
    condition: "new",
    quantity: "~5 sqm total",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=450&fit=crop",
    location: { latitude: -36.874, longitude: 174.802, suburb: "Remuera" },
    postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: "call",
    status: "available",
  },
];

interface UseListingsReturn {
  listings: Material[];
  isLoading: boolean;
  addListing: (listing: Material) => void;
  removeListing: (id: string) => void;
  refreshListings: () => void;
}

export function useListings(
  userLocation?: { latitude: number; longitude: number } | null
): UseListingsReturn {
  const [listings, setListings] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadListings = useCallback(() => {
    setIsLoading(true);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let allListings = stored ? JSON.parse(stored) : [];

      // Add demo listings if no stored listings
      if (allListings.length === 0) {
        allListings = DEMO_LISTINGS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allListings));
      }

      // Filter out expired listings
      const now = new Date();
      allListings = allListings.filter(
        (listing: Material) => new Date(listing.expiresAt) > now
      );

      // Calculate distances if user location is available
      if (userLocation) {
        allListings = allListings.map((listing: Material) => ({
          ...listing,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            listing.location.latitude,
            listing.location.longitude
          ),
        }));

        // Sort by distance
        allListings.sort((a: Material, b: Material) =>
          (a.distance ?? Infinity) - (b.distance ?? Infinity)
        );
      } else {
        // Sort by posted time (newest first)
        allListings.sort(
          (a: Material, b: Material) =>
            new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
        );
      }

      setListings(allListings);
    } catch (error) {
      console.error("Failed to load listings:", error);
      setListings(DEMO_LISTINGS);
    }

    setIsLoading(false);
  }, [userLocation]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const addListing = useCallback((listing: Material) => {
    setListings((prev) => {
      const updated = [listing, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeListing = useCallback((id: string) => {
    setListings((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    listings,
    isLoading,
    addListing,
    removeListing,
    refreshListings: loadListings,
  };
}
