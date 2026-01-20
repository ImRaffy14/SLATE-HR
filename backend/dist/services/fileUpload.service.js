"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileSize = exports.validateFileType = exports.deleteFile = exports.uploadFile = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const appError_1 = require("../utils/appError");
const uploadFile = async (buffer, folder, mimetype) => {
    // Determine resource type based on mimetype
    let resourceType = 'auto';
    if (mimetype.startsWith('image/')) {
        resourceType = 'image';
    }
    else if (mimetype === 'application/pdf') {
        resourceType = 'raw';
    }
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder,
            resource_type: resourceType,
            allowed_formats: resourceType === 'raw' ? ['pdf'] : undefined
        }, (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error('Upload failed'));
            resolve({
                url: result.secure_url,
                public_id: result.public_id,
            });
        });
        uploadStream.end(buffer);
    });
};
exports.uploadFile = uploadFile;
const deleteFile = async (publicId, resourceType = 'image') => {
    try {
        await cloudinary_1.default.uploader.destroy(publicId, {
            resource_type: resourceType
        });
    }
    catch (error) {
        throw new appError_1.AppError('File deletion failed', 500);
    }
};
exports.deleteFile = deleteFile;
const validateFileType = (file) => {
    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new appError_1.AppError('Invalid file type. Only PDF, JPG, and PNG files are allowed.', 400);
    }
};
exports.validateFileType = validateFileType;
const validateFileSize = (file, maxSize = 10 * 1024 * 1024) => {
    if (file.size > maxSize) {
        throw new appError_1.AppError(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`, 400);
    }
};
exports.validateFileSize = validateFileSize;
