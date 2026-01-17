import { NextRequest, NextResponse } from "next/server";
import {
  findMedicineByBarcode,
  findAlternatives,
  medicineDatabase,
} from "@/lib/medicine-data";
import type { MedicineComparison } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barcode = searchParams.get("barcode");

  // If no barcode, return demo data
  if (!barcode) {
    return NextResponse.json({
      medicines: medicineDatabase,
    });
  }

  // Look up the scanned medicine
  const scannedMedicine = findMedicineByBarcode(barcode);

  if (!scannedMedicine) {
    return NextResponse.json(
      { error: "Medicine not found. Try one of our demo barcodes." },
      { status: 404 }
    );
  }

  // Find alternatives
  const alternatives = findAlternatives(scannedMedicine);

  // Calculate potential savings
  const cheapestAlternative = alternatives.reduce(
    (cheapest, current) =>
      current.price < cheapest.price ? current : cheapest,
    scannedMedicine
  );

  const savings = Math.max(0, scannedMedicine.price - cheapestAlternative.price);

  // Check if any alternative is subsidized
  const subsidyAvailable = alternatives.some((m) => m.isSubsidized);

  const comparison: MedicineComparison = {
    scanned: scannedMedicine,
    alternatives: alternatives.sort((a, b) => a.price - b.price),
    savings,
    subsidyAvailable,
  };

  return NextResponse.json(comparison);
}
