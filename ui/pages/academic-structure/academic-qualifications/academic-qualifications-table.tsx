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
import { IAcademicQualification, IInstructor } from "@/types";
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
import { getInstructors } from "@/services/instructorService";

export default function AcademicQualificationsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAcademicQualification, setEditingAcademicQualification] =
    useState<IAcademicQualification | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academicQualifications, setAcademicQualifications] = useState<IAcademicQualification[]>([]);
  const [instructors, setInstructors] = useState<IInstructor[]>([]);

  // 🆕 delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [academicQualificationToDelete, setAcademicQualificationToDelete] =
    useState<IAcademicQualification | null>(null);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setAcademicQualifications(getAcademicQualification());
      setInstructors(getInstructors());
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAcademicQualificationStats = (academicQualificationId: string) => {
    const instructorsCount = instructors.filter(
      (i) => i.academicQualificationId === academicQualificationId
    ).length;

    return { instructorsCount };
  };

  // ADD
  const handleAddAcademicQualification = async (
    academicQualificationData: Omit<IAcademicQualification, "_id">
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
      if (addAcademicQualification(academicQualificationData)) {
        toast.success(`Academic Qualification added successfully`);
        loadData();
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
  const handleUpdateAcademicQualification = async (academicQualificationData: IAcademicQualification) => {
    if (!academicQualificationData._id) {
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
      const { _id, ...data } = academicQualificationData;

      if (updateAcademicQualification(_id, data)) {
        toast.success(`Academic Qualification updated successfully`);
        loadData();
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
  const handleDeleteAcademicQualification = (id: string) => {
    try {
      if (!id) {
        toast.error("Error deleting academic qualification: Invalid ID");
        return;
      }
      if (deleteAcademicQualification(id)) {
        toast.success(`Academic Qualification deleted successfully`);
        loadData();
      } else {
        toast.error("Failed to delete academic qualification");
      }
    } catch (error) {
      toast.error("Error deleting academic qualification");
      console.error("Error deleting academic qualification:", error);
    }
  };

  const columns: ColumnDef<IAcademicQualification>[] = [
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
      cell: ({ row }) => {
        const stats = getAcademicQualificationStats(row.original._id || "");

        return <Badge variant="secondary">{stats.instructorsCount}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions
          academicQualification={row.original}
          onEdit={(dep) => {
            setEditingAcademicQualification(dep);
            setIsEditDialogOpen(true);
          }}
          onDelete={(dep) => {
            setAcademicQualificationToDelete(dep);
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
          if (academicQualificationToDelete?._id) {
            handleDeleteAcademicQualification(academicQualificationToDelete._id);
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
  onEdit: (dep: IAcademicQualification) => void;
  onDelete: (dep: IAcademicQualification) => void;
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
      title={{ add: "Add Academic Qualification", edit: "Edit Academic Qualification" }}
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
