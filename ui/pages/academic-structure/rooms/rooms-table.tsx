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
import { IRoom } from "@/types";
import {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} from "@/services/roomService";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/ui/components/comfirm-delete-dialog";
import { DataForm } from "@/ui/components/data-form";
import { Badge } from "@/shadcn/components/ui/badge";

export function RoomsTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<IRoom[]>([]);

  // 🆕 delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<IRoom | null>(null);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setRooms(getRooms());
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD
  const handleAddRoom = async (roomData: Omit<IRoom, "id">) => {
    setIsSubmitting(true);
    try {
      if (!roomData.name) {
        toast.error("Room name is required");
      }

      if (!roomData.type) {
        toast.error("Room type is required");
        return;
      }

      if (addRoom(roomData)) {
        toast.success(`Room added successfully`);
        loadData();
      } else {
        toast.error("Failed to add room");
      }
      setIsAddDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleUpdateRoom = async (roomData: IRoom) => {
    if (!roomData.id) return;
    setIsSubmitting(true);
    try {
      if (!roomData.name) {
        toast.error("Room name is required");
      }

      if (!roomData.type) {
        toast.error("Room type is required");
        return;
      }

      const { id: id, ...data } = roomData;

      if (updateRoom(id, data)) {
        toast.success(`Room updated successfully`);
        loadData();
      } else {
        toast.error("Failed to update room");
      }

      setIsEditDialogOpen(false);
      setEditingRoom(null);
    } catch (error) {
      toast.error("Error updating room");
      console.error("Error updating room:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteRoom = (id: string) => {
    try {
      if (!id) {
        toast.error("Error deleting room: Invalid ID");
        return;
      }
      if (deleteRoom(id)) {
        toast.success(`Room deleted successfully`);
        loadData();
      } else {
        toast.error("Failed to delete room");
      }
    } catch (error) {
      toast.error("Error deleting room");
      console.error("Error deleting room:", error);
    }
  };

  const columns: ColumnDef<IRoom>[] = [
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
      header: "Type",
      accessorKey: "type",
      cell: ({ row }) => {
        const status = row.getValue<string>("type");
        return (
          <Badge variant={status === "Laboratory" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions
          room={row.original}
          onEdit={(rm) => {
            setEditingRoom(rm);
            setIsEditDialogOpen(true);
          }}
          onDelete={(rm) => {
            setRoomToDelete(rm);
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
        <DataTable data={rooms} columns={columns}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.Search
                column="name"
                placeholder="Search rooms..."
                className="max-w-sm"
              />
              <DataTable.Filter column="type" placeholder="All types" />
              <DataTable.ClearFilters />
              <DataTable.ViewOptions />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DataTable.DeleteSelected
                onDeleteSelected={(ids) => {
                  ids.forEach((id) => handleDeleteRoom(id));
                }}
              />
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="-ms-1 opacity-60" size={16} />
                Add Room
              </Button>
            </div>
          </div>

          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      )}

      <RoomForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddRoom}
        isLoading={isSubmitting}
      />

      <RoomForm
        item={editingRoom || undefined}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingRoom(null);
        }}
        onSubmit={handleUpdateRoom}
        isLoading={isSubmitting}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (roomToDelete?.id) {
            handleDeleteRoom(roomToDelete.id);
          }
          setIsDeleteDialogOpen(false);
          setRoomToDelete(null);
        }}
        itemName={roomToDelete?.name}
      />
    </div>
  );
}

function RowActions({
  room,
  onEdit,
  onDelete,
}: {
  room: IRoom;
  onEdit: (rm: IRoom) => void;
  onDelete: (rm: IRoom) => void;
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
        <DropdownMenuItem onClick={() => onEdit(room)}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(room)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RoomForm({
  isOpen,
  item,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  item?: IRoom;
  onClose: () => void;
  onSubmit: (data: IRoom) => void;
  isLoading?: boolean;
}) {
  return (
    <DataForm<IRoom>
      item={item}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={{ add: "Add Room", edit: "Edit Room" }}
    >
      <DataForm.Input
        name="name"
        label="Room Name"
        placeholder="e.g., Information Technology"
        required
      />
      <DataForm.Select
        name="type"
        label="Type"
        options={[
          { value: "Lecture", label: "Lecture" },
          { value: "Laboratory", label: "Laboratory" },
        ]}
        // onValueChange={(value: string) => handleChange(value, "type")}
        required
      />
    </DataForm>
  );
}
