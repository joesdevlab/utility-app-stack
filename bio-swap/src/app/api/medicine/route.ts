import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Medicine, MedicineComparison } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barcode = searchParams.get("barcode");

  const supabase = await createClient();

  // If no barcode, return all medicines (for demo purposes)
  if (!barcode) {
    const { data: medicines, error } = await supabase
      .from("medicines")
      .select("*")
      .order("name")
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: "Failed to load medicines" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      medicines: mapDbToMedicines(medicines || []),
    });
  }

  // Look up the scanned medicine by barcode
  const { data: scannedMedicine, error: scanError } = await supabase
    .from("medicines")
    .select("*")
    .eq("barcode", barcode)
    .single();

  if (scanError || !scannedMedicine) {
    return NextResponse.json(
      { error: "Medicine not found. Try one of our demo barcodes." },
      { status: 404 }
    );
  }

  // Find alternatives with same active ingredient and strength
  const { data: alternatives, error: altError } = await supabase
    .from("medicines")
    .select("*")
    .eq("active_ingredient", scannedMedicine.active_ingredient)
    .eq("strength", scannedMedicine.strength)
    .neq("id", scannedMedicine.id)
    .order("price", { ascending: true });

  if (altError) {
    return NextResponse.json(
      { error: "Failed to find alternatives" },
      { status: 500 }
    );
  }

  const mappedScanned = mapDbToMedicine(scannedMedicine);
  const mappedAlternatives = mapDbToMedicines(alternatives || []);

  // Calculate potential savings
  const cheapestPrice = mappedAlternatives.length > 0
    ? Math.min(...mappedAlternatives.map(m => m.price))
    : mappedScanned.price;

  const savings = Math.max(0, mappedScanned.price - cheapestPrice);

  // Check if any alternative is subsidized
  const subsidyAvailable = mappedAlternatives.some((m) => m.isSubsidized);

  const comparison: MedicineComparison = {
    scanned: mappedScanned,
    alternatives: mappedAlternatives,
    savings,
    subsidyAvailable,
  };

  return NextResponse.json(comparison);
}

// Map database row to Medicine type
interface DbMedicine {
  id: string;
  barcode: string;
  name: string;
  brand_name: string;
  generic_name: string;
  active_ingredient: string;
  strength: string;
  form: string;
  pack_size: number;
  price: number;
  is_generic: boolean;
  is_subsidized: boolean;
  subsidy_price: number | null;
  manufacturer: string | null;
  image_url: string | null;
}

function mapDbToMedicine(row: DbMedicine): Medicine {
  return {
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
  };
}

function mapDbToMedicines(rows: DbMedicine[]): Medicine[] {
  return rows.map(mapDbToMedicine);
}
