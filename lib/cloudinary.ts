import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadMedia(
  file: string,
  folder: string = 'bloom-cards',
  resourceType: 'image' | 'video' | 'auto' = 'auto'
) {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: resourceType,
    transformation: resourceType === 'image' ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
  });
  return result;
}

export async function deleteMedia(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
