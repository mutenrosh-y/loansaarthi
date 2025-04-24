import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Simple in-memory cache for signed URLs
const urlCache = new Map<string, { url: string; expiresAt: number }>();

export const getSignedUrl = async (publicId: string, format: string): Promise<string> => {
  const cacheKey = `${publicId}-${format}`;
  const now = Date.now();
  const cached = urlCache.get(cacheKey);

  // Return cached URL if it's still valid (with 5-minute buffer)
  if (cached && cached.expiresAt - now > 5 * 60 * 1000) {
    return cached.url;
  }

  // Generate new signed URL
  const expiresAt = Math.floor(now / 1000) + 3600; // 1 hour from now
  const signedUrl = cloudinary.utils.private_download_url(
    publicId,
    format,
    { expires_at: expiresAt }
  );

  // Cache the new URL
  urlCache.set(cacheKey, {
    url: signedUrl,
    expiresAt: expiresAt * 1000, // Convert to milliseconds
  });

  return signedUrl;
};

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of urlCache.entries()) {
    if (value.expiresAt <= now) {
      urlCache.delete(key);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

export default cloudinary; 