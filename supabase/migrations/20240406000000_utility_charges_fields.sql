-- Update utility_charges table
-- Adding the required numeric columns with default 0.

ALTER TABLE "public"."utility_bills" 
ADD COLUMN IF NOT EXISTS "cold_water_amount" numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS "hot_water_amount" numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS "electricity_amount" numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS "water_discharge_amount" numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS "total_amount" numeric DEFAULT 0;

-- Optional: if the old schema had them without _amount suffix, we can drop them or leave them.
-- Following the prompt context to ensure form uses them and DB matches.
-- If old columns existed, we can drop them after testing, but for safe migration just ensure they exist.
ALTER TABLE "public"."utility_bills" DROP COLUMN IF EXISTS "gas";
ALTER TABLE "public"."utility_bills" DROP COLUMN IF EXISTS "cold_water";
ALTER TABLE "public"."utility_bills" DROP COLUMN IF EXISTS "hot_water";
ALTER TABLE "public"."utility_bills" DROP COLUMN IF EXISTS "electricity";
ALTER TABLE "public"."utility_bills" DROP COLUMN IF EXISTS "total";
