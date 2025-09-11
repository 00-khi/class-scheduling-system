// components/entity-form.tsx

import { DataForm } from "./data-form";
import React from "react";

interface EntityFormProps<T> {
  isOpen: boolean;
  item?: T;
  onClose: () => void;
  onSubmit: (data: T) => void;
  isLoading?: boolean;
  title: string;
  children: React.ReactNode;
}

export function EntityForm<T>({
  isOpen,
  item,
  onClose,
  onSubmit,
  isLoading,
  title,
  children,
}: EntityFormProps<T>) {
  return (
    <DataForm<T>
      item={item}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={title}
    >
      {children}
    </DataForm>
  );
}
