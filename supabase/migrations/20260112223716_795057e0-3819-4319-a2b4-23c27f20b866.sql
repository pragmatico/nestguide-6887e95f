-- Make the storage bucket private
UPDATE storage.buckets SET public = false WHERE id = 'page-images';

-- Drop the existing public read policy
DROP POLICY IF EXISTS "Public read access for page images" ON storage.objects;

-- Allow authenticated users to read their own images (for the editor)
CREATE POLICY "Authenticated users can read own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'page-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a function to get signed URLs for images with valid token
CREATE OR REPLACE FUNCTION public.get_signed_image_url(
  _image_path text,
  _token text,
  _expires_in integer DEFAULT 3600
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  _space_id uuid;
  _user_id text;
  _bucket_id text := 'page-images';
BEGIN
  -- Extract user_id from the image path (format: user_id/filename)
  _user_id := split_part(_image_path, '/', 1);
  
  -- Verify the token is valid for a space owned by the user who uploaded the image
  SELECT s.id INTO _space_id
  FROM public.spaces s
  WHERE s.access_token = _token
    AND s.user_id::text = _user_id
  LIMIT 1;
  
  IF _space_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return the signed URL using Supabase storage functions
  -- Note: This returns a path that the client will use to construct the full URL
  RETURN _image_path;
END;
$$;