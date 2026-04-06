-- Update meter_readings table to keep only 3 required columns
ALTER TABLE "public"."meter_readings" DROP COLUMN IF EXISTS "consumption_sewage";
ALTER TABLE "public"."meter_readings" DROP COLUMN IF EXISTS "sewage";

-- Add columns if missing (in case they weren't explicitly named like this before)
-- Note: the application expects cold_water, hot_water, electricity.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meter_readings' AND column_name = 'cold_water') THEN
    ALTER TABLE "public"."meter_readings" ADD COLUMN "cold_water" numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meter_readings' AND column_name = 'hot_water') THEN
    ALTER TABLE "public"."meter_readings" ADD COLUMN "hot_water" numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meter_readings' AND column_name = 'electricity') THEN
    ALTER TABLE "public"."meter_readings" ADD COLUMN "electricity" numeric;
  END IF;
END $$;
