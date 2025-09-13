// lib/validators.ts
export function validateAcademicLevelYears(
  yearsData: unknown,
  levelId?: number
): number[] {
  let yearsArray: number[] = [];

  try {
    const parsedData =
      typeof yearsData === "string" ? JSON.parse(yearsData) : yearsData;

    if (!Array.isArray(parsedData)) {
      console.error(
        `Error: 'yearList' field for academic level ${
          levelId ?? "unknown"
        } is not an array. Found type: ${typeof parsedData}.`
      );
      return [];
    }

    yearsArray = parsedData.filter((item) => {
      if (typeof item !== "number") {
        console.error(
          `Error: 'yearList' array for academic level ${
            levelId ?? "unknown"
          } contains non-numeric values.`
        );
        return false;
      }
      return true;
    });
  } catch (e) {
    console.error(
      `Failed to parse 'yearList' field for academic level ${
        levelId ?? "unknown"
      }`
    );
    return [];
  }

  // Deduplicate and sort
  return Array.from(new Set(yearsArray)).sort((a, b) => a - b);
}
