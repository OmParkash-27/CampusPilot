
/**
 * Parse and validate Date
 */
function parseDate(dob) {
  if (!dob) return null;
  const parsedDate = new Date(dob);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

/**
 * Parse courses and normalize batchYear
 */
function parseCourses(courses) {
  const parsedCourses = courses ? JSON.parse(courses) : [];
  parsedCourses.forEach(c => {
    if (c.batchYear) {
      // Always store as number (year)
      c.batchYear = new Date(c.batchYear).getFullYear();
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
