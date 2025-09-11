"use client";

import {
  handleAddEntity,
  handleDeleteEntity,
  handleDeleteSelectedEntities,
  handleUpdateEntity,
} from "@/lib/crud-handler";
import { TAcademicQualification, TInstructor } from "@/lib/types";
import { getAcademicQualifications } from "@/services/academicQualificationService";
import {
  addInstructor,
  deleteInstructor,
  getInstructors,
  updateInstructor,
} from "@/services/instructorService";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { DataTable } from "@/ui/components/data-table";
import {
  DataTableSection,
  DataTableSkeleton,
  DataTableToolbar,
  DataTableToolbarGroup,
} from "@/ui/components/data-table-components";
import { EntityForm } from "@/ui/components/entity-form";
import { FailedDeletionDialog } from "@/ui/components/failed-deletion-dialog";
import { RowActions } from "@/ui/components/row-actions";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/tooltip";
import { InstructorStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function InstructorsTable() {
  const ENTITY_NAME = "Instructor";

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] =
    useState<TInstructor | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] =
    useState<TInstructor | null>(null);

  const [failedDialogOpen, setFailedDialogOpen] = useState(false);
  const [failedReasons, setFailedReasons] = useState<string[]>([]);
  const [failedCount, setFailedCount] = useState(0);

  // DATA STORE
  const [instructors, setInstructors] = useState<TInstructor[]>([]);
  const [academicQualifications, setAcademicQualifications] = useState<
    TAcademicQualification[]
  >([]);

  // FETCH DATA
  const fetchData = async () => {
    setLoading(true);

    const [fetchedInstructors, fetchedAcademicQualifications] =
      await Promise.all([getInstructors(), getAcademicQualifications()]);

    setInstructors(fetchedInstructors);
    setAcademicQualifications(fetchedAcademicQualifications);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateInstructor = (
    data: Partial<TInstructor>,
    requireId = false
  ): boolean => {
    if (requireId && !data.id) {
      toast.error("Invalid ID");
      return false;
    }

    if (!data.name) {
      toast.error(`${ENTITY_NAME} Name is required.`);
      return false;
    }

    if (!data.academicQualificationId) {
      toast.error(`Academic Qualifications is required.`);
      return false;
    }

    if (!data.status) {
      toast.error(`Status is required.`);
      return false;
    }

    return true;
  };

  type TInstructorRow = TInstructor & {
    academicQualification?: TAcademicQualification;
  };

  const columns: ColumnDef<TInstructorRow>[] = [
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
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("status")}</Badge>
      ),
    },
    {
      header: "Academic Qualification",
      accessorFn: (row) => row.academicQualification?.name || "N/A",
      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline">
                {row.original.academicQualification?.code || "N/A"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.academicQualification?.name || "N/A"}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions
          item={row.original}
          onEdit={(item) => {
            setEditingInstructor(item);
            setIsEditDialogOpen(true);
          }}
          onDelete={(item) => {
            setInstructorToDelete(item);
            setIsDeleteDialogOpen(true);
          }}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];

  const academicQualificationOptions = academicQualifications.map((aq) => ({
    label: aq.name,
    value: String(aq.id),
  }));

  const statusOptions = Object.values(InstructorStatus).map((status) => ({
    value: status,
    label: status,
    // label: formatStatusLabel(status),
  }));

  // function formatStatusLabel(status: InstructorStatus): string {
  //   switch (status) {
  //     case "PT":
  //       return "Part-Time";
  //     case "PTFL":
  //       return "Part-Time (Full Load)";
  //     case "PROBY":
  //       return "Probationary";
  //     case "FT":
  //       return "Full-Time";
  //     default:
  //       return status;
  //   }
  // }

  return (
    <DataTableSection>
      {loading ? (
        <DataTableSkeleton columnCount={4} rowCount={5} />
      ) : (
        <DataTable data={instructors} columns={columns}>
          <DataTableToolbar>
            <DataTableToolbarGroup>
              <DataTable.Search
                column="name"
                placeholder="Search"
                className="max-w-sm"
              />
              <DataTable.ClearFilters />
              <DataTable.ViewOptions />
            </DataTableToolbarGroup>
            <DataTableToolbarGroup>
              <DataTable.DeleteSelected
                onDeleteSelected={(ids) => {
                  return handleDeleteSelectedEntities(
                    ENTITY_NAME,
                    ids,
                    deleteInstructor,
                    fetchData,
                    setIsDeletingSelected,
                    setFailedReasons,
                    setFailedCount,
                    setFailedDialogOpen
                  );
                }}
                isDeletingSelected={isDeletingSelected}
              />
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="-ms-1 opacity-60" size={16} />
                Add {ENTITY_NAME}
              </Button>
            </DataTableToolbarGroup>
          </DataTableToolbar>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      {/* Add Form */}
      <EntityForm<Omit<TInstructor, "id">>
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={(data) => {
          return handleAddEntity(
            ENTITY_NAME,
            data,
            addInstructor,
            fetchData,
            setIsSubmitting,
            setIsAddDialogOpen,
            validateInstructor
          );
        }}
        isLoading={isSubmitting}
        title={`Add ${ENTITY_NAME}`}
      >
        <DataForm.Input
          name="name"
          label={`${ENTITY_NAME} Name`}
          placeholder="e.g., Joe Smith"
        />
        <DataForm.Select
          name="status"
          label="Status"
          placeholder="Select status"
          options={statusOptions}
        />
        <DataForm.Select
          name="academicQualificationId"
          label="Academic Qualification"
          placeholder="Select qualification"
          options={academicQualificationOptions}
        />
      </EntityForm>

      {/* Edit Form */}
      <EntityForm
        item={editingInstructor || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingInstructor(null);
        }}
        onSubmit={(data) => {
          return handleUpdateEntity(
            ENTITY_NAME,
            data,
            updateInstructor,
            fetchData,
            setIsSubmitting,
            () => {
              setIsEditDialogOpen(false);
              setEditingInstructor(null);
            },
            validateInstructor
          );
        }}
        isLoading={isSubmitting}
        title={`Edit ${ENTITY_NAME}`}
      >
        <DataForm.Input
          name="name"
          label={`${ENTITY_NAME} Name`}
          placeholder="e.g., Joe Smith"
        />
        <DataForm.Select
          name="status"
          label="Status"
          placeholder="Select status"
          options={statusOptions}
        />
        <DataForm.Select
          name="academicQualificationId"
          label="Academic Qualification"
          placeholder="Select qualification"
          options={academicQualificationOptions}
        />
      </EntityForm>

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (instructorToDelete?.id) {
            return handleDeleteEntity(
              ENTITY_NAME,
              instructorToDelete.id,
              deleteInstructor,
              fetchData,
              setIsDeleting,
              () => {
                setInstructorToDelete(null);
                setIsDeleteDialogOpen(false);
              }
            );
          }
        }}
        itemName={instructorToDelete?.name}
        isDeleting={isDeleting}
      />

      <FailedDeletionDialog
        open={failedDialogOpen}
        onClose={() => setFailedDialogOpen(false)}
        failedCount={failedCount}
        failedReasons={failedReasons}
      />
    </DataTableSection>
  );
}
