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

export const TARGET_TAHUNAN = 650_000_000;

export const BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
] as const;

export interface SalesEntry {
  id: string;
  tanggal: string;
  merekKendaraan: string;
  modelKendaraan: string;
  jenisPekerjaan: string;
  jumlahSales: number;
}

export interface MonthlyReport {
  bulan: number;
  tahun: number;
  penjelasanPerforma: string;
  kendala: string;
  actionPlan: string;
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

export async function getEntries(): Promise<SalesEntry[]> {
  const { data, error } = await supabase
    .from("sales_entries")
    .select("*")
    .order("tanggal", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    tanggal: r.tanggal,
    merekKendaraan: r.merek_kendaraan,
    modelKendaraan: r.model_kendaraan,
    jenisPekerjaan: r.jenis_pekerjaan,
    jumlahSales: Number(r.jumlah_sales),
  }));
}

export async function saveEntry(entry: Omit<SalesEntry, "id">): Promise<SalesEntry> {
  const { data, error } = await supabase
    .from("sales_entries")
    .insert({
      tanggal: entry.tanggal,
      merek_kendaraan: entry.merekKendaraan,
      model_kendaraan: entry.modelKendaraan,
      jenis_pekerjaan: entry.jenisPekerjaan,
      jumlah_sales: entry.jumlahSales,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    tanggal: data.tanggal,
    merekKendaraan: data.merek_kendaraan,
    modelKendaraan: data.model_kendaraan,
    jenisPekerjaan: data.jenis_pekerjaan,
    jumlahSales: Number(data.jumlah_sales),
  };
}

export async function updateEntry(id: string, entry: Omit<SalesEntry, "id">): Promise<SalesEntry> {
  const { data, error } = await supabase
    .from("sales_entries")
    .update({
      tanggal: entry.tanggal,
      merek_kendaraan: entry.merekKendaraan,
      model_kendaraan: entry.modelKendaraan,
      jenis_pekerjaan: entry.jenisPekerjaan,
      jumlah_sales: entry.jumlahSales,
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
    jenisPekerjaan: data.jenis_pekerjaan,
    jumlahSales: Number(data.jumlah_sales),
  };
}

export async function deleteEntry(id: string) {
  const { error } = await supabase.from("sales_entries").delete().eq("id", id);
  if (error) throw error;
}

export async function getMonthlyReports(): Promise<MonthlyReport[]> {
  const { data, error } = await supabase.from("monthly_reports").select("*");
  if (error) throw error;
  return (data || []).map((r) => ({
    bulan: r.bulan,
    tahun: r.tahun,
    penjelasanPerforma: r.penjelasan_performa || "",
    kendala: r.kendala || "",
    actionPlan: r.action_plan || "",
  }));
}

export async function saveMonthlyReport(report: MonthlyReport) {
  const { error } = await supabase
    .from("monthly_reports")
    .upsert(
      {
        bulan: report.bulan,
        tahun: report.tahun,
        penjelasan_performa: report.penjelasanPerforma,
        kendala: report.kendala,
        action_plan: report.actionPlan,
      },
      { onConflict: "bulan,tahun" }
    );
  if (error) throw error;
}

// --- Complaints CRUD ---

export async function getComplaints(): Promise<ComplaintEntry[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
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

export async function saveComplaint(entry: Omit<ComplaintEntry, "id">): Promise<ComplaintEntry> {
  const { data, error } = await supabase
    .from("complaints")
    .insert({
      tanggal: entry.tanggal,
      merek_kendaraan: entry.merekKendaraan,
      model_kendaraan: entry.modelKendaraan,
      jenis_complain: entry.jenisComplain,
      keterangan: entry.keterangan,
      status: entry.status,
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

export async function downloadDataExcel(params: { entries: SalesEntry[]; monthlyReports?: MonthlyReport[] }) {
  const XLSX = await import("xlsx");
  const entriesRows = params.entries.map((e) => ({
    Tanggal: e.tanggal,
    Merek: e.merekKendaraan,
    Model: e.modelKendaraan,
    "Jenis Pekerjaan": splitJenisPekerjaan(e.jenisPekerjaan).join(", "),
    "Sales (IDR)": e.jumlahSales,
  }));

  const wb = XLSX.utils.book_new();
  const entriesWs = XLSX.utils.json_to_sheet(entriesRows, {
    header: ["Tanggal", "Merek", "Model", "Jenis Pekerjaan", "Sales (IDR)"],
  });
  entriesWs["!cols"] = [{ wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 40 }, { wch: 16 }];
  if (entriesRows.length > 0) {
    entriesWs["!autofilter"] = { ref: `A1:E${entriesRows.length + 1}` };
    for (let r = 2; r <= entriesRows.length + 1; r++) {
      const cellAddr = `E${r}`;
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
        Kendala: r.kendala,
        "Action Plan": r.actionPlan,
      }));
    const reportWs = XLSX.utils.json_to_sheet(reportRows, {
      header: ["Bulan", "Performa", "Kendala", "Action Plan"],
    });
    reportWs["!cols"] = [{ wch: 14 }, { wch: 40 }, { wch: 40 }, { wch: 40 }];
    if (reportRows.length > 0) {
      reportWs["!autofilter"] = { ref: `A1:D${reportRows.length + 1}` };
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
