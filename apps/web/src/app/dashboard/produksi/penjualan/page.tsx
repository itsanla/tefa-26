"use client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Penjualan from "@/components/table_master/penjualan";
import PenjualanSummary from "@/components/table_master/penjualan/Summary";

export default function JenisKomoditasPage() {
    const username = typeof window != "undefined" ? document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1] ?? "User" : ""

  return (
        <DashboardLayout title="Manajemen Penjualan | " role={username}>
            <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-emerald-800">Aplikasi Mobile & Driver Printer</p>
                            <p className="text-sm text-gray-600">
                                Unduh aplikasi mobile dan driver printer thermal untuk operasional kasir.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="https://github.com/itsanla/tefa-26/releases/download/latest/pos-tefa.apk"
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                Download Aplikasi Mobile
                            </a>
                            <a
                                href="https://github.com/itsanla/tefa-26/releases/download/v1.0.1/POS.Printer.Driver.Setup.exe"
                                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 shadow-sm transition-colors hover:bg-amber-100"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                Download Driver Printer Thermal
                            </a>
                        </div>
                    </div>
                </div>
                <PenjualanSummary />
                <Penjualan />
            </div>
        </DashboardLayout>
    );
}
