-- Seed data: Initial medicine database
-- Common NZ pharmacy products for Bio-Swap

INSERT INTO medicines (barcode, name, brand_name, generic_name, active_ingredient, strength, form, pack_size, price, is_generic, is_subsidized, subsidy_price, manufacturer) VALUES
-- Pain Relief - Ibuprofen
('9415991234567', 'Nurofen 200mg Tablets', 'Nurofen', 'Ibuprofen', 'Ibuprofen', '200mg', 'Tablet', 24, 12.99, false, false, NULL, 'Reckitt Benckiser'),
('9415992345678', 'Ibuprofen 200mg Tablets', 'Pharmacy Health', 'Ibuprofen', 'Ibuprofen', '200mg', 'Tablet', 24, 3.99, true, true, 5.00, 'AFT Pharmaceuticals'),
('9415993456789', 'Nurofen Plus', 'Nurofen', 'Ibuprofen + Codeine', 'Ibuprofen 200mg, Codeine 12.8mg', '200mg/12.8mg', 'Tablet', 24, 18.99, false, false, NULL, 'Reckitt Benckiser'),
('9415991234001', 'Advil 200mg Tablets', 'Advil', 'Ibuprofen', 'Ibuprofen', '200mg', 'Tablet', 24, 11.99, false, false, NULL, 'Pfizer'),

-- Pain Relief - Paracetamol
('9415994567890', 'Panadol 500mg Tablets', 'Panadol', 'Paracetamol', 'Paracetamol', '500mg', 'Tablet', 20, 8.99, false, false, NULL, 'GlaxoSmithKline'),
('9415995678901', 'Paracetamol 500mg Tablets', 'Pharmacy Choice', 'Paracetamol', 'Paracetamol', '500mg', 'Tablet', 20, 2.49, true, true, 5.00, 'Multichem'),
('9415994567001', 'Panadol Rapid', 'Panadol', 'Paracetamol', 'Paracetamol', '500mg', 'Caplet', 20, 10.99, false, false, NULL, 'GlaxoSmithKline'),
('9415995678002', 'Paracetamol 500mg Caplets', 'Ethics', 'Paracetamol', 'Paracetamol', '500mg', 'Caplet', 100, 6.99, true, true, 5.00, 'Ethics'),

-- Allergy - Cetirizine
('9415996789012', 'Zyrtec 10mg Tablets', 'Zyrtec', 'Cetirizine', 'Cetirizine Hydrochloride', '10mg', 'Tablet', 30, 24.99, false, false, NULL, 'Johnson & Johnson'),
('9415997890123', 'Cetirizine 10mg Tablets', 'Pharmacy Health', 'Cetirizine', 'Cetirizine Hydrochloride', '10mg', 'Tablet', 30, 7.99, true, true, 5.00, 'Rex Medical'),
('9415996789001', 'Razene 10mg Tablets', 'Razene', 'Cetirizine', 'Cetirizine Hydrochloride', '10mg', 'Tablet', 30, 19.99, false, false, NULL, 'Douglas Pharmaceuticals'),

-- Allergy - Loratadine
('9415996789100', 'Claratyne 10mg Tablets', 'Claratyne', 'Loratadine', 'Loratadine', '10mg', 'Tablet', 30, 22.99, false, false, NULL, 'Bayer'),
('9415997890200', 'Loratadine 10mg Tablets', 'Pharmacy Choice', 'Loratadine', 'Loratadine', '10mg', 'Tablet', 30, 6.99, true, true, 5.00, 'AFT Pharmaceuticals'),

-- Heartburn - Omeprazole
('9415998901234', 'Losec 20mg Capsules', 'Losec', 'Omeprazole', 'Omeprazole', '20mg', 'Capsule', 14, 32.99, false, false, NULL, 'AstraZeneca'),
('9415999012345', 'Omeprazole 20mg Capsules', 'Dr Reddy''s', 'Omeprazole', 'Omeprazole', '20mg', 'Capsule', 14, 8.99, true, true, 5.00, 'Dr Reddy''s Laboratories'),
('9415998901001', 'Losec 10mg Capsules', 'Losec', 'Omeprazole', 'Omeprazole', '10mg', 'Capsule', 14, 28.99, false, false, NULL, 'AstraZeneca'),
('9415999012002', 'Omeprazole 10mg Capsules', 'Ethics', 'Omeprazole', 'Omeprazole', '10mg', 'Capsule', 28, 9.99, true, true, 5.00, 'Ethics'),

-- Heartburn - Ranitidine alternatives (Famotidine)
('9415998902000', 'Pepcid 20mg Tablets', 'Pepcid', 'Famotidine', 'Famotidine', '20mg', 'Tablet', 12, 15.99, false, false, NULL, 'Johnson & Johnson'),
('9415999013000', 'Famotidine 20mg Tablets', 'Pharmacy Health', 'Famotidine', 'Famotidine', '20mg', 'Tablet', 12, 5.99, true, true, 5.00, 'Rex Medical'),

-- Skin - Hydrocortisone
('9415990123456', 'Dermaid 1% Cream', 'Dermaid', 'Hydrocortisone', 'Hydrocortisone', '1%', 'Cream', 30, 14.99, false, false, NULL, 'Ego Pharmaceuticals'),
('9415991234568', 'Hydrocortisone 1% Cream', 'Pharmacy Action', 'Hydrocortisone', 'Hydrocortisone', '1%', 'Cream', 30, 5.99, true, true, 5.00, 'AFT Pharmaceuticals'),
('9415990123001', 'Cortizone-10 Cream', 'Cortizone-10', 'Hydrocortisone', 'Hydrocortisone', '1%', 'Cream', 28, 12.99, false, false, NULL, 'Chattem'),

-- Antifungal - Clotrimazole
('9415990200000', 'Canesten Cream', 'Canesten', 'Clotrimazole', 'Clotrimazole', '1%', 'Cream', 20, 16.99, false, false, NULL, 'Bayer'),
('9415991300000', 'Clotrimazole 1% Cream', 'Pharmacy Health', 'Clotrimazole', 'Clotrimazole', '1%', 'Cream', 20, 6.49, true, true, 5.00, 'AFT Pharmaceuticals'),

-- Nasal - Fluticasone
('9415990300000', 'Flixonase Nasal Spray', 'Flixonase', 'Fluticasone', 'Fluticasone Propionate', '50mcg', 'Nasal Spray', 120, 29.99, false, false, NULL, 'GlaxoSmithKline'),
('9415991400000', 'Fluticasone Nasal Spray', 'Ethics', 'Fluticasone', 'Fluticasone Propionate', '50mcg', 'Nasal Spray', 120, 14.99, true, true, 5.00, 'Ethics'),

-- Eye Drops - Antihistamine
('9415990400000', 'Zaditen Eye Drops', 'Zaditen', 'Ketotifen', 'Ketotifen Fumarate', '0.025%', 'Eye Drops', 5, 18.99, false, false, NULL, 'Novartis'),
('9415991500000', 'Ketotifen Eye Drops', 'Pharmacy Health', 'Ketotifen', 'Ketotifen Fumarate', '0.025%', 'Eye Drops', 5, 9.99, true, true, 5.00, 'Rex Medical'),

-- Cough - Dextromethorphan
('9415990500000', 'Robitussin DM', 'Robitussin', 'Dextromethorphan', 'Dextromethorphan', '15mg/5ml', 'Syrup', 200, 14.99, false, false, NULL, 'Pfizer'),
('9415991600000', 'Cough Suppressant', 'Pharmacy Choice', 'Dextromethorphan', 'Dextromethorphan', '15mg/5ml', 'Syrup', 200, 7.99, true, false, NULL, 'Multichem'),

-- Anti-nausea - Dimenhydrinate
('9415990600000', 'Dramamine Tablets', 'Dramamine', 'Dimenhydrinate', 'Dimenhydrinate', '50mg', 'Tablet', 12, 12.99, false, false, NULL, 'Prestige Brands'),
('9415991700000', 'Travel Sickness Tablets', 'Pharmacy Choice', 'Dimenhydrinate', 'Dimenhydrinate', '50mg', 'Tablet', 12, 5.99, true, false, NULL, 'AFT Pharmaceuticals'),

-- Vitamins - Vitamin D
('9415990700000', 'Blackmores Vitamin D3 1000IU', 'Blackmores', 'Vitamin D3', 'Cholecalciferol', '1000IU', 'Capsule', 60, 24.99, false, false, NULL, 'Blackmores'),
('9415991800000', 'Vitamin D3 1000IU', 'Pharmacy Health', 'Vitamin D3', 'Cholecalciferol', '1000IU', 'Capsule', 60, 9.99, true, false, NULL, 'Rex Medical'),

-- Iron supplements
('9415990800000', 'Ferrograd C', 'Ferrograd', 'Iron + Vitamin C', 'Ferrous Sulfate + Ascorbic Acid', '325mg/500mg', 'Tablet', 30, 19.99, false, false, NULL, 'Viatris'),
('9415991900000', 'Iron + Vitamin C', 'Ethics', 'Iron + Vitamin C', 'Ferrous Sulfate + Ascorbic Acid', '325mg/500mg', 'Tablet', 30, 8.99, true, true, 5.00, 'Ethics'),

-- Calcium
('9415990900000', 'Caltrate 600mg', 'Caltrate', 'Calcium', 'Calcium Carbonate', '600mg', 'Tablet', 60, 22.99, false, false, NULL, 'Pfizer'),
('9415992000000', 'Calcium 600mg', 'Pharmacy Choice', 'Calcium', 'Calcium Carbonate', '600mg', 'Tablet', 60, 9.99, true, false, NULL, 'Multichem'),

-- Probiotics
('9415991000000', 'Inner Health Plus', 'Inner Health', 'Probiotic', 'Lactobacillus acidophilus + Bifidobacterium', '25 billion CFU', 'Capsule', 30, 39.99, false, false, NULL, 'Ethical Nutrients'),
('9415992100000', 'Probiotic Daily', 'Pharmacy Health', 'Probiotic', 'Lactobacillus acidophilus + Bifidobacterium', '10 billion CFU', 'Capsule', 30, 14.99, true, false, NULL, 'Rex Medical')

ON CONFLICT (barcode) DO UPDATE SET
  name = EXCLUDED.name,
  brand_name = EXCLUDED.brand_name,
  generic_name = EXCLUDED.generic_name,
  active_ingredient = EXCLUDED.active_ingredient,
  strength = EXCLUDED.strength,
  form = EXCLUDED.form,
  pack_size = EXCLUDED.pack_size,
  price = EXCLUDED.price,
  is_generic = EXCLUDED.is_generic,
  is_subsidized = EXCLUDED.is_subsidized,
  subsidy_price = EXCLUDED.subsidy_price,
  manufacturer = EXCLUDED.manufacturer,
  updated_at = NOW();
