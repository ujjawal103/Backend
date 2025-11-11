const cloudinary = require("../cloudinary/cloudinary.config");

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer (QR code, image, etc.)
 * @param {String} folder - Folder name in Cloudinary
 * @param {String} publicId - Optional custom public id
 * @returns {Promise<Object>} Uploaded file info
 */
const cloudUpload = async (buffer, folder = "uploads", publicId = null) => {
  try {
    return await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: "image",
        },
        (error, result) => {
          if(error) error.message = "check your Internet ! QR failed";
          if (error) return reject(error);
          resolve(result);
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - File public_id in Cloudinary
 * @returns {Promise<Object>} Deletion result
 */
const cloudDelete = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    error.message = "check your Internet !";
    console.error("Cloudinary Delete Error:", error.message);
    throw error;
  }
};

module.exports = { cloudUpload, cloudDelete };
