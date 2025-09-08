// lib/utils.ts

/**
 * Converts a string to uppercase.
 * @param str The string to convert.
 * @returns The uppercase string.
 */
export function toUppercase(str: string): string {
  return removeExtraSpaces(str.toUpperCase());
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalizeEachWord(str: string): string {
  if (!str) return "";
  return removeExtraSpaces(
    str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export function removeExtraSpaces(str: string): string {
  return str.trim().replace(/\s+/g, " ");
}
