import { useState, useEffect } from 'react';

interface SecureImageProps {
  src: string;
  alt: string;
  token: string;
  className?: string;
}

// Cache for signed URLs
const signedUrlCache = new Map<string, { url: string; expires: number }>();

export function SecureImage({ src, alt, token, className }: SecureImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      // Check if this is a storage URL that needs signing
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const storagePattern = new RegExp(`^${supabaseUrl}/storage/v1/object/page-images/(.+)$`);
      const match = src.match(storagePattern);
      
      if (!match) {
        // Not a private storage URL, use directly
        setSignedUrl(src);
        setLoading(false);
        return;
      }

      const imagePath = match[1];
      
      // Check cache first
      const cached = signedUrlCache.get(imagePath);
      if (cached && cached.expires > Date.now() + 300000) {
        setSignedUrl(cached.url);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/get-image?path=${encodeURIComponent(imagePath)}&token=${encodeURIComponent(token)}`
        );

        if (!response.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        const result = await response.json();
        if (result.signedUrl) {
          // Cache for 55 minutes
          signedUrlCache.set(imagePath, {
            url: result.signedUrl,
            expires: Date.now() + 3300000,
          });
          setSignedUrl(result.signedUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading secure image:', err);
        setError(true);
      }
      setLoading(false);
    };

    loadImage();
  }, [src, token]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-muted rounded-lg ${className}`} style={{ minHeight: '200px' }} />
    );
  }

  if (error || !signedUrl) {
    return null;
  }

  return (
    <img 
      src={signedUrl} 
      alt={alt} 
      className={className}
      loading="lazy"
    />
  );
}
