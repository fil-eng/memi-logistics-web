/**
 * Sorts an array of items by the most recent date in descending order (newest first)
 * Handles multiple date field names and safely processes missing/invalid dates
 *
 * @param {Array} items - The array to sort
 * @param {string|Array} dateFields - Single date field name or array of field names to check
 *                                    (checked in order: createdAt, updatedAt, timestamp, eventTime)
 * @returns {Array} - New sorted array with newest items first
 */
export const sortByLatestDateDesc = (
  items = [],
  dateFields = ["createdAt", "updatedAt", "timestamp", "eventTime"],
) => {
  if (!Array.isArray(items) || items.length === 0) {
    return items;
  }

  const fieldsToCheck = Array.isArray(dateFields) ? dateFields : [dateFields];

  return [...items].sort((a, b) => {
    // Find the first valid date field in item a
    let dateA = null;
    for (const field of fieldsToCheck) {
      if (a[field]) {
        dateA = new Date(a[field]);
        if (!isNaN(dateA.getTime())) {
          break;
        }
        dateA = null;
      }
    }

    // Find the first valid date field in item b
    let dateB = null;
    for (const field of fieldsToCheck) {
      if (b[field]) {
        dateB = new Date(b[field]);
        if (!isNaN(dateB.getTime())) {
          break;
        }
        dateB = null;
      }
    }

    // If both dates are invalid, maintain original order
    if (!dateA && !dateB) return 0;

    // If only one is invalid, put the valid one first
    if (!dateA) return 1;
    if (!dateB) return -1;

    // Sort in descending order (newest first)
    return dateB - dateA;
  });
};
