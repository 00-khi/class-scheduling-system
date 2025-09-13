// apiClient.ts
export function createApiClient<T>(baseUrl: string) {
  return {
    async getAll(): Promise<T[]> {
      const response = await fetch(baseUrl);
      const data = await response.json();

      if (!response.ok) {
        const msg = data.error ?? `Service Error: Failed to fetch list.`;
        throw new Error(msg);
      }

      return data;
    },

    async getById(id: number): Promise<T> {
      const response = await fetch(`${baseUrl}/${id}`);

      if (response.status === 404) {
        throw new Error("Item not found.");
      }

      const data = await response.json();

      if (!response.ok) {
        const msg =
          data.error ?? `Service Error: Failed to fetch item with ID ${id}.`;
        throw new Error(msg);
      }

      return data;
    },

    async add(item: Omit<T, "id">): Promise<T> {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error ?? `Service Error: Failed to add item.`;
        throw new Error(msg);
      }

      return data;
    },

    async update(id: number, item: Partial<T>): Promise<T> {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (response.status === 404) {
        throw new Error("Item not found.");
      }

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error ?? `Service Error: Failed to update item.`;
        throw new Error(msg);
      }

      return data;
    },

    async delete(id: number): Promise<boolean> {
      const response = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });

      if (response.status === 404) {
        throw new Error("Item not found.");
      }

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error ?? `Service Error: Failed to delete item.`;
        throw new Error(msg);
      }

      return true;
    },
  };
}
