-- Add optional property address and contact fields to spaces
ALTER TABLE public.spaces 
ADD COLUMN address_line1 TEXT,
ADD COLUMN address_line2 TEXT,
ADD COLUMN city TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN country TEXT,
ADD COLUMN contact_phone TEXT,
ADD COLUMN contact_whatsapp TEXT,
ADD COLUMN contact_email TEXT;