"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@/lib/api/api-client";
import { ROOMS_API } from "@/lib/api/api-endpoints";
import { useManageEntities } from "@/hooks/use-manage-entities-v2";
import { Room } from "@prisma/client";
import {
  DataTableToolbar,
  DataTableToolbarGroup,
} from "./data-table-components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";

type Option = { value: string | number; label: string };

export default function SelectRoomGroup({
  onRoomChange,
  disabled = false,
  reset = false,
  selectedRoomId = null,
}: {
  onRoomChange?: (roomId: number | null) => void;
  disabled?: boolean;
  reset?: boolean;
  selectedRoomId?: number | null;
}) {
  const [selectedData, setSelectedData] = useState<{
    type?: string;
    roomId?: number | null;
  } | null>(null);

  const roomApi = createApiClient<Room>(ROOMS_API);

  const entityManagement = useManageEntities<Room>({
    apiService: { fetch: roomApi.getAll },
  });

  const rooms = entityManagement.data || [];

  const typeOptions: Option[] = Array.from(
    new Set(rooms.map((r) => r.type))
  ).map((type) => ({
    label: type,
    value: type,
  }));

  const roomOptions: Option[] = rooms
    .filter((r) => {
      if (!selectedData?.type) return true;
      return r.type === selectedData.type;
    })
    .map((r) => ({
      label: r.name,
      value: r.id,
    }));

  // Reset trigger
  useEffect(() => {
    if (reset) {
      setSelectedData(null);
      onRoomChange?.(null);
    }
  }, [reset]);

  // Handle external selectedRoomId
  useEffect(() => {
    if (selectedRoomId) {
      setSelectedData((prev) => ({ ...prev, roomId: selectedRoomId }));
    }
  }, [selectedRoomId]);

  function handleRoomChange(roomId: number | null) {
    setSelectedData((prev) => ({ ...prev, roomId }));
    if (onRoomChange && roomId !== undefined) onRoomChange(roomId);
  }

  return (
    <DataTableToolbar>
      <DataTableToolbarGroup>
        {/* Type */}
        <Select
          value={selectedData?.type ?? ""}
          onValueChange={(value) => {
            handleRoomChange(null);
            setSelectedData((prev) => ({
              ...prev,
              type: value,
              roomId: null,
            }));
          }}
          disabled={disabled || entityManagement.isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.length > 0 ? (
              typeOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="-">
                No data found
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Room */}
        <Select
          value={
            !entityManagement.isLoading
              ? selectedData?.roomId?.toString() ?? ""
              : ""
          }
          onValueChange={(value) => {
            handleRoomChange(Number(value));
          }}
          disabled={disabled || entityManagement.isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Room" />
          </SelectTrigger>
          <SelectContent>
            {roomOptions.length > 0 ? (
              roomOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="-">
                No data found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </DataTableToolbarGroup>
    </DataTableToolbar>
  );
}
