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
import { TAcademicQualification } from "@/lib/types";
import {
  getAcademicQualifications,
  addAcademicQualification,
  updateAcademicQualification,
  deleteAcademicQualification,
} from "@/services/academicQualificationService";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { Badge } from "@/ui/shadcn/badge";
import { RowActions } from "@/ui/components/row-actions";
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

export default function AcademicQualificationsTable() {
  const ENTITY_NAME = "Academic Qualification";

  const entityManagement = useManageEntities<TAcademicQualification>({
    apiService: { fetch: getAcademicQualifications },
  });

  // Generic validator for Academic Qualification
  const validateAcademicQualification = (
    data: Partial<TAcademicQualification>,
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

  type TAcademicQualificationRow = TAcademicQualification & {
    _count?: {
      instructors: number;
    };
  };

  const columns: ColumnDef<TAcademicQualificationRow>[] = [
    getSelectColumn<TAcademicQualificationRow>(),
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
    getActionsColumn<TAcademicQualificationRow>({
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
                    deleteAcademicQualification,
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
      <EntityForm<Omit<TAcademicQualification, "id">>
        isOpen={entityManagement.isAddDialogOpen}
        onClose={() => entityManagement.setIsAddDialogOpen(false)}
        onSubmit={(data) => {
          return handleAddEntity(
            ENTITY_NAME,
            data,
            addAcademicQualification,
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
      <EntityForm
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
            updateAcademicQualification,
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
              deleteAcademicQualification,
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
