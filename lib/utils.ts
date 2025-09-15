export function toUppercase(str: string): string {
  if (!str) return "";
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

export function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  const cleaned = removeExtraSpaces(str.toLowerCase());
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function removeExtraSpaces(str: string): string {
  if (!str) return "";
  return str.trim().replace(/\s+/g, " ");
}

export function splitCamelCaseAndNumbers(str: string): string {
  if (!str) return "";
  const spaced = str
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([0-9])([A-Za-z])/g, "$1 $2");
  return capitalizeEachWord(spaced);
}
