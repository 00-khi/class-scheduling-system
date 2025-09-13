"use client";

import { DataTable } from "@/ui/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { Badge } from "@/ui/shadcn/badge";
import {
  DataTableSection,
  DataTableSkeleton,
  DataTableToolbar,
  DataTableToolbarGroup,
} from "@/ui/components/data-table-components";
import { EntityForm } from "@/ui/components/entity-form";
import {
  handleAddEntity,
  handleDeleteEntity,
  handleDeleteSelectedEntities,
  handleUpdateEntity,
} from "@/lib/crud-handler";
import { FailedDeletionDialog } from "@/ui/components/failed-deletion-dialog";
import {
  getActionsColumn,
  getSelectColumn,
} from "@/ui/components/data-table-columns";
import { useManageEntities } from "@/hooks/use-manage-entities";
import { AcademicQualification } from "@prisma/client";
import { createApiClient } from "@/lib/api/api-client";

export default function AcademicQualificationsTable() {
  const ENTITY_NAME = "Academic Qualification";

  const academicQualificationApi = createApiClient<AcademicQualification>(
    "/api/academic-qualifications"
  );

  const entityManagement = useManageEntities<AcademicQualification>({
    apiService: { fetch: academicQualificationApi.getAll },
  });

  // Generic validator for Academic Qualification
  const validateAcademicQualification = (
    data: Partial<AcademicQualification>,
    requireId = false
  ): boolean => {
    if (requireId && !data.id) {
      toast.error("Invalid ID");
      return false;
    }

    if (!data.code) {
      toast.error(`${ENTITY_NAME} Code is required.`);
      return false;
    }

    if (!data.name) {
      toast.error(`${ENTITY_NAME} Name is required.`);
      return false;
    }

    return true;
  };

  type AcademicQualificationRow = AcademicQualification & {
    _count?: {
      instructors: number;
    };
  };

  const columns: ColumnDef<AcademicQualificationRow>[] = [
    getSelectColumn<AcademicQualificationRow>(),
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
      enableHiding: false,
    },
    {
      id: "instructors",
      header: "Instructors",
      accessorFn: (row) => row._count?.instructors || 0,
      cell: ({ row }) => {
        return (
          <Badge variant="secondary">
            {row.original._count?.instructors || 0}
          </Badge>
        );
      },
    },
    getActionsColumn<AcademicQualificationRow>({
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

  return (
    <DataTableSection>
      {entityManagement.loading ? (
        <DataTableSkeleton columnCount={4} rowCount={5} />
      ) : (
        <DataTable data={entityManagement.data} columns={columns}>
          {/* Toolbar */}
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
                    academicQualificationApi.delete,
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
      <EntityForm<AcademicQualification>
        isOpen={entityManagement.isAddDialogOpen}
        onClose={() => entityManagement.setIsAddDialogOpen(false)}
        onSubmit={(data) => {
          return handleAddEntity(
            ENTITY_NAME,
            data,
            academicQualificationApi.add,
            entityManagement.fetchData,
            entityManagement.setIsSubmitting,
            entityManagement.setIsAddDialogOpen,
            validateAcademicQualification
          );
        }}
        isLoading={entityManagement.isSubmitting}
        title={`Add ${ENTITY_NAME}`}
      >
        <DataForm.Input
          name="code"
          label={`${ENTITY_NAME} Code`}
          placeholder="e.g., IT"
        />
        <DataForm.Input
          name="name"
          label={`${ENTITY_NAME} Name`}
          placeholder="e.g., Information Technology"
        />
      </EntityForm>

      {/* Edit Form */}
      <EntityForm<AcademicQualification>
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
            academicQualificationApi.update,
            entityManagement.fetchData,
            entityManagement.setIsSubmitting,
            () => {
              entityManagement.setIsEditDialogOpen(false);
              entityManagement.setEditingItem(null);
            },
            validateAcademicQualification
          );
        }}
        isLoading={entityManagement.isSubmitting}
        title={`Edit ${ENTITY_NAME}`}
      >
        <DataForm.Input
          name="code"
          label={`${ENTITY_NAME} Code`}
          placeholder="e.g., IT"
        />
        <DataForm.Input
          name="name"
          label={`${ENTITY_NAME} Name`}
          placeholder="e.g., Information Technology"
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
              academicQualificationApi.delete,
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
