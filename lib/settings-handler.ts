type Setting = {
  id: number;
  key: string;
  value: string;
};

// get all settings
export async function getSettings(): Promise<Setting[]> {
  const res = await fetch("/api/settings", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

// update or create setting
export async function updateSetting(
  key: string,
  value: string
): Promise<Setting> {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Failed to update setting");
  return data;
}
