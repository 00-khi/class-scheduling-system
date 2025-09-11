import { toast } from "sonner";

export async function handleAddEntity<T>(
  entityName: string,
  data: Omit<T, "id">,
  addFn: (data: Omit<T, "id">) => Promise<T>,
  fetchData: () => void,
  setIsSubmitting: (loading: boolean) => void,
  setIsDialogOpen: (open: boolean) => void,
  validate: (data: Omit<T, "id">, requiredId: boolean) => boolean
) {
  if (!validate(data, false)) return false;

  setIsSubmitting(true);

  try {
    await addFn(data);

    toast.success(`${entityName} added successfully`);

    fetchData();

    setIsDialogOpen(false);

    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    toast.error(msg);
    console.error(`Error adding ${entityName}:`, error);
    return false;
  } finally {
    setIsSubmitting(false);
  }
}

export async function handleUpdateEntity<T extends { id: number }>(
  entityName: string,
  data: T,
  updateFn: (id: number, updates: Partial<Omit<T, "id">>) => Promise<T>,
  fetchData: () => void,
  setIsSubmitting: (loading: boolean) => void,
  closeEdit: () => void,
  validate: (data: T, requiredId: boolean) => boolean
) {
  if (!validate(data, false)) return false;

  setIsSubmitting(true);

  try {
    const { id, ...rest } = data;

    await updateFn(id, rest);

    toast.success(`${entityName} updated successfully`);

    fetchData();

    closeEdit();

    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    toast.error(msg);
    console.error(`Error updating ${entityName}:`, error);
    return false;
  } finally {
    setIsSubmitting(false);
  }
}

export async function handleDeleteEntity(
  entityName: string,
  id: number,
  deleteFn: (id: number) => Promise<boolean>,
  fetchData: () => void,
  setIsDeleting: (loading: boolean) => void,
  closeDialog: () => void
) {
  if (!id) {
    toast.error(`Error deleting ${entityName}: Invalid ID`);
    closeDialog();
    return;
  }

  setIsDeleting(true);
  try {
    const deleted = await deleteFn(id);

    if (deleted) {
      toast.success(`${entityName} deleted successfully`);

      fetchData();

      closeDialog();
    } else {
      toast.error(`Failed to delete ${entityName}`);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    toast.error(msg);
    console.error(`Error deleting ${entityName}:`, error);
  } finally {
    setIsDeleting(false);
  }
}

export async function handleDeleteSelectedEntities(
  entityName: string,
  ids: number[],
  deleteFn: (id: number) => Promise<boolean>,
  fetchData: () => void,
  setIsDeletingSelected: (loading: boolean) => void,
  setFailedReasons: (reasons: string[]) => void,
  setFailedCount: (count: number) => void,
  setFailedDialogOpen: (open: boolean) => void
) {
  setIsDeletingSelected(true);

  try {
    const deletePromises = ids.map((id) => deleteFn(id));
    const results = await Promise.allSettled(deletePromises);

    const successfulDeletions = results.filter(
      (result) => result.status === "fulfilled"
    ).length;

    const failedDeletions = results.filter(
      (result) => result.status === "rejected"
    ).length;

    if (successfulDeletions > 0) {
      toast.success(
        `${successfulDeletions} ${entityName} deleted successfully.`
      );
    }

    if (failedDeletions > 0) {
      const failedReasons = results
        .filter((result) => result.status === "rejected")
        .map((result) => (result as PromiseRejectedResult).reason.message);

      setFailedReasons(failedReasons);
      setFailedCount(failedDeletions);
      setFailedDialogOpen(true);
    }

    fetchData();
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error.";
    toast.error(msg);
    console.error("Error during batch deletion process:", error);
  } finally {
    setIsDeletingSelected(false);
  }
}
