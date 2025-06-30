import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format time from HH:MM:SS to HH:MM
export function formatTimeWithoutSeconds(timeString: string): string {
  if (!timeString) return timeString;
  
  // Handle different time formats
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  
  return timeString;
}

// Convert duration minutes to hours format
export function formatDurationHours(durationMinutes: number): string {
  if (!durationMinutes) return '';
  
  if (durationMinutes < 60) {
    // Less than 1 hour - show in minutes
    return `Duration ${durationMinutes} minutes`;
  } else if (durationMinutes === 60) {
    // Exactly 1 hour
    return 'Duration 1 hour';
  } else {
    // More than 1 hour - show in hours
    const hours = durationMinutes / 60;
    if (hours % 1 === 0) {
      return `Duration ${hours} hours`;
    } else {
      return `Duration ${hours.toFixed(1)} hours`;
    }
  }
}
