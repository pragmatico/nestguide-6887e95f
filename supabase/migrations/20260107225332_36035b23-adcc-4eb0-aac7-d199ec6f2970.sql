-- Drop the overly permissive public access policies
DROP POLICY IF EXISTS "Anyone can view spaces via access token" ON public.spaces;
DROP POLICY IF EXISTS "Anyone can view pages via space access" ON public.pages;

-- Create a function to check if an access token is valid for a space
CREATE OR REPLACE FUNCTION public.has_valid_access_token(_space_id uuid, _token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.spaces
    WHERE id = _space_id
      AND access_token = _token
  )
$$;

-- Create a function to get space_id from access token (for public page access)
CREATE OR REPLACE FUNCTION public.get_space_id_by_token(_token text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.spaces
  WHERE access_token = _token
  LIMIT 1
$$;

-- Add policy for public access to spaces - requires valid access_token in request header
-- Users must pass the access_token as a header: x-access-token
CREATE POLICY "Public access with valid token"
ON public.spaces
FOR SELECT
USING (
  access_token = current_setting('request.headers', true)::json->>'x-access-token'
);

-- Add policy for public access to pages - requires the space to be accessible via token
CREATE POLICY "Public page access with valid token"
ON public.pages
FOR SELECT
USING (
  space_id = public.get_space_id_by_token(
    current_setting('request.headers', true)::json->>'x-access-token'
  )
);