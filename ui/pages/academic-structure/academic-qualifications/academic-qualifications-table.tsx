"use client";

import { DataTable } from "@/ui/components/data-table";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisIcon, PlusIcon, Loader2 } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu";
import { IAcademicQualification, IAcademicQualificationRow } from "@/types";
import {
  getAcademicQualification,
  addAcademicQualification,
  updateAcademicQualification,
  deleteAcademicQualification,
} from "@/services/academicQualificationService";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { Badge } from "@/shadcn/components/ui/badge";

export default function AcademicQualificationsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAcademicQualification, setEditingAcademicQualification] =
    useState<IAcademicQualification | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  console.log(academicQualifications);

  // ADD DATA
  const handleAddAcademicQualification = async (
    academicQualificationData: Omit<IAcademicQualification, "id">
  ) => {
    if (!academicQualificationData.code) {
      toast.error("Academic Qualification code is required");
      return false;
    }

    if (!academicQualificationData.name) {
      toast.error("Academic Qualification name is required");
      return false;
    }

    setIsSubmitting(true);
    try {
      const added = await addAcademicQualification(academicQualificationData);

      if (added) {
        toast.success(`Academic Qualification added successfully`);
        fetchData();
        setIsAddDialogOpen(false);
      } else {
        toast.error("Failed to add academic qualification");
        return false;
      }
    } finally {
      setIsSubmitting(false);
      return true;
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
      toast.error("Academic Qualification code is required");
      return false;
    }

    if (!academicQualificationData.name) {
      toast.error("Academic Qualification name is required");
      return false;
    }

    setIsSubmitting(true);
    try {
      const { id: id, ...data } = academicQualificationData;

      const updated = await updateAcademicQualification(id, data);

      if (updated) {
        toast.success(`Academic Qualification updated successfully`);
        fetchData();
      } else {
        toast.error("Failed to update academic qualification");
      }

      setIsEditDialogOpen(false);
      setEditingAcademicQualification(null);
    } catch (error) {
      toast.error("Error updating academic qualification");
      console.error("Error updating academic qualification:", error);
    } finally {
      setIsSubmitting(false);
      return true;
    }
  };

  // DELETE
  const handleDeleteAcademicQualification = async (id: string) => {
    try {
      if (!id) {
        toast.error("Error deleting academic qualification: Invalid ID");
        return;
      }
      const deleted = await deleteAcademicQualification(id);

      if (deleted) {
        toast.success(`Academic Qualification deleted successfully`);
        fetchData();
      } else {
        toast.error("Failed to delete academic qualification");
      }
    } catch (error) {
      toast.error("Error deleting academic qualification");
      console.error("Error deleting academic qualification:", error);
    }
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
      accessorFn: (row) => row._count?.instructors ?? 0,
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
                onDeleteSelected={(ids) => {
                  ids.forEach((id) => handleDeleteAcademicQualification(id));
                }}
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
          setIsDeleteDialogOpen(false);
          setAcademicQualificationToDelete(null);
        }}
        itemName={academicQualificationToDelete?.name}
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="shadow-none">
            <EllipsisIcon size={16} />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(academicQualification)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(academicQualification)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
        required
      />
      <DataForm.Input
        name="name"
        label="Academic Qualification Name"
        placeholder="e.g., Information Technology"
        required
      />
    </DataForm>
  );
}
