"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import StokVariabelTable from "@/components/table_master/stok";
import InputStokVariabel from "@/components/table_master/stok/input";
import { StokVariabel } from "@/types";

export default function StokVariabelPage() {
  const [selectedItem, setSelectedItem] = useState<StokVariabel | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(false);

  const handleEdit = (item: StokVariabel) => setSelectedItem(item);
  const refreshList = () => setReloadTrigger((prev) => !prev);

  return (
    <DashboardLayout title="Variabel Stok" role="">
      <div className="mt-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Variabel stok adalah nilai stok bersama yang bisa dipakai banyak
          produksi. Ubah nilainya di sini dan seluruh produksi yang memakainya
          akan ikut tersinkronisasi.
        </p>
        <InputStokVariabel
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          onSuccess={refreshList}
        />
      </div>
      <div className="mt-6">
        <StokVariabelTable onEdit={handleEdit} reloadTrigger={reloadTrigger} />
      </div>
    </DashboardLayout>
  );
}
