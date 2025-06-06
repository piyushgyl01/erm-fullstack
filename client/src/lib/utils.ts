// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance, isAfter, isBefore, parseISO } from "date-fns";

/**
 * Combines class names and resolves Tailwind CSS conflicts
 * This utility function is essential for building a consistent design system
 *
 * Example usage:
 * cn("px-4 py-2", "bg-blue-500", condition && "text-white")
 *
 * The clsx function handles conditional classes and arrays
 * The twMerge function resolves Tailwind CSS conflicts (e.g., if you have both "p-4" and "px-2")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or Date object into a readable format
 * This provides consistent date formatting throughout the application
 */
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

/**
 * Formats a date string or Date object into a detailed format with time
 * Useful for displaying timestamps and detailed scheduling information
 */
export function formatDateTime(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "MMM dd, yyyy at h:mm a");
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "Invalid date";
  }
}

/**
 * Formats the relative time from now (e.g., "3 days ago", "in 2 weeks")
 * This provides intuitive time representations for users
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Unknown time";
  }
}

/**
 * Checks if a project or assignment is currently active
 * Compares the current date with start and end dates
 */
export function isDateInRange(
  startDate: string | Date,
  endDate: string | Date
): boolean {
  try {
    const now = new Date();
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    return isAfter(now, start) && isBefore(now, end);
  } catch (error) {
    console.error("Error checking date range:", error);
    return false;
  }
}

/**
 * Calculates the percentage of completion for a project or assignment
 * Based on the current date relative to start and end dates
 */
export function calculateProgress(
  startDate: string | Date,
  endDate: string | Date
): number {
  try {
    const now = new Date();
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    // If not started yet, return 0%
    if (isBefore(now, start)) {
      return 0;
    }

    // If completed, return 100%
    if (isAfter(now, end)) {
      return 100;
    }

    // Calculate percentage based on time elapsed
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.round((elapsed / totalDuration) * 100);
  } catch (error) {
    console.error("Error calculating progress:", error);
    return 0;
  }
}

/**
 * Generates a color class based on capacity utilization percentage
 * This provides visual feedback for resource allocation
 */
export function getCapacityColor(utilizationPercentage: number): string {
  if (utilizationPercentage >= 100) {
    return "text-red-600 bg-red-50"; // Over-allocated - red warning
  } else if (utilizationPercentage >= 80) {
    return "text-orange-600 bg-orange-50"; // High utilization - orange caution
  } else if (utilizationPercentage >= 60) {
    return "text-green-600 bg-green-50"; // Good utilization - green success
  } else {
    return "text-blue-600 bg-blue-50"; // Under-utilized - blue information
  }
}

/**
 * Generates a status badge color based on project status
 * Provides consistent visual representation of project states
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "planning":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Generates a priority color based on urgency or importance
 * Useful for highlighting critical assignments or projects
 */
export function getPriorityColor(
  priority: "low" | "medium" | "high" | "critical"
): string {
  switch (priority) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Truncates text to a specified length with ellipsis
 * Useful for displaying long descriptions in limited space
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
}

/**
 * Capitalizes the first letter of each word in a string
 * Useful for formatting names and titles consistently
 */
export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Formats a skill array into a readable string
 * Handles different array lengths gracefully
 */
export function formatSkills(skills: string[]): string {
  if (skills.length === 0) {
    return "No skills listed";
  } else if (skills.length === 1) {
    return skills[0];
  } else if (skills.length === 2) {
    return skills.join(" and ");
  } else {
    return `${skills.slice(0, -1).join(", ")}, and ${
      skills[skills.length - 1]
    }`;
  }
}

/**
 * Calculates the number of days between two dates
 * Useful for displaying project duration or time remaining
 */
export function getDaysBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  try {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error("Error calculating days between dates:", error);
    return 0;
  }
}

/**
 * Validates an email address format
 * Provides client-side validation for user input
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * Returns an object with validation results and feedback
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message: string;
  strength: "weak" | "medium" | "strong";
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
      strength: "weak",
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaCount = [
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  ].filter(Boolean).length;

  if (criteriaCount < 2) {
    return {
      isValid: false,
      message:
        "Password should include uppercase, lowercase, numbers, and special characters",
      strength: "weak",
    };
  } else if (criteriaCount < 3) {
    return {
      isValid: true,
      message: "Password strength: Medium",
      strength: "medium",
    };
  } else {
    return {
      isValid: true,
      message: "Password strength: Strong",
      strength: "strong",
    };
  }
}

/**
 * Debounces a function call to limit how often it can be executed
 * Useful for search inputs and API calls to improve performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Generates a random color for avatars or visual elements
 * Provides consistent color assignment based on a string seed
 */
export function generateAvatarColor(seed: string): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  // Create a simple hash from the seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to select a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Creates initials from a full name
 * Useful for avatar placeholders when no image is available
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Formats numbers with appropriate units (K, M, B)
 * Useful for displaying large numbers in dashboards
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Formats percentage values with appropriate precision
 * Ensures consistent percentage display across the application
 */
export function formatPercentage(value: number, precision: number = 1): string {
  return `${value.toFixed(precision)}%`;
}

/**
 * Sorts an array of objects by a specific property
 * Provides type-safe sorting functionality
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) {
      return direction === "asc" ? -1 : 1;
    }
    if (aVal > bVal) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Groups an array of objects by a specific property
 * Useful for organizing data in dashboards and reports
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}
