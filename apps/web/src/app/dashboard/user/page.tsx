"use client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { apiRequest } from "@/services/api.service";
import { User, RoleUser } from "@/types";
import { createColumns } from "@/components/table_master/user";
import CreateUpdateModal from "@/components/dashboard/CreateUpdateModal";
import ConfirmButton from "@/components/common/ConfirmButton";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table"; // Import ColumnDef

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest({ endpoint: "/users" });
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal mengambil data user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateClick = () => {
    setModalMode("create");
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditClick = (user: User) => {
    setModalMode("update");
    // Ensure password field is empty when editing
    setSelectedUser({ ...user, password: "" });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      try {
        await apiRequest({
          endpoint: `/users/${deleteId}`,
          method: "DELETE",
        });
        toast.success("User berhasil dihapus.");
        fetchUsers();
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast.error(error.response?.data?.message || "Gagal menghapus user.");
      } finally {
        setShowConfirm(false);
        setDeleteId(null);
      }
    }
  };

  const handleModalSuccess = () => {
    fetchUsers();
    toast.success(`User berhasil ${modalMode === "create" ? "ditambahkan" : "diupdate"}.`);
  };

  const userFormFields = [
    { name: "nama", label: "Nama", type: "text" as const },
    { name: "email", label: "Email", type: "text" as const },
    {
      name: "password",
      label: modalMode === "update" ? "Password (optional)" : "Password",
      type: "text" as const
    },
    {
      name: "role",
      label: "Role",
      type: "select" as const,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Guru", value: "guru" },
        { label: "Kepala Sekolah", value: "kepsek" },
        { label: "Siswa", value: "siswa" },
      ],
    },
  ];

  // Transform ColumnDef from @tanstack/react-table to DataTable's expected format
  const tanstackColumns = createColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  const columns = tanstackColumns.map(col => {
    const headerContent = typeof col.header === 'string' ? col.header : 'N/A'; // Simplified header extraction
    const accessorKey = (col as any).accessorKey; // Access accessorKey more flexibly

    return {
      header: headerContent,
      accessorKey: accessorKey as keyof User,
      cell: (item: User) => {
        const cellFn = (col as ColumnDef<User>).cell;
        if (cellFn) {
          // @ts-ignore
          return cellFn({ row: { original: item } });
        }
        return (item as any)[accessorKey as keyof User];
      },
      sortable: true, // Assuming all columns are sortable for simplicity, adjust if needed
    };
  });

  return (
    <DashboardLayout title="Manajemen User" role="Admin">
      <div className="tf-toolbar" style={{ justifyContent: "flex-end" }}>
        <button onClick={handleCreateClick} className="tf-btn-green" type="button">
          <PlusCircle size={16} /> Tambah User
        </button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        title="Daftar User"
        emptyMessage="Tidak ada data user."
      />

      {showModal && (
        <CreateUpdateModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
          mode={modalMode}
          title="User"
          fields={userFormFields}
          endpoint="/users"
          initialData={selectedUser || undefined}
        />
      )}

      {showConfirm && (
        <ConfirmButton
          message={`Apakah Anda yakin ingin menghapus user ini?`}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </DashboardLayout>
  );
}