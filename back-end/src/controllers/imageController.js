const fileUploadService = require('../services/fileUploadService');

/**
 * Upload a single image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Luôn build URL public từ MINIO_PUBLIC_ENDPOINT để tránh mixed content
    const key = req.file.key;
    const publicUrl = fileUploadService.getPublicUrl(key);

    const result = {
      public_id: key,
      url: publicUrl,
      secure_url: publicUrl,
      format: req.file.mimetype,
      width: undefined,
      height: undefined
    };

    console.log("Uploaded result:", result);

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in uploadImage controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};


/**
 * Upload multiple images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const results = req.files.map(file => {
      const key = file.key;
      const publicUrl = fileUploadService.getPublicUrl(key);
      return {
        public_id: key,
        url: publicUrl,
        secure_url: publicUrl,
        format: file.mimetype,
        width: undefined,
        height: undefined
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: results
    });
  } catch (error) {
    console.error('Error in uploadMultipleImages controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

/**
 * Delete an image from storage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await fileUploadService.deleteFile(public_id);

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in deleteImage controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage
}; 