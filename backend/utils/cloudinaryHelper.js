
const cloudinary = require('../config/cloudinary');

/**
 * Upload single profile pic to Cloudinary
 */
async function uploadProfilePic(file) {
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'campuspilot/profile_pics', use_filename: true, unique_filename: true },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}

/**
 * Upload multiple photos to Cloudinary
 */
async function uploadPhotos(files) {
  if (!files || !files.length) return [];
  const uploaded = [];
  for (const file of files) {
    const res = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'campuspilot/student_doc', use_filename: true, unique_filename: true },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(file.buffer);
    });
    uploaded.push(res);
  }
  return uploaded;
}

// Extract public ID from URL
function getPublicIdFromUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname; // /image/upload/v123456/campuspilot/student_doc/file_emm8ly.jpg
    const parts = pathname.split('/');

    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return null;

    // Remove version if present (starts with v)
    let filePathArray = parts.slice(uploadIndex + 1);
    if (filePathArray[0].startsWith('v')) {
      filePathArray = filePathArray.slice(1);
    }

    const filePath = filePathArray.join('/').replace(/\.[^/.]+$/, ''); // remove extension
    return filePath; // campuspilot/student_doc/file_emm8ly
  } catch (err) {
    console.warn('Error extracting public ID:', err.message);
    return null;
  }
}

// Delete multiple files from Cloudinary
async function deleteFromCloudinary(urls) {
  if (!urls || !urls.length) return;
  await Promise.all(
    urls.map(async url => {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log('Deleted:', publicId);
        } catch (err) {
          console.warn('Failed to delete:', publicId, err.message);
        }
      }
    })
  );
}

module.exports = { 
    uploadProfilePic,
    uploadPhotos,
    deleteFromCloudinary
}