import cloudinary from '../config/cloudinary';
import { AppError } from '../utils/appError';

interface UploadResult {
  url: string;
  public_id: string;
}

export const uploadFile = async (buffer: Buffer, folder: string, mimetype: string): Promise<UploadResult> => {
  // Determine resource type based on mimetype
  let resourceType: 'image' | 'raw' | 'auto' = 'auto';
  
  if (mimetype.startsWith('image/')) {
    resourceType = 'image';
  } else if (mimetype === 'application/pdf') {
    resourceType = 'raw';
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder, 
        resource_type: resourceType,
        allowed_formats: resourceType === 'raw' ? ['pdf'] : undefined
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteFile = async (publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
  } catch (error) {
    throw new AppError('File deletion failed', 500);
  }
};

export const validateFileType = (file: Express.Multer.File): void => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError('Invalid file type. Only PDF, JPG, and PNG files are allowed.', 400);
  }
};

export const validateFileSize = (file: Express.Multer.File, maxSize: number = 10 * 1024 * 1024): void => {
  if (file.size > maxSize) {
    throw new AppError(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`, 400);
  }
};

