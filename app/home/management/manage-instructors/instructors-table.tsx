"use client";

import {
  handleAddEntity,
  handleDeleteEntity,
  handleDeleteSelectedEntities,
  handleUpdateEntity,
} from "@/lib/crud-handler";
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
  getActionsColumn,
  getSelectColumn,
} from "@/ui/components/data-table-columns";
import {
  DataTableSection,
  DataTableSkeleton,
  DataTableToolbar,
  DataTableToolbarGroup,
} from "@/ui/components/data-table-components";
import { EntityForm } from "@/ui/components/entity-form";
import { FailedDeletionDialog } from "@/ui/components/failed-deletion-dialog";
import { Badge } from "@/ui/shadcn/badge";
import { Button } from "@/ui/shadcn/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shadcn/tooltip";
import { AcademicQualification, Instructor, InstructorStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useManageEntities } from "@/hooks/use-manage-entities";

export default function InstructorsTable() {
  const ENTITY_NAME = "Instructor";

  const entityManagement = useManageEntities<Instructor>({
    apiService: { fetch: getInstructors },
    relatedApiServices: [
      { key: "academicQualifications", fetch: getAcademicQualifications },
    ],
  });

  const academicQualifications =
    entityManagement.relatedData.academicQualifications || [];

  const validateInstructor = (
    data: Partial<Instructor>,
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

  type InstructorRow = Instructor & {
    academicQualification?: AcademicQualification;
  };

  const columns: ColumnDef<InstructorRow>[] = [
    getSelectColumn<InstructorRow>(),
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
      id: "academicQualification",
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
    getActionsColumn<InstructorRow>({
      onEdit: (item) => {
        entityManagement.setEditingItem(item);
        entityManagement.setIsEditDialogOpen(true);
      },
      onDelete: (item) => {
        entityManagement.setItemToDelete(item);
        entityManagement.setIsDeleteDialogOpen(true);
      },
    }),
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
      {entityManagement.loading ? (
        <DataTableSkeleton columnCount={4} rowCount={5} />
      ) : (
        <DataTable data={entityManagement.data} columns={columns}>
          <DataTableToolbar>
            <DataTableToolbarGroup>
              <DataTable.Search
                column="name"
                placeholder="Search"
                className="max-w-sm"
              />
              <DataTable.Filter column="status" placeholder="All statuses" />
              <DataTable.Filter
                column="academicQualification"
                placeholder="All academic qualifications"
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
                    entityManagement.fetchData,
                    entityManagement.setIsDeletingSelected,
                    entityManagement.setFailedReasons,
                    entityManagement.setFailedCount,
                    entityManagement.setFailedDialogOpen
                  );
                }}
                isDeletingSelected={entityManagement.isDeletingSelected}
              />
              <Button onClick={() => entityManagement.setIsAddDialogOpen(true)}>
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
      <EntityForm<Instructor>
        isOpen={entityManagement.isAddDialogOpen}
        onClose={() => entityManagement.setIsAddDialogOpen(false)}
        onSubmit={(data) => {
          return handleAddEntity(
            ENTITY_NAME,
            data,
            addInstructor,
            entityManagement.fetchData,
            entityManagement.setIsSubmitting,
            entityManagement.setIsAddDialogOpen,
            validateInstructor
          );
        }}
        isLoading={entityManagement.isSubmitting}
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
      <EntityForm<Instructor>
        item={entityManagement.editingItem || undefined}
        isOpen={entityManagement.isEditDialogOpen}
        onClose={() => {
          entityManagement.setIsEditDialogOpen(false);
          entityManagement.setEditingItem(null);
        }}
        onSubmit={(data) => {
          return handleUpdateEntity(
            ENTITY_NAME,
            data,
            updateInstructor,
            entityManagement.fetchData,
            entityManagement.setIsSubmitting,
            () => {
              entityManagement.setIsEditDialogOpen(false);
              entityManagement.setEditingItem(null);
            },
            validateInstructor
          );
        }}
        isLoading={entityManagement.isSubmitting}
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
        isOpen={entityManagement.isDeleteDialogOpen}
        onClose={() => entityManagement.setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (entityManagement.itemToDelete?.id) {
            return handleDeleteEntity(
              ENTITY_NAME,
              entityManagement.itemToDelete.id,
              deleteInstructor,
              entityManagement.fetchData,
              entityManagement.setIsDeleting,
              () => {
                entityManagement.setItemToDelete(null);
                entityManagement.setIsDeleteDialogOpen(false);
              }
            );
          }
        }}
        itemName={entityManagement.itemToDelete?.name}
        isDeleting={entityManagement.isDeleting}
      />

      <FailedDeletionDialog
        open={entityManagement.failedDialogOpen}
        onClose={() => entityManagement.setFailedDialogOpen(false)}
        failedCount={entityManagement.failedCount}
        failedReasons={entityManagement.failedReasons}
      />
    </DataTableSection>
  );
}
