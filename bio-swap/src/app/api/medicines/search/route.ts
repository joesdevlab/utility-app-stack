import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Medicine } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Search query must be at least 2 characters" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Search by name, brand name, generic name, or active ingredient
  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .or(`name.ilike.%${query}%,brand_name.ilike.%${query}%,generic_name.ilike.%${query}%,active_ingredient.ilike.%${query}%`)
    .order("name")
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }

  const medicines: Medicine[] = (data || []).map((row) => ({
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    brandName: row.brand_name,
    genericName: row.generic_name,
    activeIngredient: row.active_ingredient,
    strength: row.strength,
    form: row.form,
    packSize: row.pack_size,
    price: Number(row.price),
    isGeneric: row.is_generic,
    isSubsidized: row.is_subsidized,
    subsidyPrice: row.subsidy_price ? Number(row.subsidy_price) : null,
    manufacturer: row.manufacturer || "",
    imageUrl: row.image_url || undefined,
  }));

  return NextResponse.json({ medicines });
}
