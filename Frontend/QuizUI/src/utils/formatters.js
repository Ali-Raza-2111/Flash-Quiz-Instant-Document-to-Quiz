/**
 * Format option text to a maximum length with ellipsis
 * @param {string} text - The option text to format
 * @param {number} maxLength - Maximum characters (default 100)
 * @returns {string} Formatted text
 */
export const formatOption = (text, maxLength = 100) => {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength - 3) + '...';
};

/**
 * Format all options in an array
 * @param {string[]} options - Array of option texts
 * @param {number} maxLength - Maximum characters per option
 * @returns {string[]} Array of formatted options
 */
export const formatQuizOptions = (options, maxLength = 100) => {
  if (!Array.isArray(options)) return [];
  return options.map(opt => formatOption(opt, maxLength));
};

/**
 * Get truncated text with tooltip support
 * @param {string} text - Full text
 * @param {number} maxLength - Display length
 * @returns {object} { display, full, isTruncated }
 */
export const getTruncatedOption = (text, maxLength = 100) => {
  if (!text) return { display: '', full: '', isTruncated: false };
  const trimmed = text.trim();
  const isTruncated = trimmed.length > maxLength;
  return {
    display: isTruncated ? trimmed.slice(0, maxLength - 3) + '...' : trimmed,
    full: trimmed,
    isTruncated
  };
};