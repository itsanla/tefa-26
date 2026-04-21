"use client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { apiRequest } from "@/services/api.service";
import { Penjualan, Komoditas } from "@/types";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from "recharts";

// Komponen Card untuk statistik
const StatCard = ({ title, value, subtitle, color = "blue" }: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "yellow" | "red";
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium opacity-80">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
    </div>
  );
};

export default function DashboardKepsek() {
  const [penjualan, setPenjualan] = useState<Penjualan[]>([]);
  const [komoditas, setKomoditas] = useState<Komoditas[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<"7days" | "weekly" | "monthly">("7days");

  const fetchData = async () => {
    try {
      setLoading(true);
      const penj = await apiRequest({ endpoint: "/penjualan" });
      setPenjualan(penj);
      const komo = await apiRequest({ endpoint: "/komoditas" });
      setKomoditas(komo);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hitung statistik untuk overview
  const totalPenjualan = penjualan.length;
  const totalKomoditas = komoditas.length;
  const komoditasAktif = komoditas.filter(k => k.jumlah > 0).length;

  // Data penjualan terbaru (5 teratas)
  const penjualanTerbaru = penjualan
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Data untuk grafik distribusi per jenis komoditas
  const distribusiJenis = komoditas.reduce((acc, item) => {
    const jenisNama = item.jenis.name;
    if (!acc[jenisNama]) {
      acc[jenisNama] = 0;
    }
    acc[jenisNama] += 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(distribusiJenis).map(([name, value]) => ({
    name,
    value,
  }));

  // Data untuk grafik komoditas terlaris
  const komoditasTerlaris = penjualan
    .reduce((acc, item) => {
      const nama = item.komoditas?.nama ?? "Tidak diketahui";
      if (!acc[nama]) {
        acc[nama] = 0;
      }
      acc[nama] += 1;
      return acc;
    }, {} as Record<string, number>);

  const barData = Object.entries(komoditasTerlaris)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      fullName: name,
      transaksi: value,
    }));

  // Function to get chart data based on period
  const getChartDataByPeriod = (period: "7days" | "weekly" | "monthly") => {
    const dataMap: Record<string, { transaksi: number; revenue: number }> = {};
    const today = new Date();

    if (period === "7days") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        dataMap[dateString] = { transaksi: 0, revenue: 0 };
      }

      penjualan.forEach(item => {
        const dateString = item.createdAt.split('T')[0];
        if (dataMap[dateString]) {
          dataMap[dateString].transaksi += 1;
          dataMap[dateString].revenue += item.total_harga;
        }
      });

      return Object.entries(dataMap).map(([dateString, data]) => ({
        name: new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        ...data,
      })).sort((a, b) => new Date(a.name.split(' ')[1] + ' ' + a.name.split(' ')[0]).getTime() - new Date(b.name.split(' ')[1] + ' ' + b.name.split(' ')[0]).getTime());
    } else if (period === "weekly") {
      // Group by week (e.g., "YYYY-WW")
      penjualan.forEach(item => {
        const date = new Date(item.createdAt);
        const year = date.getFullYear();
        const week = Math.ceil((((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
        const weekString = `${year}-W${week.toString().padStart(2, '0')}`;

        if (!dataMap[weekString]) {
          dataMap[weekString] = { transaksi: 0, revenue: 0 };
        }
        dataMap[weekString].transaksi += 1;
        dataMap[weekString].revenue += item.total_harga;
      });

      return Object.entries(dataMap).map(([weekString, data]) => ({
        name: `Minggu ${weekString.split('W')[1]} ${weekString.split('-')[0]}`,
        ...data,
      })).sort((a, b) => a.name.localeCompare(b.name));
    } else if (period === "monthly") {
      // Group by month (e.g., "YYYY-MM")
      penjualan.forEach(item => {
        const date = new Date(item.createdAt);
        const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!dataMap[yearMonth]) {
          dataMap[yearMonth] = { transaksi: 0, revenue: 0 };
        }
        dataMap[yearMonth].transaksi += 1;
        dataMap[yearMonth].revenue += item.total_harga;
      });

      return Object.entries(dataMap).map(([yearMonth, data]) => ({
        name: new Date(yearMonth).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' }),
        ...data,
      })).sort((a, b) => a.name.localeCompare(b.name));
    }
    return [];
  };

  const combinedTrendData = getChartDataByPeriod(chartPeriod);

  // Warna untuk grafik
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" role="Kepala Sekolah">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const username = document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1] ?? "User"

  return (
    <DashboardLayout title="Manajemen User" role={username}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Selamat Datang, {username}
          </h1>
          <p className="text-gray-600">
            Ringkasan aktivitas program pertanian sekolah hari ini
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Penjualan"
            value={totalPenjualan}
            subtitle="Transaksi"
            color="blue"
          />
          <StatCard
            title="Total Komoditas"
            value={totalKomoditas}
            subtitle="Jenis produk"
            color="green"
          />
          <StatCard
            title="Komoditas Aktif"
            value={komoditasAktif}
            subtitle="Tersedia stok"
            color="yellow"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Penjualan Terbaru */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Penjualan Terbaru
              </h2>
              <p className="text-sm text-gray-600">5 transaksi terakhir</p>
            </div>
            <div className="p-6">
              <DataTable
                data={penjualanTerbaru}
                columns={[
                  {
                    header: "Komoditas",
                    accessorKey: "komoditas",
                    cell: (item: Penjualan) => item.komoditas?.nama,
                  },
                  {
                    header: "Jumlah",
                    accessorKey: "jumlah_terjual",
                    cell: (item: Penjualan) => 
                      `${item.jumlah_terjual} ${item.komoditas?.satuan}`,
                  },
                  {
                    header: "Total Harga",
                    accessorKey: "total_harga",
                    cell: (item: Penjualan) =>
                      `Rp${new Intl.NumberFormat("id-ID").format(item.total_harga)},-`,
                  },
                  {
                    header: "Tanggal",
                    accessorKey: "createdAt",
                    cell: (item: Penjualan) =>
                      new Date(item.createdAt).toLocaleDateString('id-ID'),
                  },
                ]}
                emptyMessage="Belum ada penjualan"
              />
            </div>
          </div>
        </div>

        {/* Grafik Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribusi Jenis Komoditas */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Distribusi Jenis Komoditas
              </h2>
              <p className="text-sm text-gray-600">Berdasarkan kategori</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : "0"}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Komoditas Terlaris */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Komoditas Terlaris
              </h2>
              <p className="text-sm text-gray-600">Top 5 berdasarkan transaksi</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} transaksi`,
                      'Jumlah Transaksi'
                    ]}
                    labelFormatter={(label) => {
                      const item = barData.find(d => d.name === label);
                      return item ? item.fullName : label;
                    }}
                  />
                  <Bar dataKey="transaksi" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Combined Trend Chart */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Trend Penjualan & Pendapatan
              </h2>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => setChartPeriod("7days")}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${chartPeriod === "7days" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  7 Hari Terakhir
                </button>
                <button
                  onClick={() => setChartPeriod("weekly")}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${chartPeriod === "weekly" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  Per Minggu
                </button>
                <button
                  onClick={() => setChartPeriod("monthly")}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${chartPeriod === "monthly" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  Per Bulan
                </button>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={combinedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" stroke="#00C49F" />
                  <YAxis yAxisId="right" orientation="right" stroke="#FFBB28" tickFormatter={(value: number) => `Rp${new Intl.NumberFormat("id-ID").format(value)}`} />
                  <Tooltip formatter={((value: any, name: any) => {
                    if (name === 'transaksi') {
                      return [`${value} transaksi`, 'Jumlah Transaksi'];
                    } else if (name === 'revenue') {
                      return [`Rp${new Intl.NumberFormat("id-ID").format(Number(value))},-`, 'Pendapatan'];
                    }
                    return [value, name];
                  }) as any} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="transaksi"
                    stroke="#00C49F"
                    strokeWidth={2}
                    name="Jumlah Transaksi"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FFBB28"
                    strokeWidth={2}
                    name="Pendapatan"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
