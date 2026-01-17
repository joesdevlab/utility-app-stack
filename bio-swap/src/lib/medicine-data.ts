import type { Medicine } from "@/types";

// Mock medicine database - based on common NZ pharmacy products
// In production, this would come from NZULM (NZ Universal List of Medicines)
export const medicineDatabase: Medicine[] = [
  // Pain Relief - Ibuprofen
  {
    id: "1",
    barcode: "9415991234567",
    name: "Nurofen 200mg Tablets",
    brandName: "Nurofen",
    genericName: "Ibuprofen",
    activeIngredient: "Ibuprofen",
    strength: "200mg",
    form: "Tablet",
    packSize: 24,
    price: 12.99,
    isGeneric: false,
    isSubsidized: false,
    subsidyPrice: null,
    manufacturer: "Reckitt Benckiser",
  },
  {
    id: "2",
    barcode: "9415992345678",
    name: "Ibuprofen 200mg Tablets",
    brandName: "Pharmacy Health",
    genericName: "Ibuprofen",
    activeIngredient: "Ibuprofen",
    strength: "200mg",
    form: "Tablet",
    packSize: 24,
    price: 3.99,
    isGeneric: true,
    isSubsidized: true,
    subsidyPrice: 5.0,
    manufacturer: "AFT Pharmaceuticals",
  },
  {
    id: "3",
    barcode: "9415993456789",
    name: "Nurofen Plus",
    brandName: "Nurofen",
    genericName: "Ibuprofen + Codeine",
    activeIngredient: "Ibuprofen 200mg, Codeine 12.8mg",
    strength: "200mg/12.8mg",
    form: "Tablet",
    packSize: 24,
    price: 18.99,
    isGeneric: false,
    isSubsidized: false,
    subsidyPrice: null,
    manufacturer: "Reckitt Benckiser",
  },

  // Pain Relief - Paracetamol
  {
    id: "4",
    barcode: "9415994567890",
    name: "Panadol 500mg Tablets",
    brandName: "Panadol",
    genericName: "Paracetamol",
    activeIngredient: "Paracetamol",
    strength: "500mg",
    form: "Tablet",
    packSize: 20,
    price: 8.99,
    isGeneric: false,
    isSubsidized: false,
    subsidyPrice: null,
    manufacturer: "GlaxoSmithKline",
  },
  {
    id: "5",
    barcode: "9415995678901",
    name: "Paracetamol 500mg Tablets",
    brandName: "Pharmacy Choice",
    genericName: "Paracetamol",
    activeIngredient: "Paracetamol",
    strength: "500mg",
    form: "Tablet",
    packSize: 20,
    price: 2.49,
    isGeneric: true,
    isSubsidized: true,
    subsidyPrice: 5.0,
    manufacturer: "Multichem",
  },

  // Allergy - Cetirizine
  {
    id: "6",
    barcode: "9415996789012",
    name: "Zyrtec 10mg Tablets",
    brandName: "Zyrtec",
    genericName: "Cetirizine",
    activeIngredient: "Cetirizine Hydrochloride",
    strength: "10mg",
    form: "Tablet",
    packSize: 30,
    price: 24.99,
    isGeneric: false,
    isSubsidized: false,
    subsidyPrice: null,
    manufacturer: "Johnson & Johnson",
  },
  {
    id: "7",
    barcode: "9415997890123",
    name: "Cetirizine 10mg Tablets",
    brandName: "Pharmacy Health",
    genericName: "Cetirizine",
    activeIngredient: "Cetirizine Hydrochloride",
    strength: "10mg",
    form: "Tablet",
    packSize: 30,
    price: 7.99,
    isGeneric: true,
    isSubsidized: true,
    subsidyPrice: 5.0,
    manufacturer: "Rex Medical",
  },

  // Heartburn - Omeprazole
  {
    id: "8",
    barcode: "9415998901234",
    name: "Losec 20mg Capsules",
    brandName: "Losec",
    genericName: "Omeprazole",
    activeIngredient: "Omeprazole",
    strength: "20mg",
    form: "Capsule",
    packSize: 14,
    price: 32.99,
    isGeneric: false,
    isSubsidized: false,
    subsidyPrice: null,
    manufacturer: "AstraZeneca",
  },
  {
    id: "9",
    barcode: "9415999012345",
    name: "Omeprazole 20mg Capsules",
    brandName: "Dr Reddy's",
    genericName: "Omeprazole",
    activeIngredient: "Omeprazole",
    strength: "20mg",
    form: "Capsule",
    packSize: 14,
    price: 8.99,
    isGeneric: true,
    isSubsidized: true,
    subsidyPrice: 5.0,
    manufacturer: "Dr Reddy's Laboratories",
  },

  // Skin - Hydrocortisone
  {
    id: "10",
    barcode: "9415990123456",
    name: "Dermaid 1% Cream",
    brandName: "Dermaid",
    genericName: "Hydrocortisone",
    activeIngredient: "Hydrocortisone",
    strength: "1%",
    form: "Cream",
    packSize: 30,
    price: 14.99,
    isGeneric: false,
    isSubsidized: false,
    subsidyPrice: null,
    manufacturer: "Ego Pharmaceuticals",
  },
  {
    id: "11",
    barcode: "9415991234568",
    name: "Hydrocortisone 1% Cream",
    brandName: "Pharmacy Action",
    genericName: "Hydrocortisone",
    activeIngredient: "Hydrocortisone",
    strength: "1%",
    form: "Cream",
    packSize: 30,
    price: 5.99,
    isGeneric: true,
    isSubsidized: true,
    subsidyPrice: 5.0,
    manufacturer: "AFT Pharmaceuticals",
  },
];

export function findMedicineByBarcode(barcode: string): Medicine | null {
  return medicineDatabase.find((m) => m.barcode === barcode) || null;
}

export function findAlternatives(medicine: Medicine): Medicine[] {
  // Find medicines with the same active ingredient
  return medicineDatabase.filter(
    (m) =>
      m.activeIngredient === medicine.activeIngredient &&
      m.strength === medicine.strength &&
      m.id !== medicine.id
  );
}

export function findCheapestAlternative(medicine: Medicine): Medicine | null {
  const alternatives = findAlternatives(medicine);
  if (alternatives.length === 0) return null;

  return alternatives.reduce((cheapest, current) =>
    current.price < cheapest.price ? current : cheapest
  );
}

// Demo barcodes for testing
export const demoBarcodes = [
  { barcode: "9415991234567", description: "Nurofen (expensive)" },
  { barcode: "9415994567890", description: "Panadol (expensive)" },
  { barcode: "9415996789012", description: "Zyrtec (expensive)" },
  { barcode: "9415998901234", description: "Losec (expensive)" },
  { barcode: "9415990123456", description: "Dermaid Cream (expensive)" },
];
