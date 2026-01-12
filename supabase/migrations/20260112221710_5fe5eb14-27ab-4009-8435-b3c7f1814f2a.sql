-- Create storage bucket for page images
INSERT INTO storage.buckets (id, name, public) VALUES ('page-images', 'page-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'page-images');

-- Allow public read access to all images
CREATE POLICY "Public read access for page images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'page-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);