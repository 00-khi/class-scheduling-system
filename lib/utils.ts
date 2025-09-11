export function toUppercase(str: string): string {
  return removeExtraSpaces(str.toUpperCase());
}

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
