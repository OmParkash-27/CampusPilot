
/**
 * Parse and validate Date
 */
function parseDate(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;

  // Normalize to UTC midnight
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Parse courses and normalize batchYear
 */
function parseCourses(courses) {
  const parsedCourses = courses ? JSON.parse(courses) : [];
  parsedCourses.forEach(c => {
    if (c.batchYear) {
      if (typeof c.batchYear === 'number') {
        c.batchYear = c.batchYear;
      } else {
        const date = new Date(c.batchYear);
        c.batchYear = date.getFullYear();
      }
    }
  });
  return parsedCourses;
}

/**
 * Parse address safely
 */
function parseAddress(address) {
  return address ? JSON.parse(address) : {};
}

/**
 * Extract uploaded photos
 */
function extractPhotos(files) {
  if (files && files.photos) {
    return files.photos.map(f => f.filename);
  }
  return [];
}

/**
 * Extract uploaded profile pic
 */
function extractProfilePic(files) {
  return files && files.profilePic ? files.profilePic[0].filename : null;
}

module.exports = {
  parseDate,
  parseCourses,
  parseAddress,
  extractPhotos,
  extractProfilePic
};
