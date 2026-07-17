import { supabase } from "@/integrations/supabase/client";

export const JENIS_PEKERJAAN_GROUPS = [
  {
    category: "Mesin & Sensor",
    items: ["Ganti MAF", "Ganti CKP", "Ganti CMP", "Ganti O2", "Ganti IAT", "Ganti PCV", "Ganti ISC", "Ganti THROTTLE ASSY", "Ganti Temp. Switch", "Ganti Ignition Coil", "Ganti Seal Cover Valve", "Ganti Seal Crankshaft"]
  },
  {
    category: "Pendingin & Belt",
    items: ["Ganti V-Belt", "Ganti Tensioner", "Ganti Engine Mounting RH Mounting", "Ganti Engine Mounting LH Mounting", "Ganti Seal Crankshaft Belakang", "Ganti Tutup Radiator", "Ganti Radiator", "Ganti Motor Fan Radiator"]
  },
  {
    category: "Sistem Bahan Bakar",
    items: ["Ganti Fuel Filter", "Ganti Fuel Pump", "Ganti Injektor"]
  },
  {
    category: "Kelistrikan",
    items: ["Ganti Motor Starter", "Ganti Magnetic S/W", "Ganti Alternator", "Ganti Fuse", "Ganti Relay"]
  },
  {
    category: "Sistem Rem",
    items: ["Ganti Master Rem", "Ganti Disk Brake", "Ganti Wheel Cylinder Rem", "Ganti Piston Caliper"]
  },
  {
    category: "Kemudi & Suspensi",
    items: ["Ganti Rack Steer", "Ganti Upper Arm", "Ganti Lower Arm", "Ganti Boot Shock Absorber", "Ganti Bounding Shock Absorber", "Ganti Boot Steer", "Ganti Karet Stabilizer"]
  },
  {
    category: "Transmisi & Penggerak",
    items: ["Ganti Seal Drive Shaft", "Ganti Boot Drive Shaft", "Ganti Drive Shaft", "Ganti Bearing Roda", "Ganti Filter CVT", "Ganti Kopling Set", "Ganti Seal Input Shaft", "Ganti Seal Output Shaft", "Ganti Mounting Transmisi", "Ganti Master Kopling", "Kuras Minyak Kopling", "Ganti Kopling Set + Seal Crankshaft"]
  },
  {
    category: "Lainnya",
    items: ["Others"]
  }
];

export const JENIS_PEKERJAAN = JENIS_PEKERJAAN_GROUPS.flatMap(g => g.items);

export const MEREK_KENDARAAN = [
  "Toyota",
  "Daihatsu",
  "Honda",
  "Suzuki",
  "Mitsubishi",
  "Nissan",
  "Hyundai",
  "Kia",
  "Mazda",
  "Wuling",
  "Others",
] as const;

export const MODEL_BY_MEREK: Record<(typeof MEREK_KENDARAAN)[number], readonly string[]> = {
  Toyota: [
    "Agya",
    "Alphard",
    "Avanza",
    "Calya",
    "Camry",
    "Corolla Altis",
    "Corolla Cross",
    "Etios Valco",
    "Fortuner",
    "GR86",
    "Hiace",
    "Hiace (Prem)",
    "Hilux",
    "Hilux Rangga",
    "Innova",
    "Kijang",
    "Kijang Innova",
    "Kijang Innova Zenix",
    "Land Cruiser",
    "Raize",
    "Rush",
    "Sienta",
    "Sienta (2NR-FE/AT)",
    "Sienta (2NR-FE/MT)",
    "Supra",
    "Veloz",
    "Vios",
    "Voxy",
    "Yaris",
    "Others",
  ],
  Daihatsu: [
    "Ayla",
    "Gran Max",
    "Luxio",
    "Rocky",
    "Sigra",
    "Sirion",
    "Taft",
    "Terios",
    "Xenia",
    "Others",
  ],
  Honda: [
    "Accord",
    "BEAT",
    "Brio",
    "BR-V",
    "City",
    "City (Hatchback)",
    "Civic",
    "Civic (FB)",
    "Civic (FD)",
    "Civic Turbo RS",
    "Civic Type R",
    "CR-V",
    "Freed",
    "HR-V",
    "Jazz",
    "Jazz RS",
    "Jazz RS (GK)",
    "Mobilio",
    "Odyssey",
    "PCX",
    "Scoopy",
    "Vario",
    "WR-V",
    "Others",
  ],
  Suzuki: [
    "APV",
    "Baleno",
    "Carry",
    "Ertiga",
    "Grand Vitara",
    "Ignis",
    "Jimny",
    "Karimun Wagon R",
    "S-Presso",
    "Swift",
    "SX4 S-Cross",
    "XL7",
    "Others",
  ],
  Mitsubishi: [
    "Colt L300",
    "Delica",
    "Eclipse Cross",
    "Fuso",
    "Mirage",
    "Outlander",
    "Pajero Sport",
    "Triton",
    "Xpander",
    "Others",
  ],
  Nissan: [
    "Datsun",
    "Evalia",
    "Grand Livina",
    "Juke",
    "Livina",
    "Magnite",
    "March",
    "Navara",
    "Serena",
    "Terra",
    "Others",
  ],
  Hyundai: [
    "Creta",
    "Grand i10",
    "H-1",
    "Palisade",
    "Santa Fe",
    "Stargazer",
    "Tucson",
    "Others",
  ],
  Kia: [
    "Carens",
    "Carnival",
    "EV6",
    "Picanto",
    "Rio",
    "Seltos",
    "Sonet",
    "Sorento",
    "Others",
  ],
  Mazda: [
    "BT-50",
    "CX-3",
    "CX-30",
    "CX-5",
    "CX-8",
    "CX-9",
    "Mazda 2",
    "Mazda 3",
    "Mazda 6",
    "MX-5",
    "Others",
  ],
  Wuling: [
    "Air ev",
    "Almaz",
    "BinguoEV",
    "Confero",
    "Confero S",
    "Cortez",
    "Formo",
    "Others",
  ],
  Others: ["Others"],
};

// Target tahunan is now fetched dynamically from store_targets table

export const BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
] as const;

export interface SalesEntry {
  id: string;
  tanggal: string;
  merekKendaraan: string;
  modelKendaraan: string;
  tahunKendaraan?: string;
  jenisPekerjaan: string;
  jumlahSales: number;
  leadtimeJam?: number;
  leadtimeMenit?: number;
  specialTools?: string; // pipe-separated
  langkahPengerjaan?: string;
}

export interface MonthlyReport {
  bulan: number;
  tahun: number;
  penjelasanPerforma: string;
  kendala: string;
  actionPlan: string;
  totalSalesToko?: number;
}

export interface ComplaintEntry {
  id: string;
  tanggal: string;
  merekKendaraan: string;
  modelKendaraan: string;
  jenisComplain: string;
  keterangan: string;
  status: "Open" | "In Progress" | "Resolved";
}

export const COMPLAINT_TYPES = [
  "Suara Berisik",
  "Kebocoran Cairan",
  "Fungsi Tidak Optimal",
  "Kerusakan Fisik",
  "Kelistrikan Bermasalah",
  "Pemasangan Tidak Rapi",
  "Lainnya",
];

// --- Supabase CRUD ---

export async function getEntries(storeName: string): Promise<SalesEntry[]> {
  const { data, error } = await supabase
    .from("sales_entries")
    .select("*")
    .eq("store_name", storeName)
    .order("tanggal", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    tanggal: r.tanggal,
    merekKendaraan: r.merek_kendaraan,
    modelKendaraan: r.model_kendaraan,
    tahunKendaraan: r.tahun_kendaraan || "",
    jenisPekerjaan: r.jenis_pekerjaan,
    jumlahSales: Number(r.jumlah_sales),
    leadtimeJam: r.leadtime_jam ?? 0,
    leadtimeMenit: r.leadtime_menit ?? 0,
    specialTools: r.special_tools ?? "",
    langkahPengerjaan: r.langkah_pengerjaan ?? "",
  }));
}

export async function saveEntry(entry: Omit<SalesEntry, "id">, storeName: string): Promise<SalesEntry> {
  const { data, error } = await supabase
    .from("sales_entries")
    .insert({
      tanggal: entry.tanggal,
      merek_kendaraan: entry.merekKendaraan,
      model_kendaraan: entry.modelKendaraan,
      tahun_kendaraan: entry.tahunKendaraan || null,
      jenis_pekerjaan: entry.jenisPekerjaan,
      jumlah_sales: entry.jumlahSales,
      leadtime_jam: entry.leadtimeJam ?? 0,
      leadtime_menit: entry.leadtimeMenit ?? 0,
      special_tools: entry.specialTools ?? "",
      langkah_pengerjaan: entry.langkahPengerjaan ?? "",
      store_name: storeName,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    tanggal: data.tanggal,
    merekKendaraan: data.merek_kendaraan,
    modelKendaraan: data.model_kendaraan,
    tahunKendaraan: data.tahun_kendaraan || "",
    jenisPekerjaan: data.jenis_pekerjaan,
    jumlahSales: Number(data.jumlah_sales),
    leadtimeJam: data.leadtime_jam ?? 0,
    leadtimeMenit: data.leadtime_menit ?? 0,
    specialTools: data.special_tools ?? "",
    langkahPengerjaan: data.langkah_pengerjaan ?? "",
  };
}

export async function updateEntry(id: string, entry: Omit<SalesEntry, "id">): Promise<SalesEntry> {
  const { data, error } = await supabase
    .from("sales_entries")
    .update({
      tanggal: entry.tanggal,
      merek_kendaraan: entry.merekKendaraan,
      model_kendaraan: entry.modelKendaraan,
      tahun_kendaraan: entry.tahunKendaraan || null,
      jenis_pekerjaan: entry.jenisPekerjaan,
      jumlah_sales: entry.jumlahSales,
      leadtime_jam: entry.leadtimeJam ?? 0,
      leadtime_menit: entry.leadtimeMenit ?? 0,
      special_tools: entry.specialTools ?? "",
      langkah_pengerjaan: entry.langkahPengerjaan ?? "",
      // No need to update store_name on edit, assuming it stays in the same store.

    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    tanggal: data.tanggal,
    merekKendaraan: data.merek_kendaraan,
    modelKendaraan: data.model_kendaraan,
    tahunKendaraan: data.tahun_kendaraan || "",
    jenisPekerjaan: data.jenis_pekerjaan,
    jumlahSales: Number(data.jumlah_sales),
    leadtimeJam: data.leadtime_jam ?? 0,
    leadtimeMenit: data.leadtime_menit ?? 0,
    specialTools: data.special_tools ?? "",
    langkahPengerjaan: data.langkah_pengerjaan ?? "",
  };
}

export async function deleteEntry(id: string) {
  const { error } = await supabase.from("sales_entries").delete().eq("id", id);
  if (error) throw error;
}

export async function getMonthlyReports(storeName: string): Promise<MonthlyReport[]> {
  const { data, error } = await supabase.from("monthly_reports").select("*").eq("store_name", storeName);
  if (error) throw error;
  return (data || []).map((r) => ({
    bulan: r.bulan,
    tahun: r.tahun,
    penjelasanPerforma: r.penjelasan_performa || "",
    kendala: r.kendala || "",
    actionPlan: r.action_plan || "",
    totalSalesToko: r.total_sales_toko ? Number(r.total_sales_toko) : 0,
  }));
}

export async function saveMonthlyReport(report: MonthlyReport, storeName: string) {
  const { error } = await supabase
    .from("monthly_reports")
    .upsert(
      {
        bulan: report.bulan,
        tahun: report.tahun,
        penjelasan_performa: report.penjelasanPerforma,
        kendala: report.kendala,
        action_plan: report.actionPlan,
        total_sales_toko: report.totalSalesToko,
        store_name: storeName,
      },
      { onConflict: "bulan,tahun,store_name" } // IMPORTANT: DB unique constraint needs to include store_name now
    );
  if (error) throw error;
}

// --- Store Targets CRUD ---

export async function getStoreTarget(storeName: string, tahun: number = 2026): Promise<number> {
  const { data, error } = await supabase
    .from("store_targets")
    .select("target_amount")
    .eq("store_name", storeName)
    .eq("tahun", tahun)
    .maybeSingle();

  if (error) {
    console.error("Error fetching store target:", error);
    return 650_000_000; // default fallback
  }
  return data?.target_amount ? Number(data.target_amount) : 650_000_000;
}

export async function saveStoreTarget(storeName: string, tahun: number, amount: number) {
  const { error } = await supabase
    .from("store_targets")
    .upsert(
      {
        store_name: storeName,
        tahun: tahun,
        target_amount: amount,
      },
      { onConflict: "store_name,tahun" }
    );
  if (error) throw error;
}

// --- Complaints CRUD ---

export async function getComplaints(storeName: string): Promise<ComplaintEntry[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("store_name", storeName)
    .order("tanggal", { ascending: false });
  if (error) {
    console.error("Error fetching complaints:", error);
    return []; // Return empty if table doesn't exist yet
  }
  return (data || []).map((r) => ({
    id: r.id,
    tanggal: r.tanggal,
    merekKendaraan: r.merek_kendaraan,
    modelKendaraan: r.model_kendaraan,
    jenisComplain: r.jenis_complain,
    keterangan: r.keterangan,
    status: r.status,
  }));
}

export async function saveComplaint(entry: Omit<ComplaintEntry, "id">, storeName: string): Promise<ComplaintEntry> {
  const { data, error } = await supabase
    .from("complaints")
    .insert({
      tanggal: entry.tanggal,
      merek_kendaraan: entry.merekKendaraan,
      model_kendaraan: entry.modelKendaraan,
      jenis_complain: entry.jenisComplain,
      keterangan: entry.keterangan,
      status: entry.status,
      store_name: storeName,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    tanggal: data.tanggal,
    merekKendaraan: data.merek_kendaraan,
    modelKendaraan: data.model_kendaraan,
    jenisComplain: data.jenis_complain,
    keterangan: data.keterangan,
    status: data.status,
  };
}

export async function deleteComplaint(id: string) {
  const { error } = await supabase.from("complaints").delete().eq("id", id);
  if (error) throw error;
}

export function getComplaintStats(complaints: ComplaintEntry[]) {
  const map: Record<string, number> = {};
  complaints.forEach((c) => {
    map[c.jenisComplain] = (map[c.jenisComplain] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMonthlySales(entries: SalesEntry[]): number[] {
  const monthly = new Array(12).fill(0);
  entries.forEach((e) => {
    const date = new Date(e.tanggal);
    if (date.getFullYear() === 2026) {
      monthly[date.getMonth()] += e.jumlahSales;
    }
  });
  return monthly;
}

export function getMonthlyEntries(entries: SalesEntry[]): number[] {
  const monthly = new Array(12).fill(0);
  entries.forEach((e) => {
    const date = new Date(e.tanggal);
    if (date.getFullYear() === 2026) {
      monthly[date.getMonth()] += 1;
    }
  });
  return monthly;
}

export function splitJenisPekerjaan(jenisPekerjaan: string): string[] {
  return jenisPekerjaan
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getTopPekerjaan(entries: SalesEntry[], limit = 5) {
  const map: Record<string, number> = {};
  entries.forEach((e) => {
    const jenisList = splitJenisPekerjaan(e.jenisPekerjaan);
    const denom = jenisList.length || 1;
    const portion = e.jumlahSales / denom;
    jenisList.forEach((j) => {
      map[j] = (map[j] || 0) + portion;
    });
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

export function getTopModelKendaraan(entries: SalesEntry[], limit = 10) {
  const map: Record<string, number> = {};
  entries.forEach((e) => {
    const model = e.modelKendaraan.trim();
    if (!model) return;
    map[model] = (map[model] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

export function getTopModelKendaraanPerPekerjaan(
  entries: SalesEntry[],
  pekerjaanList: string[],
  limitModels = Number.POSITIVE_INFINITY
): Record<string, { totalUnit: number; models: { name: string; value: number }[] }> {
  const modelMapByPekerjaan: Record<string, Record<string, number>> = {};
  const unitCountByPekerjaan: Record<string, number> = {};

  entries.forEach((e) => {
    const model = e.modelKendaraan.trim();
    if (!model) return;

    const jenisSet = new Set(splitJenisPekerjaan(e.jenisPekerjaan));
    jenisSet.forEach((jenis) => {
      if (!modelMapByPekerjaan[jenis]) modelMapByPekerjaan[jenis] = {};
      modelMapByPekerjaan[jenis][model] = (modelMapByPekerjaan[jenis][model] || 0) + 1;
      unitCountByPekerjaan[jenis] = (unitCountByPekerjaan[jenis] || 0) + 1;
    });
  });

  const result: Record<string, { totalUnit: number; models: { name: string; value: number }[] }> = {};
  pekerjaanList.forEach((pekerjaan) => {
    const models = Object.entries(modelMapByPekerjaan[pekerjaan] || {})
      .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
      .slice(0, limitModels)
      .map(([name, value]) => ({ name, value }));
    result[pekerjaan] = { totalUnit: unitCountByPekerjaan[pekerjaan] || 0, models };
  });

  return result;
}

export async function downloadDataExcel(params: { entries: SalesEntry[]; monthlyReports?: MonthlyReport[] }) {
  const XLSX = await import("xlsx");
  const entriesRows = params.entries.map((e) => ({
    Tanggal: e.tanggal,
    Merek: e.merekKendaraan,
    Model: e.modelKendaraan,
    Tahun: e.tahunKendaraan || "-",
    "Jenis Pekerjaan": splitJenisPekerjaan(e.jenisPekerjaan).join(", "),
    "Sales (IDR)": e.jumlahSales,
  }));

  const wb = XLSX.utils.book_new();
  const entriesWs = XLSX.utils.json_to_sheet(entriesRows, {
    header: ["Tanggal", "Merek", "Model", "Tahun", "Jenis Pekerjaan", "Sales (IDR)"],
  });
  entriesWs["!cols"] = [{ wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 40 }, { wch: 16 }];
  if (entriesRows.length > 0) {
    entriesWs["!autofilter"] = { ref: `A1:F${entriesRows.length + 1}` };
    for (let r = 2; r <= entriesRows.length + 1; r++) {
      const cellAddr = `F${r}`;
      const cell = entriesWs[cellAddr];
      if (cell) cell.z = '"Rp" #,##0';
    }
  }
  XLSX.utils.book_append_sheet(wb, entriesWs, "Sales Entries");

  if (params.monthlyReports) {
    const reportRows = params.monthlyReports
      .slice()
      .sort((a, b) => (a.tahun - b.tahun) || (a.bulan - b.bulan))
      .map((r) => ({
        Bulan: `${BULAN[r.bulan] ?? r.bulan} ${r.tahun}`,
        Performa: r.penjelasanPerforma,
        "Total Sales Toko": r.totalSalesToko,
        Kendala: r.kendala,
        "Action Plan": r.actionPlan,
      }));
    const reportWs = XLSX.utils.json_to_sheet(reportRows, {
      header: ["Bulan", "Total Sales Toko", "Performa", "Kendala", "Action Plan"],
    });
    reportWs["!cols"] = [{ wch: 14 }, { wch: 18 }, { wch: 40 }, { wch: 40 }, { wch: 40 }];
    if (reportRows.length > 0) {
      reportWs["!autofilter"] = { ref: `A1:E${reportRows.length + 1}` };
      for (let r = 2; r <= reportRows.length + 1; r++) {
        const cellAddr = `B${r}`;
        const cell = reportWs[cellAddr];
        if (cell) cell.z = '"Rp" #,##0';
      }
    }
    XLSX.utils.book_append_sheet(wb, reportWs, "Monthly Reports");
  }

  const now = new Date();
  const dateStamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const fileName = `mobeng-data-${dateStamp}.xlsx`;

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Analitik untuk Dashboard Analisa ---

/** Konversi leadtime ke total menit */
export function toTotalMenit(jam: number, menit: number): number {
  return (jam * 60) + menit;
}

/** Format menit ke string "Xj Ym" */
export function formatLeadtime(jam: number, menit: number): string {
  if (jam === 0 && menit === 0) return "-";
  if (jam === 0) return `${menit}m`;
  if (menit === 0) return `${jam}j`;
  return `${jam}j ${menit}m`;
}

/** Rata-rata leadtime (menit) per jenis pekerjaan */
export function getLeadtimeByPekerjaan(entries: SalesEntry[]) {
  const map: Record<string, { total: number; count: number }> = {};
  entries.forEach((e) => {
    const totalMenit = toTotalMenit(e.leadtimeJam ?? 0, e.leadtimeMenit ?? 0);
    if (totalMenit === 0) return;
    
    // Gabungkan semua pekerjaan menjadi satu string dengan koma (Opsi 1)
    const joinedJenis = splitJenisPekerjaan(e.jenisPekerjaan).join(", ");
    
    if (!map[joinedJenis]) map[joinedJenis] = { total: 0, count: 0 };
    map[joinedJenis].total += totalMenit;
    map[joinedJenis].count += 1;
  });
  return Object.entries(map)
    .map(([name, { total, count }]) => ({ name, avgMenit: Math.round(total / count), count }))
    .sort((a, b) => b.avgMenit - a.avgMenit)
    .slice(0, 12);
}

/** Daftar special tools yang paling sering dipakai */
export function getTopSpecialTools(entries: SalesEntry[], limit = 12) {
  const map: Record<string, number> = {};
  entries.forEach((e) => {
    if (!e.specialTools) return;
    e.specialTools.split(" | ").map(s => s.trim()).filter(Boolean).forEach((tool) => {
      map[tool] = (map[tool] || 0) + 1;
    });
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

/** Rata-rata leadtime keseluruhan dalam menit */
export function getAvgLeadtimeMenit(entries: SalesEntry[]): number {
  const valid = entries.filter(e => toTotalMenit(e.leadtimeJam ?? 0, e.leadtimeMenit ?? 0) > 0);
  if (valid.length === 0) return 0;
  const total = valid.reduce((s, e) => s + toTotalMenit(e.leadtimeJam ?? 0, e.leadtimeMenit ?? 0), 0);
  return Math.round(total / valid.length);
}

/** Entry yang punya langkah pengerjaan */
export function getEntriesWithLangkah(entries: SalesEntry[]) {
  return entries.filter(e => e.langkahPengerjaan && e.langkahPengerjaan.trim().length > 0);
}
