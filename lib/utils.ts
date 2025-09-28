export function toUppercase(str: string): string {
  if (!str) return "";
  return removeExtraSpaces(str.toUpperCase());
}

export function capitalizeEachWord(str: string): string {
  if (!str) return "";

  return removeExtraSpaces(
    str
      .toLowerCase()
      .split(/([ _])/g) // keep spaces and underscores as separators
      .map((word) =>
        word === " " || word === "_"
          ? word
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("")
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

export function toLetters(num: number): string {
  let result = "";
  while (num >= 0) {
    result = String.fromCharCode((num % 26) + 65) + result;
    num = Math.floor(num / 26) - 1;
  }
  return result;
}

export function getNextLetters(
  existingNames: string[],
  courseCode: string,
  year: number
) {
  const used = existingNames.map((n) => n.replace(`${courseCode}${year}0`, ""));
  const letters: string[] = [];
  let counter = 0;

  while (letters.length < 50) {
    // limit
    const letter = toLetters(counter);
    if (!used.includes(letter)) letters.push(letter);
    counter++;
  }
  return letters;
}

export function replaceUnderscores(str: string): string {
  return str.replace(/_/g, " ");
}
