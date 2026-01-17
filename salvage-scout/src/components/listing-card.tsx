"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Phone, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Material, MaterialCategory, MaterialCondition } from "@/types";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/types";

interface ListingCardProps {
  material: Material;
  delay?: number;
}

const categoryColors: Record<MaterialCategory, string> = {
  timber: "bg-amber-500",
  roofing: "bg-slate-500",
  windows: "bg-sky-500",
  doors: "bg-orange-500",
  plumbing: "bg-blue-500",
  electrical: "bg-yellow-500",
  concrete: "bg-stone-500",
  insulation: "bg-pink-500",
  flooring: "bg-emerald-500",
  fixtures: "bg-violet-500",
  landscaping: "bg-green-500",
  other: "bg-gray-500",
};

const conditionColors: Record<MaterialCondition, string> = {
  new: "bg-emerald-500",
  good: "bg-blue-500",
  fair: "bg-amber-500",
  salvage: "bg-red-500",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

export function ListingCard({ material, delay = 0 }: ListingCardProps) {
  const handleContact = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(30);
    }
    // In a real app, this would open messaging or phone
    alert(`Contact method: ${material.contactMethod}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="overflow-hidden p-0 gap-0">
        {/* Image */}
        <div className="relative">
          <img
            src={material.imageUrl}
            alt={material.title}
            className="listing-image w-full"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 image-gradient" />

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`${categoryColors[material.category]} text-white border-0`}>
              {CATEGORY_LABELS[material.category]}
            </Badge>
            <Badge className={`${conditionColors[material.condition]} text-white border-0`}>
              {CONDITION_LABELS[material.condition]}
            </Badge>
          </div>

          {/* Distance on image */}
          {material.distance !== undefined && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm">
              <MapPin className="h-4 w-4" />
              <span>{material.distance < 1 ? `${Math.round(material.distance * 1000)}m` : `${material.distance.toFixed(1)}km`}</span>
            </div>
          )}

          {/* Time posted */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-sm">
            <Clock className="h-4 w-4" />
            <span>{formatTimeAgo(material.postedAt)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{material.title}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {material.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{material.location.suburb}</span>
            </div>

            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600"
              onClick={handleContact}
            >
              {material.contactMethod === "call" ? (
                <>
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Qty: {material.quantity}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

// Empty state card
export function EmptyListingCard() {
  return (
    <Card className="p-8 text-center">
      <div className="text-muted-foreground">
        <p className="mb-2">No materials listed nearby yet.</p>
        <p className="text-sm">Be the first to share!</p>
      </div>
    </Card>
  );
}
