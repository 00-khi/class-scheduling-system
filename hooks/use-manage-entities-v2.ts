import { useState, useEffect } from "react";
import { toast } from "sonner";

// Define a generic type for the entity
type Entity = {
  id: number;
};

interface ApiService<T> {
  fetch: () => Promise<T[]>;
  add?: (data: Omit<T, "id">) => Promise<T>;
  update?: (id: number, data: Omit<T, "id">) => Promise<T>;
  delete?: (id: number) => Promise<T>;
  deleteMany?: (ids: number[]) => Promise<T>;
}

interface UseManageEntitiesProps<T> {
  apiService: ApiService<T>;
  relatedApiServices?: {
    key: string;
    fetch: () => Promise<any[]>;
  }[]; // For fetching related datas
}

export function useManageEntities<T extends Entity>({
  apiService,
  relatedApiServices = [], // Default to an empty array,
}: UseManageEntitiesProps<T>) {
  // State for all CRUD operations
  const [data, setData] = useState<T[]>([]);
  const [relatedData, setRelatedData] = useState<Record<string, any[]>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] =
    useState(false);

  const [failedDialogOpen, setFailedDialogOpen] = useState(false);
  const [failedReasons, setFailedReasons] = useState<string[]>([]);
  const [failedCount, setFailedCount] = useState(0);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const relatedPromises = relatedApiServices.map((service) =>
        service.fetch()
      );
      const [fetchedData, ...fetchedRelatedData] = await Promise.all([
        apiService.fetch(),
        ...relatedPromises,
      ]);

      const newRelatedData: Record<string, any[]> = {};
      fetchedRelatedData.forEach((data, index) => {
        const key = relatedApiServices[index].key;
        newRelatedData[key] = data;
      });

      setData(fetchedData);
      setRelatedData(newRelatedData);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    // Return all state and handlers
    data,

    relatedData,

    isLoading,

    isSubmitting,
    setIsSubmitting,

    isDeleting,
    setIsDeleting,

    isDeletingSelected,
    setIsDeletingSelected,

    isFormDialogOpen,
    setIsFormDialogOpen,

    isDeleteDialogOpen,
    setIsDeleteDialogOpen,

    isDeleteSelectedDialogOpen,
    setIsDeleteSelectedDialogOpen,

    failedDialogOpen,
    setFailedDialogOpen,

    failedReasons,
    setFailedReasons,

    failedCount,
    setFailedCount,

    fetchData,
  };
}
