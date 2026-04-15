// ============================================================
// Client-side API helper — fetch wrapper for Functions API
// ============================================================

const API_BASE = "/api";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.headers.get("Content-Type")?.includes("text/csv")) {
    // Handle file download
    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download =
      res.headers
        .get("Content-Disposition")
        ?.match(/filename="(.+)"/)?.[1] || "export.csv";
    a.click();
    URL.revokeObjectURL(downloadUrl);
    return { success: true } as ApiResponse<T>;
  }

  if (res.headers.get("Content-Type")?.includes("text/html")) {
    // PDF: open in new window for printing
    const html = await res.text();
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
    return { success: true } as ApiResponse<T>;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Terjadi kesalahan");
  }

  return json as ApiResponse<T>;
}

// ============================================================
// Auth API
// ============================================================
export async function login(username: string, password: string) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getMe() {
  return apiFetch<{
    id: number;
    username: string;
    nama_lengkap: string;
    role: string;
  }>("/auth/me");
}

export async function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}

// ============================================================
// Siswa API
// ============================================================
export interface SiswaData {
  id: number;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  tahun_ajaran: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  status_kelulusan?: string;
  nilai_rata_rata?: number;
  nilai_ujian?: number;
  nilai_sikap?: string;
  keterangan?: string;
}

export async function getSiswaList(
  page = 1,
  limit = 20,
  search = ""
) {
  return apiFetch<SiswaData[]>(
    `/siswa/list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
  );
}

export async function getSiswaById(id: number) {
  return apiFetch<SiswaData>(`/siswa/${id}`);
}

export async function createSiswa(data: Partial<SiswaData>) {
  return apiFetch("/siswa", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSiswa(id: number, data: Partial<SiswaData>) {
  return apiFetch(`/siswa/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSiswa(id: number) {
  return apiFetch(`/siswa/${id}`, { method: "DELETE" });
}

// ============================================================
// Kelulusan API
// ============================================================
export async function getKelulusanSiswa() {
  return apiFetch("/kelulusan");
}

// ============================================================
// Export API
// ============================================================
export async function exportExcel() {
  return apiFetch("/export/excel");
}

export async function exportPdf() {
  return apiFetch("/export/pdf");
}
