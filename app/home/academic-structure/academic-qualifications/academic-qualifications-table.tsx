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

export default function AcademicQualificationsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAcademicQualification, setEditingAcademicQualification] =
    useState<TAcademicQualification | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [academicQualificationToDelete, setAcademicQualificationToDelete] =
    useState<TAcademicQualification | null>(null);

  const [failedDialogOpen, setFailedDialogOpen] = useState(false);
  const [failedReasons, setFailedReasons] = useState<string[]>([]);
  const [failedCount, setFailedCount] = useState(0);

  // DATA STORE
  const [academicQualifications, setAcademicQualifications] = useState<
    TAcademicQualification[]
  >([]);

  // FETCH DATA
  const fetchData = async () => {
    setLoading(true);

    const [fetchedAcademicQualifications] = await Promise.all([
      getAcademicQualifications(),
    ]);

    setAcademicQualifications(fetchedAcademicQualifications);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      toast.error("Academic qualification code is required");
      return false;
    }

    if (!data.name) {
      toast.error("Academic qualification name is required");
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
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions
          item={row.original}
          onEdit={(item) => {
            setEditingAcademicQualification(item);
            setIsEditDialogOpen(true);
          }}
          onDelete={(item) => {
            setAcademicQualificationToDelete(item);
            setIsDeleteDialogOpen(true);
          }}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ];

  return (
    <DataTableSection>
      {loading ? (
        <DataTableSkeleton columnCount={4} rowCount={5} />
      ) : (
        <DataTable data={academicQualifications} columns={columns}>
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
                    "Academic Qualifications",
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
                Add Academic Qualification
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
            "Academic Qualification",
            data,
            addAcademicQualification,
            fetchData,
            setIsSubmitting,
            setIsAddDialogOpen,
            validateAcademicQualification
          );
        }}
        isLoading={isSubmitting}
        title="Add Academic Qualification"
      >
        <DataForm.Input
          name="code"
          label="Academic Qualification Code"
          placeholder="e.g., IT"
        />
        <DataForm.Input
          name="name"
          label="Academic Qualification Name"
          placeholder="e.g., Information Technology"
        />
      </EntityForm>

      {/* Edit Form */}
      <EntityForm
        item={editingAcademicQualification || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingAcademicQualification(null);
        }}
        onSubmit={(data) => {
          return handleUpdateEntity(
            "Academic Qualification",
            data,
            updateAcademicQualification,
            fetchData,
            setIsSubmitting,
            () => {
              setIsEditDialogOpen(false);
              setEditingAcademicQualification(null);
            },
            validateAcademicQualification
          );
        }}
        isLoading={isSubmitting}
        title="Edit Academic Qualification"
      >
        <DataForm.Input
          name="code"
          label="Academic Qualification Code"
          placeholder="e.g., IT"
        />
        <DataForm.Input
          name="name"
          label="Academic Qualification Name"
          placeholder="e.g., Information Technology"
        />
      </EntityForm>

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (academicQualificationToDelete?.id) {
            return handleDeleteEntity(
              "Academic Qualification",
              academicQualificationToDelete.id,
              deleteAcademicQualification,
              fetchData,
              setIsDeleting,
              () => {
                setAcademicQualificationToDelete(null);
                setIsDeleteDialogOpen(false);
              }
            );
          }
        }}
        itemName={academicQualificationToDelete?.name}
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
