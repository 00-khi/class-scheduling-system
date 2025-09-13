"use client";

import { useManageEntities } from "@/hooks/use-manage-entities";
import { createApiClient } from "@/lib/api-client";
import {
  handleAddEntity,
  handleDeleteEntity,
  handleDeleteSelectedEntities,
  handleUpdateEntity,
} from "@/lib/crud-handler";
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
import { AcademicLevel } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

export default function AcademicLevelsTable() {
  const ENTITY_NAME = "Academic Levels";

  const academicLevelApi = createApiClient<AcademicLevel>("/api/academic-levels")

  const entityManagement = useManageEntities<AcademicLevel>({
    apiService: { fetch: academicLevelApi.getAll },
  });

  const validateAcademicLevel = (
    data: Partial<AcademicLevel>,
    requireId = false
  ): boolean => {
    if (requireId && !data.id) {
      toast.error("Invalid ID");
      return false;
    }

    if (!data.code) {
      toast.error(`${ENTITY_NAME} Came is required.`);
      return false;
    }

    if (!data.name) {
      toast.error(`${ENTITY_NAME} Name is required.`);
      return false;
    }

    if (!data.yearStart) {
      toast.error(`Starting Year is required.`);
      return false;
    }

    if (!data.numberOfYears) {
      toast.error(`Number of Years is required.`);
      return false;
    }

    return true;
  };

  type AcademicLevelRow = AcademicLevel & {
    _count?: {
      courses: number;
    };
  };

  const columns: ColumnDef<AcademicLevelRow>[] = [
    getSelectColumn<AcademicLevelRow>(),
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
      header: "Years",
      accessorKey: "yearList",
      cell: ({ row }) => {
        const years: number[] = row.getValue("yearList");
        return (
          <div className="flex flex-wrap gap-1">
            {years.length > 0 ? (
              years.map((year, i) => (
                <Badge key={i} variant="secondary">
                  {year}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">None</span>
            )}
          </div>
        );
      },
    },
    {
      id: "courses",
      header: "Courses",
      accessorFn: (row) => row._count?.courses || 0,
      cell: ({ row }) => {
        return (
          <Badge variant="secondary">{row.original._count?.courses || 0}</Badge>
        );
      },
    },
    getActionsColumn<AcademicLevelRow>({
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
                    academicLevelApi.delete,
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
      <EntityForm<AcademicLevel>
        isOpen={entityManagement.isAddDialogOpen}
        onClose={() => entityManagement.setIsAddDialogOpen(false)}
        onSubmit={(data) => {
          return handleAddEntity(
            ENTITY_NAME,
            data,
            academicLevelApi.add,
            entityManagement.fetchData,
            entityManagement.setIsSubmitting,
            entityManagement.setIsAddDialogOpen,
            validateAcademicLevel
          );
        }}
        isLoading={entityManagement.isSubmitting}
        title={`Add ${ENTITY_NAME}`}
      >
        <DataForm.Input
          name="code"
          label={`${ENTITY_NAME} Code`}
          placeholder="e.g., TER"
        />
        <DataForm.Input
          name="name"
          label={`${ENTITY_NAME} Name`}
          placeholder="e.g., Tertiary"
        />
        <DataForm.Div className="grid grid-cols-2 gap-4">
          <DataForm.Input
            type="number"
            name="yearStart"
            label="Starting Number"
            placeholder="e.g., 7"
          />
          <DataForm.Input
            type="number"
            name="numberOfYears"
            label="Number of Years"
            placeholder="e.g., 4"
          />
        </DataForm.Div>
      </EntityForm>

      {/* Edit Form */}
      <EntityForm<AcademicLevel>
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
            academicLevelApi.update,
            entityManagement.fetchData,
            entityManagement.setIsSubmitting,
            () => {
              entityManagement.setIsEditDialogOpen(false);
              entityManagement.setEditingItem(null);
            },
            validateAcademicLevel
          );
        }}
        isLoading={entityManagement.isSubmitting}
        title={`Edit ${ENTITY_NAME}`}
      >
        <DataForm.Input
          name="code"
          label={`${ENTITY_NAME} Code`}
          placeholder="e.g., TER"
        />
        <DataForm.Input
          name="name"
          label={`${ENTITY_NAME} Name`}
          placeholder="e.g., Tertiary"
        />
        <DataForm.Div className="grid grid-cols-2 gap-4">
          <DataForm.Input
            type="number"
            name="yearStart"
            label="Starting Number"
            placeholder="e.g., 7"
          />
          <DataForm.Input
            type="number"
            name="numberOfYears"
            label="Number of Years"
            placeholder="e.g., 4"
          />
        </DataForm.Div>
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
              academicLevelApi.delete,
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
