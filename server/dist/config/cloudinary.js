"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
if (isCloudinaryConfigured) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary service configured.');
}
else {
    console.log('Cloudinary credentials missing. Falling back to local static disk storage.');
}
/**
 * Uploads a file. If Cloudinary is configured, uploads to Cloudinary and deletes the temp file.
 * Otherwise, moves the file from temp storage to the public uploads folder and returns static server URL.
 */
const uploadImage = async (localFilePath, folderName = 'suidhaga') => {
    try {
        if (!fs_1.default.existsSync(localFilePath)) {
            throw new Error(`File not found at: ${localFilePath}`);
        }
        if (isCloudinaryConfigured) {
            const result = await cloudinary_1.v2.uploader.upload(localFilePath, {
                folder: folderName,
            });
            // Delete temporary local file
            try {
                fs_1.default.unlinkSync(localFilePath);
            }
            catch (err) {
                console.warn('Could not delete temp file after Cloudinary upload:', err);
            }
            return result.secure_url;
        }
        else {
            // Move file to static uploads directory
            const uploadsDir = path_1.default.join(__dirname, '..', '..', 'uploads');
            if (!fs_1.default.existsSync(uploadsDir)) {
                fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            }
            const fileName = `${Date.now()}-${path_1.default.basename(localFilePath)}`;
            const destinationPath = path_1.default.join(uploadsDir, fileName);
            fs_1.default.renameSync(localFilePath, destinationPath);
            // Return static route URL path
            return `/uploads/${fileName}`;
        }
    }
    catch (error) {
        console.error('Image upload failed:', error);
        // Cleanup temp file on failure
        try {
            if (fs_1.default.existsSync(localFilePath)) {
                fs_1.default.unlinkSync(localFilePath);
            }
        }
        catch (err) {
            console.warn('Could not delete temp file on upload failure:', err);
        }
        throw error;
    }
};
exports.uploadImage = uploadImage;
