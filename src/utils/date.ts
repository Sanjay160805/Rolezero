import { format as dateFnsFormat } from 'date-fns';

/**
 * Safely format a timestamp to a string
 * Handles invalid timestamps by returning a fallback string
 */
export function safeFormatDate(
  timestamp: number | undefined | null,
  formatString: string,
  fallback: string = 'Invalid date'
): string {
  // Check if timestamp is valid
  if (!timestamp || timestamp <= 0 || isNaN(timestamp)) {
    return fallback;
  }

  try {
    // Ensure timestamp is in milliseconds
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const date = new Date(ms);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    return dateFnsFormat(date, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
}

/**
 * Format timestamp to human-readable date and time
 */
export function formatDateTime(timestamp: number | undefined | null): string {
  return safeFormatDate(timestamp, 'MMM d, yyyy HH:mm', 'N/A');
}

/**
 * Format timestamp to date only
 */
export function formatDate(timestamp: number | undefined | null): string {
  return safeFormatDate(timestamp, 'MMM d, yyyy', 'N/A');
}

/**
 * Format timestamp to time only
 */
export function formatTime(timestamp: number | undefined | null): string {
  return safeFormatDate(timestamp, 'HH:mm:ss', 'N/A');
}
