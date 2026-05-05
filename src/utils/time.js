/**
 * Time formatting utilities for consistent time display across the application
 */

/**
 * Format a date/time string or Date object to 12-hour format
 * @param {string|Date|number} dateTime - The date/time to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeDate - Whether to include the date (default: false)
 * @param {boolean} options.includeSeconds - Whether to include seconds (default: false)
 * @returns {string} Formatted time string or empty string if invalid
 */
export const formatTime12Hour = (dateTime, options = {}) => {
  if (!dateTime) return "";

  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "";

    const timeOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...(options.includeSeconds && { second: "2-digit" }),
    };

    if (options.includeDate) {
      timeOptions.year = "numeric";
      timeOptions.month = "short";
      timeOptions.day = "numeric";
    }

    return new Intl.DateTimeFormat("en-US", timeOptions).format(date);
  } catch (error) {
    console.warn("Error formatting time:", error);
    return "";
  }
};

/**
 * Format a date/time for relative display (e.g., "2 hours ago")
 * @param {string|Date|number} dateTime - The date/time to format
 * @returns {string} Relative time string or formatted date if old
 */
export const formatRelativeTime = (dateTime) => {
  if (!dateTime) return "";

  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    // For older dates, show the actual date
    return formatTime12Hour(date, { includeDate: true });
  } catch (error) {
    console.warn("Error formatting relative time:", error);
    return "";
  }
};

/**
 * Format a date for display (without time)
 * @param {string|Date|number} dateTime - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateTime) => {
  if (!dateTime) return "";

  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "";
  }
};
