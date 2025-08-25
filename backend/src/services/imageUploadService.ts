import cloudinary from '../config/cloudinary';

interface UploadResult {
  url: string;
  public_id: string;
}

export const uploadImage = async (buffer: Buffer, folder: string): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
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

export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};