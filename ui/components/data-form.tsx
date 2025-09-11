"use client";

import { HTMLInputTypeAttribute, ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/shadcn/dialog";
import { Button } from "@/ui/shadcn/button";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/shadcn/select";
import React from "react";
import { toast } from "sonner";

// ------------------------------------
// Base provider
// ------------------------------------
interface DataFormProps<T> {
  item?: T;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<boolean | void> | void;
  isLoading?: boolean;
  title?: string;
  children: ReactNode;
}

function DataFormBase<T>({
  item,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  title = "Item Form",
  children,
}: DataFormProps<T>) {
  const [formData, setFormData] = useState<T>(item || ({} as T));

  useEffect(() => {
    setFormData(item || ({} as T));
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit(formData);

    if (result !== false) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fields (compound children) */}
          {children &&
            React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<any>, {
                    formData,
                    setFormData,
                    isLoading,
                  })
                : child
            )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------
// Compound subcomponents
// ------------------------------------
interface FieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  formData?: any;
  setFormData?: (fn: any) => void;
  isLoading?: boolean;
  type?: HTMLInputTypeAttribute | undefined; // default is text
  onValueChange?: (value: string) => void;
  className?: string;
}

function DataFormInput({
  name,
  label,
  placeholder,
  required,
  disabled,
  formData,
  setFormData,
  isLoading,
  type = "text",
  onValueChange,
  className,
}: FieldProps) {
  const handleChange = (value: string) => {
    setFormData?.((prev: any) => ({ ...prev, [name]: value }));
    if (onValueChange) {
      onValueChange(value); // call the callback if provided
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        type={type}
        id={name}
        value={formData?.[name] || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        required={required}
        className={className}
      />
    </div>
  );
}

interface SelectProps extends FieldProps {
  options: { value: string; label: string }[];
  onValueChange?: (value: string) => void;
}

function DataFormSelect({
  name,
  label,
  options,
  required,
  disabled,
  formData,
  setFormData,
  isLoading,
  onValueChange,
}: SelectProps) {
  const handleChange = (value: string) => {
    setFormData?.((prev: any) => ({ ...prev, [name]: value }));
    if (onValueChange) {
      onValueChange(value); // call the callback if provided
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select
        value={formData?.[name] != null ? String(formData[name]) : ""}
        onValueChange={handleChange}
        disabled={disabled || isLoading}
        required={required}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ------------------------------------
// Array input (special field)
// ------------------------------------
interface ArrayInputProps {
  name: string;
  label: string;
  fields: { name: string; placeholder?: string }[]; // fields of object
  formData?: any;
  setFormData?: (fn: any) => void;
}

function DataFormArrayInput({
  name,
  label,
  fields,
  formData,
  setFormData,
}: ArrayInputProps) {
  const [tempItem, setTempItem] = useState<any>({});

  const handleAdd = () => {
    if (!setFormData) return;

    // Validation: check if all fields have non-empty values
    const hasEmpty = fields.some((f) => !tempItem[f.name]?.trim());
    if (hasEmpty) {
      // You can also show a toast or error message instead of alert
      toast.error("Please fill out all fields before adding.");
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: [
        ...(prev[name] || []),
        { ...tempItem, id: Date.now().toString() },
      ],
    }));
    setTempItem({});
  };

  const handleDelete = (id: string) => {
    setFormData?.((prev: any) => ({
      ...prev,
      [name]: prev[name]?.filter((i: any) => i.id !== id),
    }));
  };

  const handleEdit = (id: string, key: string, value: string) => {
    setFormData?.((prev: any) => ({
      ...prev,
      [name]: prev[name]?.map((i: any) =>
        i.id === id ? { ...i, [key]: value } : i
      ),
    }));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {fields.map((f) => (
          <Input
            key={f.name}
            placeholder={f.placeholder}
            value={tempItem[f.name] || ""}
            onChange={(e) =>
              setTempItem((prev: any) => ({
                ...prev,
                [f.name]: e.target.value,
              }))
            }
          />
        ))}
        <Button type="button" onClick={handleAdd} size="sm">
          Add
        </Button>
      </div>

      {/* List of added items */}
      <div className="space-y-2 mt-2">
        {(formData?.[name] || []).map((item: any) => (
          <div
            key={item.id}
            className="flex items-center gap-2 border rounded p-2"
          >
            {fields.map((f) => (
              <Input
                key={f.name}
                value={item[f.name]}
                onChange={(e) => handleEdit(item.id, f.name, e.target.value)}
              />
            ))}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(item.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------
// Section (container only, no injected props)
// ------------------------------------
interface SectionProps {
  children: ReactNode;
  className?: string;
}

function DataFormDiv({ children, className }: SectionProps) {
  return <div className={className}>{children}</div>;
}

// ------------------------------------
// Export as compound component
// ------------------------------------
export const DataForm = Object.assign(DataFormBase, {
  Input: DataFormInput,
  Select: DataFormSelect,
  ArrayInput: DataFormArrayInput,
  Div: DataFormDiv,
});
