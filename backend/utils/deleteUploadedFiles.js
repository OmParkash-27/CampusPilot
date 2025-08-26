const fs = require('fs');
const path = require('path');

const deleteFiles = async (filenames, folder = 'public/img/') => {

  if (!filenames) return;

  const files = Array.isArray(filenames) ? filenames : [filenames];  
  try {
    await Promise.allSettled(
      files.filter(Boolean).map(async (filename) => { // filter(Boolean) for skip null, undefined, '' string values.
        const filePath = path.join(__dirname, '..', folder, filename);

        try {
          await fs.promises.unlink(filePath); // Delete file
        } catch (err) {
          // File doesn't exist or can't be accessed — just skip
          console.warn(`File not found or inaccessible while deleting: ${filePath}`);
        }
      })
    );
  } catch (err) {
    console.error('Error deleting files:', err);
  }
};

module.exports = deleteFiles;
