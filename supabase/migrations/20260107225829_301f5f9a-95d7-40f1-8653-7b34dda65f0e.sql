-- Update the default for new spaces to use 32 bytes (256 bits) instead of 16 bytes (128 bits)
-- This generates a 64-character hex token which is virtually impossible to brute-force
ALTER TABLE public.spaces 
ALTER COLUMN access_token SET DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text);

-- Regenerate all existing tokens with the stronger 32-byte tokens
UPDATE public.spaces 
SET access_token = encode(extensions.gen_random_bytes(32), 'hex'::text);