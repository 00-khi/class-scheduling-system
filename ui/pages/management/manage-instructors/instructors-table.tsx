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
  getInstructors,
  addInstructor,
  updateInstructor,
  deleteInstructor,
} from "@/services/instructorService";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { getAcademicQualification } from "@/services/academicQualificationService";
import { Badge } from "@/shadcn/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shadcn/components/ui/tooltip";

export default function InstructorsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] =
    useState<IInstructor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructors, setInstructors] = useState<IInstructor[]>([]);
  const [academicQualifications, setAcademicQualifications] = useState<
    IAcademicQualification[]
  >([]);

  // 🆕 delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] =
    useState<IInstructor | null>(null);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setInstructors(getInstructors());
      setAcademicQualifications(getAcademicQualification());
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD
  const handleAddInstructor = async (
    instructorData: Omit<IInstructor, "_id">
  ) => {
    setIsSubmitting(true);
    try {
      if (!instructorData.name) {
        toast.error("Instructor name is required");
        return;
      }

      if (!instructorData.academicQualificationId) {
        toast.error("Academic Qualification is required");
        return;
      }

      if (!instructorData.status) {
        toast.error("Status is required");
        return;
      }

      if (addInstructor(instructorData)) {
        toast.success(`Instructor added successfully`);
        loadData();
      } else {
        toast.error("Failed to add instructor");
      }
      setIsAddDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleUpdateInstructor = async (instructorData: IInstructor) => {
    if (!instructorData._id) return;
    setIsSubmitting(true);
    try {
      if (!instructorData.name) {
        toast.error("Instructor name is required");
        return;
      }

      if (!instructorData.academicQualificationId) {
        toast.error("Academic Qualification is required");
        return;
      }

      if (!instructorData.status) {
        toast.error("Status is required");
        return;
      }

      const { _id, ...data } = instructorData;

      if (updateInstructor(_id, data)) {
        toast.success(`Instructor updated successfully`);
        loadData();
      } else {
        toast.error("Failed to update instructor");
      }

      setIsEditDialogOpen(false);
      setEditingInstructor(null);
    } catch (error) {
      toast.error("Error updating instructor");
      console.error("Error updating instructor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteInstructor = (id: string) => {
    try {
      if (!id) {
        toast.error("Error deleting instructor");
        return;
      }
      if (deleteInstructor(id)) {
        toast.success(`Instructor deleted successfully`);
        loadData();
      } else {
        toast.error("Failed to delete instructor");
      }
    } catch (error) {
      toast.error("Error deleting instructor");
      console.error("Error deleting instructor:", error);
    }
  };

  const getAcademicQualificationName = (academicQualificationId: string) => {
    const acadQual = academicQualifications.find(
      (d) => d._id === academicQualificationId
    );
    return acadQual ? acadQual.name : "Unknown";
  };

  const getAcademicQualificationCode = (academicQualificationId: string) => {
    const acadQual = academicQualifications.find(
      (d) => d._id === academicQualificationId
    );
    return acadQual ? acadQual.code : "Unknown";
  };

  const columns: ColumnDef<IInstructor>[] = [
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
      enableHiding: false,
    },
    {
      header: "Academic Qualification",
      accessorKey: "academicQualificationId",
      cell: ({ row }) => {
        const academicQualificationId = row.getValue<string>(
          "academicQualificationId"
        );
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">
                {getAcademicQualificationCode(academicQualificationId)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {getAcademicQualificationName(academicQualificationId)}
            </TooltipContent>
          </Tooltip>
        );
      },
      filterFn: "equals",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        return <Badge variant="secondary">{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions
          instructor={row.original}
          onEdit={(ins) => {
            setEditingInstructor(ins);
            setIsEditDialogOpen(true);
          }}
          onDelete={(ins) => {
            setInstructorToDelete(ins);
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
                placeholder="Search instructors..."
                className="max-w-sm"
              />
              <DataTable.Filter
                column="academicQualificationId"
                placeholder="All academic qualifications"
                renderValue={(id) => {
                  const acadQual = academicQualifications.find(
                    (d) => d._id === id
                  );
                  return acadQual ? acadQual.name : "Unknown";
                }}
              />
              <DataTable.Filter column="status" placeholder="All statuses" />
              <DataTable.ClearFilters />
              <DataTable.ViewOptions />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.DeleteSelected
                onDeleteSelected={(ids) => {
                  ids.forEach((id) => handleDeleteInstructor(id));
                }}
              />
              {/* Add Button */}
              <Button
                variant="default"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Add Instructor
              </Button>
            </div>
          </div>

          {/* Table */}
          <DataTable.Content />

          {/* Pagination */}
          <DataTable.Pagination />
        </DataTable>
      )}

      <InstructorForm
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
        }}
        onSubmit={handleAddInstructor}
        isLoading={isSubmitting}
        academicQualifications={academicQualifications}
      />

      <InstructorForm
        item={editingInstructor || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingInstructor(null);
        }}
        onSubmit={handleUpdateInstructor}
        isLoading={isSubmitting}
        academicQualifications={academicQualifications}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (instructorToDelete?._id) {
            handleDeleteInstructor(instructorToDelete._id);
          }
          setIsDeleteDialogOpen(false);
          setInstructorToDelete(null);
        }}
        itemName={instructorToDelete?.name}
      />
    </div>
  );
}

function RowActions({
  instructor,
  onEdit,
  onDelete,
}: {
  instructor: IInstructor;
  onEdit: (ins: IInstructor) => void;
  onDelete: (ins: IInstructor) => void;
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
        <DropdownMenuItem onClick={() => onEdit(instructor)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(instructor)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InstructorForm({
  isOpen,
  item,
  onClose,
  onSubmit,
  isLoading,
  academicQualifications,
}: {
  isOpen: boolean;
  item?: IInstructor;
  onClose: () => void;
  onSubmit: (data: IInstructor) => void;
  isLoading?: boolean;
  academicQualifications: IAcademicQualification[];
}) {
  return (
    <DataForm<IInstructor>
      item={item}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={{ add: "Add Instructor", edit: "Edit Instructor" }}
    >
      <DataForm.Input
        name="name"
        label="Instructor Name"
        placeholder="Enter instructor name"
        required
      />
      <DataForm.Select
        name="academicQualificationId"
        label="Academic Qualification"
        required
        options={academicQualifications.map((acadQual) => ({
          label: acadQual.name,
          value: acadQual._id ?? "",
        }))}
      />
      <DataForm.Select
        name="status"
        label="Status"
        required
        options={[
          { label: "PT", value: "PT" },
          { label: "PTFL", value: "PTFL" },
          { label: "PROBY", value: "PROBY" },
          { label: "FT", value: "FT" },
        ]}
      />
    </DataForm>
  );
}
