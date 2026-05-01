import { ColumnDef, Column, Row } from "@tanstack/react-table";
import { User } from "@/types";
import { Button } from "@/components/landing/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";

interface UserTableActionsProps {
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export const createColumns = ({ onEdit, onDelete }: UserTableActionsProps): ColumnDef<User>[] => [
  {
    accessorKey: "nama",
    header: "Nama"
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }: { row: Row<User> }) => {
      const user = row.original;
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="tf-action tf-action-edit">
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="tf-action tf-action-delete">
            <Trash2 size={16} />
          </button>
        </div>
      );
    },
  },
];
