"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Material, MaterialCategory, MaterialCondition } from "@/types";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/types";

interface ListingEditSheetProps {
  listing: Material | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Material>) => Promise<Material | null>;
}

export function ListingEditSheet({
  listing,
  open,
  onOpenChange,
  onSave,
}: ListingEditSheetProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MaterialCategory>("other");
  const [condition, setCondition] = useState<MaterialCondition>("good");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description);
      setCategory(listing.category);
      setCondition(listing.condition);
      setQuantity(listing.quantity);
    }
  }, [listing]);

  const handleSave = async () => {
    if (!listing?.id) return;

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSave(listing.id, {
        title,
        description,
        category,
        condition,
        quantity,
      });

      if (result) {
        toast.success("Listing updated");
        onOpenChange(false);
      } else {
        toast.error("Failed to update listing");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Listing</SheetTitle>
          <SheetDescription>
            Update the details of your listing
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4 px-4 overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What are you giving away?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the materials..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              placeholder="e.g., 20 pieces, 5 sheets"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label id="category-label">Category</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="category-label">
              {(Object.keys(CATEGORY_LABELS) as MaterialCategory[]).map((cat) => (
                <Badge
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  className={`cursor-pointer ${category === cat ? "bg-amber-500" : ""}`}
                  onClick={() => setCategory(cat)}
                  onKeyDown={(e) => e.key === "Enter" || e.key === " " ? setCategory(cat) : null}
                  tabIndex={0}
                  role="button"
                  aria-pressed={category === cat}
                >
                  {CATEGORY_LABELS[cat]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label id="condition-label">Condition</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="condition-label">
              {(Object.keys(CONDITION_LABELS) as MaterialCondition[]).map((cond) => (
                <Badge
                  key={cond}
                  variant={condition === cond ? "default" : "outline"}
                  className={`cursor-pointer ${condition === cond ? "bg-amber-500" : ""}`}
                  onClick={() => setCondition(cond)}
                  onKeyDown={(e) => e.key === "Enter" || e.key === " " ? setCondition(cond) : null}
                  tabIndex={0}
                  role="button"
                  aria-pressed={condition === cond}
                >
                  {CONDITION_LABELS[cond]}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
