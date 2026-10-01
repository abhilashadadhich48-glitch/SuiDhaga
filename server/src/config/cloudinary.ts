import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary service configured.');
} else {
  console.log('Cloudinary credentials missing. Falling back to local static disk storage.');
}

/**
 * Uploads a file. If Cloudinary is configured, uploads to Cloudinary and deletes the temp file.
 * Otherwise, moves the file from temp storage to the public uploads folder and returns static server URL.
 */
export const uploadImage = async (localFilePath: string, folderName = 'suidhaga'): Promise<string> => {
  try {
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found at: ${localFilePath}`);
    }

    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folderName,
      });
      // Delete temporary local file
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.warn('Could not delete temp file after Cloudinary upload:', err);
      }
      return result.secure_url;
    } else {
      // Move file to static uploads directory
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${path.basename(localFilePath)}`;
      const destinationPath = path.join(uploadsDir, fileName);

      fs.renameSync(localFilePath, destinationPath);

      // Return static route URL path
      return `/uploads/${fileName}`;
    }
  } catch (error) {
    console.error('Image upload failed:', error);
    // Cleanup temp file on failure
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (err) {
      console.warn('Could not delete temp file on upload failure:', err);
    }
    throw error;
  }
};
