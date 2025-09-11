"use client";

import { DataTable } from "@/ui/components/data-table";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  EllipsisIcon,
  PlusIcon,
  Loader2,
  EditIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import { Checkbox } from "@/ui/shadcn/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/shadcn/dropdown-menu";
import { IAcademicQualification } from "@/lib/types";
import {
  getAcademicQualification,
  addAcademicQualification,
  updateAcademicQualification,
  deleteAcademicQualification,
} from "@/services/academicQualificationService";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { Badge } from "@/ui/shadcn/badge";

export default function AcademicQualificationsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAcademicQualification, setEditingAcademicQualification] =
    useState<IAcademicQualification | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [academicQualificationToDelete, setAcademicQualificationToDelete] =
    useState<IAcademicQualification | null>(null);

  // DATA STORE
  const [academicQualifications, setAcademicQualifications] = useState<
    IAcademicQualification[]
  >([]);

  // FETCH DATA
  const fetchData = async () => {
    setLoading(true);

    const [fetchedAcademicQualifications] = await Promise.all([
      getAcademicQualification(),
    ]);

    setAcademicQualifications(fetchedAcademicQualifications);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ADD DATA
  const handleAddAcademicQualification = async (
    academicQualificationData: Omit<IAcademicQualification, "id">
  ) => {
    if (!academicQualificationData.code) {
      toast.error("Academic qualification code is required");
      return false;
    }

    if (!academicQualificationData.name) {
      toast.error("Academic qualification name is required");
      return false;
    }

    setIsSubmitting(true);
    try {
      await addAcademicQualification(academicQualificationData);

      toast.success("Academic qualification added successfully");

      fetchData();

      setIsAddDialogOpen(false);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error("Error adding academic qualification:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleUpdateAcademicQualification = async (
    academicQualificationData: IAcademicQualification
  ) => {
    if (!academicQualificationData.id) {
      toast.error("Invalid ID");
      return false;
    }

    if (!academicQualificationData.code) {
      toast.error("Academic qualification code is required");
      return false;
    }

    if (!academicQualificationData.name) {
      toast.error("Academic qualification name is required");
      return false;
    }

    setIsSubmitting(true);
    try {
      const { id, ...data } = academicQualificationData;

      await updateAcademicQualification(id, data);
      toast.success(`Academic qualification updated successfully`);

      fetchData();

      setIsEditDialogOpen(false);
      setEditingAcademicQualification(null);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error("Error updating academic qualification:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteAcademicQualification = async (id: number) => {
    setIsDeleting(true);
    try {
      if (!id) {
        toast.error("Error deleting academic qualification: Invalid ID");
        setIsDeleteDialogOpen(false);
        return;
      }
      const deleted = await deleteAcademicQualification(id);
      if (deleted) {
        toast.success("Academic qualification deleted successfully");
        fetchData();

        setAcademicQualificationToDelete(null);

        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Failed to delete academic qualification");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error("Error deleting academic qualification:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // DELETE SELECTED
  const handleDeleteSelectedAcademicQualifications = async (ids: number[]) => {
    setIsDeletingSelected(true);
    try {
      const deletePromises = ids.map((id) => deleteAcademicQualification(id));
      await Promise.all(deletePromises);
      toast.success(
        `${ids.length} academic qualifications deleted successfully.`
      );
      fetchData();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error.";
      toast.error(msg);
      console.error("Error deleting selected qualifications:", error);
    } finally {
      setIsDeletingSelected(false);
    }
  };

  type IAcademicQualificationRow = IAcademicQualification & {
    _count?: {
      instructors: number;
    };
  };

  const columns: ColumnDef<IAcademicQualificationRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Code",
      accessorKey: "code",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("code")}</Badge>
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      id: "instructors",
      header: "Instructors",
      accessorKey: "_count.instructors",
      cell: ({ row }) => {
        const count = row.original._count?.instructors ?? 0;
        return <Badge variant="secondary">{count}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions
          academicQualification={row.original}
          onEdit={(acadQual) => {
            setEditingAcademicQualification(acadQual);
            setIsEditDialogOpen(true);
          }}
          onDelete={(acadQual) => {
            setAcademicQualificationToDelete(acadQual);
            setIsDeleteDialogOpen(true);
          }}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading please wait...
          </span>
        </div>
      ) : (
        <DataTable data={academicQualifications} columns={columns}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.Search
                column="name"
                placeholder="Search"
                className="max-w-sm"
              />
              <DataTable.ClearFilters />
              <DataTable.ViewOptions />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.DeleteSelected
                onDeleteSelected={handleDeleteSelectedAcademicQualifications}
                isDeletingSelected={isDeletingSelected}
              />
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="-ms-1 opacity-60" size={16} />
                Add Academic Qualification
              </Button>
            </div>
          </div>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      <AcademicQualificationForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddAcademicQualification}
        isLoading={isSubmitting}
      />

      <AcademicQualificationForm
        item={editingAcademicQualification || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingAcademicQualification(null);
        }}
        onSubmit={handleUpdateAcademicQualification}
        isLoading={isSubmitting}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (academicQualificationToDelete?.id) {
            handleDeleteAcademicQualification(academicQualificationToDelete.id);
          }
        }}
        itemName={academicQualificationToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}

function RowActions({
  academicQualification,
  onEdit,
  onDelete,
}: {
  academicQualification: IAcademicQualification;
  onEdit: (acadQual: IAcademicQualification) => void;
  onDelete: (acadQual: IAcademicQualification) => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      {/* Edit Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onEdit(academicQualification)}
      >
        <EditIcon size={16} />
      </Button>
      {/* Delete Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onDelete(academicQualification)}
      >
        <TrashIcon size={16} />
      </Button>
    </div>
  );
}

function AcademicQualificationForm({
  isOpen,
  item,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  item?: IAcademicQualification;
  onClose: () => void;
  onSubmit: (data: IAcademicQualification) => void;
  isLoading?: boolean;
}) {
  return (
    <DataForm<IAcademicQualification>
      item={item}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={{
        add: "Add Academic Qualification",
        edit: "Edit Academic Qualification",
      }}
    >
      <DataForm.Input
        name="code"
        label="Academic Qualification Code"
        placeholder="e.g., IT"
      />
      <DataForm.Input
        name="name"
        label="Academic Qualification Name"
        placeholder="e.g., Information Technology"
      />
    </DataForm>
  );
}
