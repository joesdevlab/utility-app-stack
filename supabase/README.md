# Supabase Database Migrations

This folder contains SQL migrations for the HoldCo Utility App Stack.

## Migration Files

Run these migrations in order in your Supabase SQL Editor:

1. **001_medicines.sql** - Bio-Swap medicines table
2. **002_bioswap_scans.sql** - Bio-Swap scan history table
3. **003_salvage_listings.sql** - Salvage-Scout listings table
4. **004_salvage_claims.sql** - Salvage-Scout claims table
5. **005_apprentice_log_enhancements.sql** - Indexes and soft delete for Apprentice-Log
6. **006_storage_buckets.sql** - Supabase Storage bucket for listing images
7. **007_seed_medicines.sql** - Initial medicine data (40+ NZ medicines)
8. **008_apprentice_entries_fields.sql** - Additional fields for Apprentice-Log

## How to Run

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order
4. Click **Run** for each one

## Prerequisites

Before running migrations, ensure you have:

1. Created a Supabase project
2. Set up authentication (email/password)
3. Added your Supabase URL and anon key to each app's `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Tables Created

### Bio-Swap
- `medicines` - Medicine database with barcode lookup
- `bioswap_scans` - User scan history

### Salvage-Scout
- `salvage_listings` - Material listings with location
- `salvage_claims` - Claim requests on listings

### Apprentice-Log
- `apprentice_entries` - Logbook entries (already exists, adds indexes/soft delete)

## Storage Buckets

- `listing-images` - Public bucket for Salvage-Scout listing photos (5MB limit)

## Row Level Security

All tables have RLS enabled:
- Users can only access their own data
- Public data (medicines, available listings) is readable by all
- Insert/update/delete restricted to authenticated users on their own records

## Notes

- The medicine seed data includes ~40 common NZ pharmacy products
- Soft delete is implemented for Apprentice-Log entries (recoverable)
- Storage bucket allows jpeg, png, and webp images up to 5MB
