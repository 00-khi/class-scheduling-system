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
import {
  TInstructor,
  TAcademicQualification,
} from "@/lib/types";
import {
  getInstructors,
  addInstructor,
  updateInstructor,
  deleteInstructor,
} from "@/services/instructorService";
import { getAcademicQualifications } from "@/services/academicQualificationService";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { Badge } from "@/ui/shadcn/badge";

export default function InstructorsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] =
    useState(null);

  // DATA STORE
  const [instructors, setInstructors] = useState([]);
  const [academicQualifications, setAcademicQualifications] = useState([]);

  // FETCH DATA
  const fetchData = async () => {
    setLoading(true);

    const [fetchedInstructors, fetchedAcademicQualifications] =
      await Promise.all([
        getInstructors(),
        getAcademicQualifications(),
      ]);

    setInstructors(fetchedInstructors);
    setAcademicQualifications(fetchedAcademicQualifications);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ADD DATA
  const handleAddInstructor = async (
    instructorData
  ) => {
    if (!instructorData.name) {
      toast.error("Instructor name is required");
      return false;
    }

    if (!instructorData.academicQualificationId) {
      toast.error("Academic Qualification is required");
      return false;
    }

    if (!instructorData.status) {
      toast.error("Instructor status is required");
      return false;
    }

    setIsSubmitting(true);
    try {
      await addInstructor(instructorData);

      toast.success("Instructor added successfully");

      fetchData();

      setIsAddDialogOpen(false);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error("Error adding instructor:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleUpdateInstructor = async (
    instructorData
  ) => {
    if (!instructorData.id) {
      toast.error("Invalid ID");
      return false;
    }

    setIsSubmitting(true);
    try {
      const { id, ...data } = instructorData;

      await updateInstructor(id, data);
      toast.success(`Instructor updated successfully`);

      fetchData();

      setIsEditDialogOpen(false);
      setEditingInstructor(null);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error("Error updating instructor:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteInstructor = async (id) => {
    setIsDeleting(true);
    try {
      if (!id) {
        toast.error("Error deleting instructor: Invalid ID");
        setIsDeleteDialogOpen(false);
        return;
      }
      const deleted = await deleteInstructor(id);
      if (deleted) {
        toast.success("Instructor deleted successfully");
        fetchData();

        setInstructorToDelete(null);

        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Failed to delete instructor");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast.error(msg);
      console.error("Error deleting instructor:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // DELETE SELECTED
  const handleDeleteSelectedInstructors = async (ids) => {
    setIsDeletingSelected(true);
    try {
      const deletePromises = ids.map((id) => deleteInstructor(id));
      const results = await Promise.allSettled(deletePromises);

      const successfulDeletions = results.filter(
        (result) => result.status === "fulfilled"
      ).length;

      const failedDeletions = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (successfulDeletions > 0) {
        toast.success(
          `${successfulDeletions} instructors deleted successfully.`
        );
      }

      if (failedDeletions > 0) {
        const failedReasons = results
          .filter((result) => result.status === "rejected")
          .map((result) => result.reason?.message || "Unknown error")
          .join(", ");
        toast.error(`Failed to delete ${failedDeletions} instructors. ${failedReasons}`);
        console.error("Failed deletion reasons:", failedReasons);
      }

      fetchData();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error.";
      toast.error(msg);
      console.error("Error during batch deletion process:", error);
    } finally {
      setIsDeletingSelected(false);
    }
  };

  const columns = [
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
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        return <Badge variant="secondary">{status}</Badge>;
      },
    },
    {
      header: "Academic Qualification",
      accessorKey: "academicQualification.name",
      cell: ({ row }) => {
        const qualification = row.original.academicQualification;
        return (
          <Badge variant="outline">
            {qualification ? qualification.name : "N/A"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions
          instructor={row.original}
          onEdit={(instructor) => {
            setEditingInstructor(instructor);
            setIsEditDialogOpen(true);
          }}
          onDelete={(instructor) => {
            setInstructorToDelete(instructor);
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
        <DataTable data={instructors} columns={columns}>
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
                onDeleteSelected={handleDeleteSelectedInstructors}
                isDeletingSelected={isDeletingSelected}
              />
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="-ms-1 opacity-60" size={16} />
                Add Instructor
              </Button>
            </div>
          </div>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      <InstructorForm
        academicQualifications={academicQualifications}
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddInstructor}
        isLoading={isSubmitting}
      />

      <InstructorForm
        academicQualifications={academicQualifications}
        item={editingInstructor || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingInstructor(null);
        }}
        onSubmit={handleUpdateInstructor}
        isLoading={isSubmitting}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (instructorToDelete?.id) {
            handleDeleteInstructor(instructorToDelete.id);
          }
        }}
        itemName={instructorToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}

function RowActions({
  instructor,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex justify-end gap-2">
      {/* Edit Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onEdit(instructor)}
      >
        <EditIcon size={16} />
      </Button>
      {/* Delete Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onDelete(instructor)}
      >
        <TrashIcon size={16} />
      </Button>
    </div>
  );
}

function InstructorForm({
  isOpen,
  item,
  onClose,
  onSubmit,
  isLoading,
  academicQualifications,
}) {
  const statusOptions = Object.keys(InstructorStatus).map((key) => ({
    label: key,
    value: InstructorStatus[key],
  }));

  const academicQualificationOptions = academicQualifications.map(
    (qualification) => ({
      label: qualification.name,
      value: qualification.id,
    })
  );

  return (
    <DataForm
      item={item}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={{
        add: "Add Instructor",
        edit: "Edit Instructor",
      }}
    >
      <DataForm.Input
        name="name"
        label="Name"
        placeholder="e.g., Jane Doe"
      />
      <DataForm.Select
        name="academicQualificationId"
        label="Academic Qualification"
        options={academicQualificationOptions}
      />
      <DataForm.Select
        name="status"
        label="Status"
        options={statusOptions}
      />
    </DataForm>
  );
}
