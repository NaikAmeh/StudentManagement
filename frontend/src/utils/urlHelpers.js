/**
 * Constructs a full image URL with optional cache-busting query parameters.
 * @param {string} photoName - The name or path of the photo.
 * @returns {string|null} - The constructed URL or null if photoName is invalid.
 */
export const constructImageUrl = (photoName) => {
    if (!photoName) return null;
  
    const baseUrl = "https://localhost:62376/uploads"; // Replace with your backend's base URL
    const timestamp = new Date().getTime(); // Cache-busting query parameter
  
    // Ensure the photoName does not already include the base URL
    if (photoName.startsWith("http") || photoName.startsWith("/")) {
      return `${photoName}?t=${timestamp}`;
    }
  
    return `${baseUrl}/${photoName}?t=${timestamp}`;
  };