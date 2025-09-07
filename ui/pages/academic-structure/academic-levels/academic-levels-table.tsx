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
import { IAcademicLevel } from "@/types";
import {
  getAcademicLevels,
  addAcademicLevel,
  updateAcademicLevel,
  deleteAcademicLevel,
} from "@/services/academicLevelService";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { Badge } from "@/shadcn/components/ui/badge";

export default function AcademicLevelsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAcademicLevel, setEditingAcademicLevel] =
    useState<IAcademicLevel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academicLevels, setAcademicLevels] = useState<IAcademicLevel[]>([]);

  // 🆕 delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [academicLevelToDelete, setAcademicLevelToDelete] =
    useState<IAcademicLevel | null>(null);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setAcademicLevels(getAcademicLevels());
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD
  const handleAddAcademicLevel = async (academicLevelData: Omit<IAcademicLevel, "id">) => {
    setIsSubmitting(true);
    try {
      if (!academicLevelData.name) {
        toast.error("Academic level name is required");
        return;
      }

      if (addAcademicLevel(academicLevelData)) {
        toast.success(`Academic level added successfully`);
        loadData();
      } else {
        toast.error("Failed to add academic level");
      }
      setIsAddDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleUpdateAcademicLevel = async (academicLevelData: IAcademicLevel) => {
    if (!academicLevelData.id) return;
    setIsSubmitting(true);
    try {
      if (!academicLevelData.code) {
        toast.error("Academic level code is required");
      }

      if (!academicLevelData.name) {
        toast.error("Academic level name is required");
        return;
      }

      const { id: id, ...data } = academicLevelData;

      if (
        updateAcademicLevel(id, data)
      ) {
        toast.success(`Academic level updated successfully`);
        loadData();
      } else {
        toast.error("Failed to update academic level");
      }

      setIsEditDialogOpen(false);
      setEditingAcademicLevel(null);
    } catch (error) {
      toast.error("Error updating academic level");
      console.error("Error updating academic level:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteAcademicLevel = (id: string) => {
    try {
      if (!id) {
        toast.error("Error deleting academic level: Invalid ID");
        return;
      }
      if (deleteAcademicLevel(id)) {
        toast.success(`Academic level deleted successfully`);
        loadData();
      } else {
        toast.error("Failed to delete academic level");
      }
    } catch (error) {
      toast.error("Error deleting academic level");
      console.error("Error deleting academic level:", error);
    }
  };

  const columns: ColumnDef<IAcademicLevel>[] = [
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
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions
          academicLevel={row.original}
          onEdit={(acadLevel) => {
            setEditingAcademicLevel(acadLevel);
            setIsEditDialogOpen(true);
          }}
          onDelete={(acadLevel) => {
            setAcademicLevelToDelete(acadLevel);
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
        <DataTable data={academicLevels} columns={columns}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.Search
                column="name"
                placeholder="Search academic level..."
                className="max-w-sm"
              />
              <DataTable.ClearFilters />
              <DataTable.ViewOptions />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.DeleteSelected
                onDeleteSelected={(ids) => {
                  ids.forEach((id) => handleDeleteAcademicLevel(id));
                }}
              />
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="-ms-1 opacity-60" size={16} />
                Add Academic Level
              </Button>
            </div>
          </div>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      <AcademicLevelForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddAcademicLevel}
        isLoading={isSubmitting}
      />

      <AcademicLevelForm
        item={editingAcademicLevel || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingAcademicLevel(null);
        }}
        onSubmit={handleUpdateAcademicLevel}
        isLoading={isSubmitting}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (academicLevelToDelete?.id) {
            handleDeleteAcademicLevel(academicLevelToDelete.id);
          }
          setIsDeleteDialogOpen(false);
          setAcademicLevelToDelete(null);
        }}
        itemName={academicLevelToDelete?.name}
      />
    </div>
  );
}

function RowActions({
  academicLevel,
  onEdit,
  onDelete,
}: {
  academicLevel: IAcademicLevel;
  onEdit: (acadLevel: IAcademicLevel) => void;
  onDelete: (acadLevel: IAcademicLevel) => void;
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
        <DropdownMenuItem onClick={() => onEdit(academicLevel)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(academicLevel)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AcademicLevelForm({
  isOpen,
  item,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  item?: IAcademicLevel;
  onClose: () => void;
  onSubmit: (data: IAcademicLevel) => void;
  isLoading?: boolean;
}) {
  return (
    <DataForm<IAcademicLevel>
      item={item}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={{ add: "Add Academic Level", edit: "Edit Academmic Level" }}
    >
      <DataForm.Input
        name="code"
        label="Academic Level Code"
        placeholder="e.g., JHS, SHS, TER"
        required
      />
      <DataForm.Input
        name="name"
        label="Academic Level Name"
        placeholder="e.g., Junior Highschool, Senior Highschool, Tertiary"
        required
      />
    </DataForm>
  );
}
