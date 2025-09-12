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

  const {
    data,

    loading,

    isSubmitting,
    setIsSubmitting,

    isDeleting,
    setIsDeleting,

    isDeletingSelected,
    setIsDeletingSelected,

    isAddDialogOpen,
    setIsAddDialogOpen,

    isEditDialogOpen,
    setIsEditDialogOpen,

    editingItem,
    setEditingItem,

    isDeleteDialogOpen,
    setIsDeleteDialogOpen,

    itemToDelete,
    setItemToDelete,

    failedDialogOpen,
    setFailedDialogOpen,

    failedReasons,
    setFailedReasons,

    failedCount,
    setFailedCount,

    fetchData,
  } = useManageEntities<TAcademicQualification>({
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
        setEditingItem(item);
        setIsEditDialogOpen(true);
      },
      onDelete: (item) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
      },
    }),
  ];

  return (
    <DataTableSection>
      {loading ? (
        <DataTableSkeleton columnCount={4} rowCount={5} />
      ) : (
        <DataTable data={data} columns={columns}>
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
      <EntityForm<Omit<TAcademicQualification, "id">>
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={(data) => {
          return handleAddEntity(
            ENTITY_NAME,
            data,
            addAcademicQualification,
            fetchData,
            setIsSubmitting,
            setIsAddDialogOpen,
            validateAcademicQualification
          );
        }}
        isLoading={isSubmitting}
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
        item={editingItem || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingItem(null);
        }}
        onSubmit={(data) => {
          return handleUpdateEntity(
            ENTITY_NAME,
            data,
            updateAcademicQualification,
            fetchData,
            setIsSubmitting,
            () => {
              setIsEditDialogOpen(false);
              setEditingItem(null);
            },
            validateAcademicQualification
          );
        }}
        isLoading={isSubmitting}
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
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (itemToDelete?.id) {
            return handleDeleteEntity(
              ENTITY_NAME,
              itemToDelete.id,
              deleteAcademicQualification,
              fetchData,
              setIsDeleting,
              () => {
                setItemToDelete(null);
                setIsDeleteDialogOpen(false);
              }
            );
          }
        }}
        itemName={itemToDelete?.name}
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
