export function toUppercase(str: string): string {
  if (!str) return "";
  return removeExtraSpaces(str.toUpperCase());
}

export function capitalizeEachWord(str: string): string {
  if (!str) return "";

  if (str === "n/a" || str === "N/a" || str === "n/A") return "N/A";

  const minorWords = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "from",
    "if",
    "in",
    "into",
    "like",
    "near",
    "nor",
    "of",
    "off",
    "on",
    "onto",
    "or",
    "over",
    "past",
    "per",
    "plus",
    "so",
    "than",
    "that",
    "the",
    "to",
    "up",
    "upon",
    "via",
    "with",
    "when",
    "yet",
    "is",
    "was",
    "be",
    "been",
    "being",
    "do",
    "does",
    "did",
    "has",
    "have",
    "had",
    "will",
    "would",
    "should",
    "could",
    "might",
    "must",
  ]);

  return removeExtraSpaces(
    str.replace(/[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*/g, (word, index) => {
      const isAllUpper = /^[^a-z]*$/.test(word);
      if (isAllUpper) return word; // keep acronyms

      const lower = word.toLowerCase();
      const isFirst = index === 0;

      if (!isFirst && minorWords.has(lower)) return lower;

      // capitalize word and preserve dot-separated parts like P.E
      return lower
        .split(".")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(".");
    })
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
