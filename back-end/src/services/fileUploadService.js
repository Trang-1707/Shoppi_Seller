const { deleteObject } = require('../config/minio');

/**
 * Upload is handled by multer-s3 middleware. This module keeps deletion and URL helpers.
 */

/**
 * Delete a file from MinIO (S3)
 * @param {string} key - Object key to delete
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFile = async (key) => {
  try {
    const result = await deleteObject(key);
    return result;
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Get public URL for an object key
 * @param {string} key
 * @returns {string}
 */
const getPublicUrl = (key) => {
  const endpoint = process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT || 'http://63.141.253.242:9000';
  const bucket = process.env.MINIO_BUCKET || 'shopii';
  const base = endpoint.replace(/\/$/, '');
  return `${base}/${bucket}/${key}`;
};

module.exports = {
  deleteFile,
  getPublicUrl,
}; 