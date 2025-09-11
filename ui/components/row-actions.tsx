import { EditIcon, TrashIcon } from "lucide-react";
import { Button } from "../shadcn/button";

type TRowActionsProps<T> = {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
};

export function RowActions<T>({ item, onEdit, onDelete }: TRowActionsProps<T>) {
  return (
    <div className="flex justify-end gap-2">
      {/* Edit Button */}
      <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
        <EditIcon size={16} />
      </Button>

      {/* Delete Button */}
      <Button size="icon" variant="ghost" onClick={() => onDelete(item)}>
        <TrashIcon size={16} />
      </Button>
    </div>
  );
}
