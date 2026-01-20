"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadImage = async (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
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
exports.uploadImage = uploadImage;
const deleteImage = async (publicId) => {
    await cloudinary_1.default.uploader.destroy(publicId);
};
exports.deleteImage = deleteImage;
