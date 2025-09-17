"use client";

import {
  HTMLAttributes,
  HTMLInputTypeAttribute,
  ReactNode,
  useEffect,
  useState,
} from "react";
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isLoading) {
          return; // Ignore the close event if loading
        }
        if (!open) {
          onClose();
        }
      }}
    >
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
    // Check the type of the input to decide how to store it
    const finalValue: string | number =
      type === "number" ? Number(value) : value;

    setFormData?.((prev: any) => ({ ...prev, [name]: finalValue }));
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
        value={formData?.[name] ?? ""}
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
    // Check the type of the option to decide how to store it
    const selectedOption = options.find((opt) => String(opt.value) === value);
    const finalValue: string | number =
      selectedOption && typeof selectedOption.value === "number"
        ? Number(value)
        : value;

    setFormData?.((prev: any) => ({ ...prev, [name]: finalValue }));
    if (onValueChange) {
      onValueChange(value); // call the callback if provided
    }
  };

  const hasOptions = options.length > 0;

  return (
    <div className="grid grid-cols-1 space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select
        value={formData?.[name] ?? ""}
        onValueChange={handleChange}
        disabled={disabled || isLoading || !hasOptions}
        required={required}
      >
        <SelectTrigger className="w-full ">
          <SelectValue
            placeholder={hasOptions ? `Select ${label}` : "No data found"}
          />
        </SelectTrigger>
        <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
          {hasOptions ? (
            options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
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
    </div>
  );
}

// ------------------------------------
// Array field (special field) yii loveu
// ------------------------------------
interface ArrayFieldProps {
  name: string;
  label: string;
  fields: {
    name: string;
    placeholder?: string;
    type?: HTMLInputTypeAttribute; // for input
    options?: {
      value: string;
      label: string;
      valueType?: "string" | "number";
    }[]; // if present, render as select
  }[];
  formData?: any;
  setFormData?: (fn: any) => void;
  layoutClass?: string;
  buttonClass?: string;
  /**
   * Map of fieldName -> allowed values array. When this changes,
   * the component will:
   *  - remove array rows that contain values not in these lists
   *  - clear the temp item if it contains values not allowed anymore
   */
  validValuesByField?: Record<string, Array<string | number>>;
}

function DataFormArrayField({
  name,
  label,
  fields,
  formData,
  setFormData,
  layoutClass = "grid grid-cols-2 gap-2",
  validValuesByField,
}: ArrayFieldProps) {
  const [tempItem, setTempItem] = useState<any>({});

  // parse value according to field metadata (options.valueType or field.type)
  const parseValue = (value: any, field: any) => {
    if (value === undefined || value === null) return value;

    // If field has explicit options, use option metadata to determine type
    if (field.options && field.options.length > 0) {
      // find matching option by string equality to be safe
      const optMeta = field.options.find(
        (o: any) => String(o.value) === String(value)
      );
      const valueType = optMeta?.valueType;
      if (valueType === "number") {
        const n = Number(value);
        return isNaN(n) ? undefined : n;
      }
      // default to string
      return String(value);
    }

    // fallback: if field.type === "number" coerce to number
    if (field.type === "number") {
      const n = Number(value);
      return isNaN(n) ? undefined : n;
    }

    // keep as-is (string)
    return value;
  };

  // compare two items by the configured fields (ignore id)
  const itemsEqual = (a: any, b: any) =>
    fields.every((f) => {
      const ka = a?.[f.name];
      const kb = b?.[f.name];
      // Use strict equality after parsing (we store normalized types)
      return ka === kb;
    });

  // return true if any duplicate exists in array (ignoring id differences)
  const hasDuplicateInArray = (arr: any[]) => {
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (itemsEqual(arr[i], arr[j])) return true;
      }
    }
    return false;
  };

  // Sanitize existing form data when validValuesByField changes.
  // Remove any rows that have values not present in the allowed lists.
  useEffect(() => {
    if (!setFormData || !validValuesByField) return;

    setFormData((prev: any) => {
      const arr: any[] = prev?.[name] || [];
      const filtered = arr.filter((item: any) => {
        // for every field that has a valid list, the item's value must be included
        return Object.entries(validValuesByField).every(([fieldKey, allowed]) =>
          allowed.some((v) => String(v) === String(item[fieldKey]))
        );
      });

      // if filtered length changed - update
      if (filtered.length !== arr.length) {
        return { ...prev, [name]: filtered };
      }
      return prev;
    });

    // also clear tempItem if it contains invalid values
    const tempInvalid = Object.entries(validValuesByField).some(
      ([fieldKey, allowed]) =>
        tempItem[fieldKey] !== undefined &&
        !allowed.some((v) => String(v) === String(tempItem[fieldKey]))
    );
    if (tempInvalid) setTempItem({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(validValuesByField)]); // stringified so effect runs when content changes

  const handleAdd = () => {
    if (!setFormData) return;

    // require all fields present in tempItem
    const hasEmpty = fields.some(
      (f) => tempItem[f.name] === undefined || tempItem[f.name] === ""
    );
    if (hasEmpty) {
      toast.error("Please fill out all fields before adding.");
      return;
    }

    // parse all values according to field metadata
    const parsedItem = fields.reduce((acc: any, f) => {
      acc[f.name] = parseValue(tempItem[f.name], f);
      return acc;
    }, {} as any);

    // sanitation: check numeric conversions
    const invalidField = fields.find(
      (f) =>
        parsedItem[f.name] === undefined &&
        (f.type === "number" ||
          (f.options && f.options.some((o) => o.valueType === "number")))
    );
    if (invalidField) {
      toast.error(`Invalid value for ${invalidField.name}.`);
      return;
    }

    // check validValuesByField: ensure parsedItem values exist in allowed lists
    if (validValuesByField) {
      const invalidForField = Object.entries(validValuesByField).find(
        ([k, allowed]) =>
          parsedItem[k] !== undefined &&
          !allowed.some((v) => String(v) === String(parsedItem[k]))
      );
      if (invalidForField) {
        toast.error(
          `Value for ${invalidForField[0]} is not valid for the selected context.`
        );
        return;
      }
    }

    // Check for duplicates (use itemsEqual)
    const existingItems: any[] = formData?.[name] || [];
    const isDuplicate = existingItems.some((item) =>
      itemsEqual(item, parsedItem)
    );
    if (isDuplicate) {
      toast.error("Duplicate entry is not allowed.");
      return;
    }

    const newItem = { ...parsedItem, id: Date.now() };

    setFormData((prev: any) => ({
      ...prev,
      [name]: [...(prev?.[name] || []), newItem],
    }));

    setTempItem({});
  };

  const handleDelete = (id: string) => {
    setFormData?.((prev: any) => ({
      ...prev,
      [name]: prev[name]?.filter((i: any) => i.id !== id),
    }));
  };

  const handleEdit = (id: string, key: string, rawValue: any, field: any) => {
    setFormData?.((prev: any) => {
      const prevArr = prev?.[name] || [];
      const updatedItems = prevArr.map((item: any) =>
        item.id === id ? { ...item, [key]: parseValue(rawValue, field) } : item
      );

      // ensure parsed values are valid (numbers)
      const invalidFieldIndex = updatedItems.findIndex((it: any) =>
        fields.some(
          (f) =>
            it[f.name] === undefined &&
            (f.type === "number" ||
              (f.options && f.options.some((o) => o.valueType === "number")))
        )
      );
      if (invalidFieldIndex !== -1) {
        toast.error("Invalid numeric value.");
        return prev; // cancel
      }

      // check validValuesByField
      if (validValuesByField) {
        const invalidIndex = updatedItems.findIndex((it: any) =>
          Object.entries(validValuesByField).some(
            ([fieldKey, allowed]) =>
              it[fieldKey] !== undefined &&
              !allowed.some((v) => String(v) === String(it[fieldKey]))
          )
        );
        if (invalidIndex !== -1) {
          toast.error(
            "Edited value is not valid for the current academic level / context."
          );
          return prev; // cancel
        }
      }

      // check duplicates after edit
      if (hasDuplicateInArray(updatedItems)) {
        toast.error("Duplicate entry is not allowed.");
        return prev; // cancel update
      }

      return { ...prev, [name]: updatedItems };
    });
  };
  console.log(formData);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div className={layoutClass}>
        {fields.map((f) => {
          // If field has options -> render Select
          if (f.options) {
            const hasOptions = f.options.length > 0;
            return (
              <Select
                key={f.name}
                value={tempItem[f.name] ?? ""}
                onValueChange={(val) =>
                  setTempItem((prev: any) => ({
                    ...prev,
                    [f.name]: parseValue(val, f),
                  }))
                }
                disabled={!hasOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={f.placeholder || `Select ${f.name}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {hasOptions ? (
                    f.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
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
            );
          }

          // otherwise input
          return (
            <Input
              key={f.name}
              type={f.type || "text"}
              placeholder={f.placeholder}
              value={tempItem[f.name] ?? ""}
              onChange={(e) =>
                setTempItem((prev: any) => ({
                  ...prev,
                  [f.name]: parseValue(e.target.value, f),
                }))
              }
            />
          );
        })}
      </div>

      <div className="mt-2">
        <Button type="button" onClick={handleAdd} size="sm">
          Add
        </Button>
      </div>

      {/* Existing rows */}
      <div className="space-y-2 mt-2">
        {(formData?.[name] || []).map((item: any) => (
          <div
            key={item.id}
            className="flex items-center gap-2 border rounded p-2"
          >
            {fields.map((f) =>
              f.options ? (
                <Select
                  key={f.name}
                  value={item[f.name] ?? ""}
                  onValueChange={(val) => handleEdit(item.id, f.name, val, f)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={f.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  key={f.name}
                  type={f.type || "text"}
                  value={item[f.name] ?? ""}
                  onChange={(e) =>
                    handleEdit(item.id, f.name, e.target.value, f)
                  }
                />
              )
            )}
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
interface DivProps {
  children: ReactNode;
  className?: string;
  formData?: any;
  setFormData?: (fn: any) => void;
  isLoading?: boolean;
}

function DataFormDiv({
  children,
  className,
  formData,
  setFormData,
  isLoading,
}: DivProps) {
  return (
    <div className={className}>
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
    </div>
  );
}

// ------------------------------------
// Export as compound component
// ------------------------------------
export const DataForm = Object.assign(DataFormBase, {
  Input: DataFormInput,
  Select: DataFormSelect,
  ArrayField: DataFormArrayField,
  Div: DataFormDiv,
});
