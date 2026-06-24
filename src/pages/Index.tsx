import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Car, TrendingUp, Target, Trash2, AlertCircle, Download, Edit2, AlertTriangle, MessageSquarePlus, BarChart3, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InputForm } from "@/components/InputForm";
import { ComplaintForm } from "@/components/ComplaintForm";
import { MonthlyReportDialog } from "@/components/MonthlyReportDialog";
import { StoreSalesDialog } from "@/components/StoreSalesDialog";
import {
  getEntries,
  formatIDR,
  getMonthlySales,
  getMonthlyEntries,
  getTopPekerjaan,
  getTopModelKendaraan,
  getTopModelKendaraanPerPekerjaan,
  TARGET_TAHUNAN,
  BULAN,
  deleteEntry,
  getMonthlyReports,
  splitJenisPekerjaan,
  downloadDataExcel,
  type SalesEntry,
  type MonthlyReport,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import logoMobeng from "@/assets/logomobeng.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ReportContent = ({ report, showMonth = true }: { report: MonthlyReport, showMonth?: boolean }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {showMonth && (
      <div className="col-span-full border-b pb-2 mb-2">
        <h3 className="font-bold text-primary">{BULAN[report.bulan]} 2026</h3>
      </div>
    )}
    <div className="space-y-2">
      <h4 className="font-bold text-[10px] text-primary uppercase tracking-widest flex items-center gap-2">
        <div className="w-1.5 h-3 bg-primary rounded-full" />
        Performa
      </h4>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
        {report.penjelasanPerforma || "-"}
      </p>
    </div>
    <div className="space-y-2">
      <h4 className="font-bold text-[10px] text-rose-500 uppercase tracking-widest flex items-center gap-2">
        <div className="w-1.5 h-3 bg-rose-500 rounded-full" />
        Kendala
      </h4>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
        {report.kendala || "-"}
      </p>
    </div>
    <div className="space-y-2">
      <h4 className="font-bold text-[10px] text-emerald-600 uppercase tracking-widest flex items-center gap-2">
        <div className="w-1.5 h-3 bg-emerald-600 rounded-full" />
        Action Plan
      </h4>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
        {report.actionPlan || "-"}
      </p>
    </div>
  </div>
);

export default function Dashboard() {
  const [allEntries, setAllEntries] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<SalesEntry | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [complaintPrefill, setComplaintPrefill] = useState<{ merekKendaraan: string; modelKendaraan: string } | null>(null);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchEntries = useCallback(async () => {
    try {
      const [entriesData, reportsData] = await Promise.all([
        getEntries(),
        getMonthlyReports(),
      ]);
      setAllEntries(entriesData);
      setMonthlyReports(reportsData);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data dari database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth]);

  const filteredEntries = allEntries.filter((e) => {
    if (selectedMonth === "all") return true;
    const date = new Date(e.tanggal);
    return date.getMonth() === parseInt(selectedMonth);
  });

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalSales = filteredEntries.reduce((sum, e) => sum + e.jumlahSales, 0);
  const totalSalesAllTime = allEntries.reduce((sum, e) => sum + e.jumlahSales, 0);
  const progressPct = Math.min((totalSalesAllTime / TARGET_TAHUNAN) * 100, 100);
  const sisaTarget = Math.max(TARGET_TAHUNAN - totalSalesAllTime, 0);
  const monthlySales = getMonthlySales(allEntries);
  const monthlyEntries = getMonthlyEntries(allEntries);
  const topPekerjaan = getTopPekerjaan(filteredEntries, 10);
  const topModel = getTopModelKendaraan(filteredEntries, 20);
  const topModelPerPekerjaan = getTopModelKendaraanPerPekerjaan(
    filteredEntries,
    topPekerjaan.map((t) => t.name)
  );
  const unitCount = filteredEntries.length;

  // Hitung persentase terhadap total sales toko
  let currentTotalSalesToko = 0;
  if (selectedMonth === "all") {
    currentTotalSalesToko = monthlyReports.reduce((sum, r) => sum + (r.totalSalesToko || 0), 0);
  } else {
    const monthIdx = parseInt(selectedMonth);
    const report = monthlyReports.find(r => r.bulan === monthIdx && r.tahun === 2026);
    currentTotalSalesToko = report?.totalSalesToko || 0;
  }
  const salesPercentage = currentTotalSalesToko > 0 ? (totalSales / currentTotalSalesToko) * 100 : 0;

  const chartData = BULAN.map((name, i) => ({ name, sales: monthlySales[i] }));
  const chartDataEntries = BULAN.map((name, i) => ({ name, entries: monthlyEntries[i] }));

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    try {
      await deleteEntry(id);
      setAllEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Data dihapus.");
    } catch {
      toast.error("Gagal menghapus data.");
    }
  };

  const handleEdit = (entry: SalesEntry) => {
    setEditingEntry(entry);
    setIsEditOpen(true);
  };

  const handleOpenComplaint = (entry: SalesEntry) => {
    setComplaintPrefill({
      merekKendaraan: entry.merekKendaraan,
      modelKendaraan: entry.modelKendaraan,
    });
    setIsComplaintOpen(true);
  };

  const handleDownload = async () => {
    if (loading) return;
    if (allEntries.length === 0) {
      toast.error("Belum ada data untuk didownload.");
      return;
    }
    try {
      const monthlyReports = await getMonthlyReports();
      await downloadDataExcel({ entries: allEntries, monthlyReports });
    } catch (err) {
      console.error(err);
      toast.error("Gagal mendownload data.");
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-primary px-4 sm:px-6 py-4 sm:py-5 shadow-lg">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="transition-transform hover:scale-105 active:scale-95 shrink-0">
                <img src={logoMobeng} alt="Mobeng Logo" className="h-10 w-10 rounded-lg object-cover ring-2 ring-primary-foreground/50" />
              </Link>
              <div className="flex flex-col justify-center">
                <h1 className="text-base sm:text-lg font-bold text-white leading-tight">All in 1 Store</h1>
                <p className="text-[9px] sm:text-[10px] text-primary-foreground/70 uppercase tracking-wider">Mobeng Harapan Indah</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/analisa">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-2 h-9 font-medium">
                  <BarChart3 className="h-4 w-4 text-indigo-300" />
                  <span className="hidden sm:inline">Analisa</span>
                </Button>
              </Link>
              
              <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="bg-red-600 text-white hover:bg-red-700 h-9 px-2 animate-pulse hover:animate-none shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/50"
                  >
                    <ChevronDown className="h-5 w-5" strokeWidth={3} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                    Aksi & Menu
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  
                  <div className="p-1">
                    <InputForm onSuccess={fetchEntries} />
                  </div>
                  
                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem asChild className="focus:bg-rose-50 focus:text-rose-600 cursor-pointer">
                    <Link to="/complaints" className="flex items-center gap-2 w-full px-2 py-1.5">
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                      <span>Complain</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <div className="space-y-1">
                    <StoreSalesDialog onSuccess={fetchEntries} />
                    <MonthlyReportDialog onSuccess={fetchEntries} />
                  </div>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <DropdownMenuItem 
                    onClick={handleDownload} 
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer focus:bg-slate-100"
                  >
                    <Download className="h-4 w-4 text-slate-500" />
                    <span>Download Excel</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
      </header>

      {/* Edit Form Modal */}
      <InputForm
        editData={editingEntry}
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingEntry(null);
        }}
        onSuccess={fetchEntries}
      />

      {/* Complaint Form Modal (dipicu dari tabel) */}
      <ComplaintForm
        prefillData={complaintPrefill ?? undefined}
        open={isComplaintOpen}
        onOpenChange={(open) => {
          setIsComplaintOpen(open);
          if (!open) setComplaintPrefill(null);
        }}
        onSuccess={() => {}}
        trigger={<span />}
      />

      <main className="container mx-auto flex-1 py-5 sm:py-6 px-3 sm:px-4 space-y-5 sm:space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Memuat data...</p>
        ) : (
          <>
            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
              <div>
                <h2 className="text-lg font-semibold font-heading">Filter Indikator</h2>
                <p className="text-sm text-muted-foreground">Pilih bulan untuk melihat performa spesifik</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Periode:</span>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-background">
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Akumulasi 2026</SelectItem>
                    {BULAN.map((name, i) => (
                      <SelectItem key={name} value={i.toString()}>
                        {name} 2026
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-body text-muted-foreground">
                    Sales {selectedMonth === "all" ? "2026" : BULAN[parseInt(selectedMonth)]}
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-heading font-bold">{formatIDR(totalSales)}</div>
                  {selectedMonth === "all" && (
                    <p className="text-xs text-muted-foreground mt-1">{progressPct.toFixed(1)}% dari target</p>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-body text-muted-foreground">Target Tahunan</CardTitle>
                  <Target className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-heading font-bold">{formatIDR(TARGET_TAHUNAN)}</div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-body text-muted-foreground">Sisa Target</CardTitle>
                  <AlertCircle className={`h-5 w-5 ${sisaTarget > 0 ? "text-accent" : "text-primary"}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-heading font-bold">{formatIDR(sisaTarget)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{sisaTarget > 0 ? "harus dicapai lagi" : "Target tercapai! 🎉"}</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-body text-muted-foreground">
                    Unit {selectedMonth === "all" ? "Entry" : BULAN[parseInt(selectedMonth)]}
                  </CardTitle>
                  <Car className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-heading font-bold">{unitCount}</div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-body text-muted-foreground">% Sales Project</CardTitle>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-heading font-bold">{salesPercentage.toFixed(1)}%</div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {currentTotalSalesToko > 0 
                      ? `vs ${formatIDR(currentTotalSalesToko)} (Toko)` 
                      : "Total sales toko belum diinput"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Akumulasi Sales Per Bulan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 sm:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}jt`} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(v: number) => formatIDR(v)} />
                          <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, i) => (
                              <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Unit Entry New Job Varian</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 sm:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartDataEntries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(v: number) => `${v} Unit`} />
                          <Bar dataKey="entries" radius={[4, 4, 0, 0]}>
                            {chartDataEntries.map((_, i) => (
                              <Cell key={i} fill={`hsl(var(--chart-${((i + 2) % 5) + 1}))`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Top 10 Jenis Pekerjaan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topPekerjaan.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-8">Belum ada data</p>
                    ) : (
                      <div className="space-y-4">
                        {topPekerjaan.map((item, i) => {
                          const maxVal = topPekerjaan[0]?.value || 1;
                          const pct = (item.value / maxVal) * 100;
                          const stats = topModelPerPekerjaan[item.name];
                          const topModelsText = (stats?.models || [])
                            .map((m) => `${m.name} (${m.value})`)
                            .join(", ");
                          return (
                            <div key={item.name}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium truncate mr-2">{i + 1}. {item.name}</span>
                                <span className="text-muted-foreground shrink-0">{formatIDR(item.value)}</span>
                              </div>
                              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    background: i === 0 ? "hsl(var(--accent))" : "hsl(var(--primary))",
                                  }}
                                />
                              </div>
                              {stats?.totalUnit ? (
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <p
                                    className="text-[11px] text-muted-foreground min-w-0 flex-1 whitespace-normal break-words leading-snug"
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {topModelsText ? `Kendaraan: ${topModelsText}` : "Kendaraan: -"}
                                  </p>
                                  <span className="text-[10px] text-muted-foreground shrink-0">{stats.totalUnit} unit</span>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Top 20 Model Kendaraan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topModel.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-8">Belum ada data</p>
                    ) : (
                      <div className="space-y-3">
                        {topModel.map((item, i) => {
                          const maxVal = topModel[0]?.value || 1;
                          const pct = (item.value / maxVal) * 100;
                          return (
                            <div key={item.name}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium truncate mr-2">{i + 1}. {item.name}</span>
                                <span className="text-muted-foreground shrink-0">{item.value} unit</span>
                              </div>
                              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    background: i === 0 ? "hsl(var(--accent))" : "hsl(var(--primary))",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Monthly Report Summary Section */}
            <div className="space-y-4">
              {selectedMonth !== "all" ? (
                /* Tampilan Single Month */
                <Card className="glass-card border-l-4 border-l-primary overflow-hidden">
                  <CardHeader className="bg-primary/5 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Analisa Performa Bulanan: {BULAN[parseInt(selectedMonth)]} 2026
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {(() => {
                      const report = monthlyReports.find(r => r.bulan === parseInt(selectedMonth) && r.tahun === 2026);
                      if (!report || (!report.penjelasanPerforma && !report.kendala && !report.actionPlan)) {
                        return <p className="text-muted-foreground text-sm italic">Belum ada penjelasan laporan untuk bulan ini.</p>;
                      }
                      return <ReportContent report={report} showMonth={false} />;
                    })()}
                  </CardContent>
                </Card>
              ) : (
                /* Tampilan Akumulasi (Semua Laporan) */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">Riwayat Analisa Performa 2026</h3>
                  </div>
                  {monthlyReports
                    .filter(r => r.penjelasanPerforma || r.kendala || r.actionPlan)
                    .sort((a, b) => b.bulan - a.bulan) // Urutkan dari bulan terbaru
                    .map((report) => (
                      <Card key={report.bulan} className="glass-card border-l-4 border-l-primary/40 overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 py-2 border-b">
                          <CardTitle className="text-sm font-bold text-primary">
                            {BULAN[report.bulan]} 2026
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <ReportContent report={report} showMonth={false} />
                        </CardContent>
                      </Card>
                    ))}
                  {monthlyReports.filter(r => r.penjelasanPerforma || r.kendala || r.actionPlan).length === 0 && (
                    <Card className="glass-card p-8 text-center border-dashed">
                      <p className="text-muted-foreground text-sm">Belum ada laporan bulanan yang diinput untuk tahun 2026.</p>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Recent Entries Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Data Pekerjaan Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                {allEntries.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Belum ada data. Klik "Input Data Baru" untuk mulai.</p>
                ) : (
                  <>
                    <Table className="min-w-[720px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Merek</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Jenis Pekerjaan</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                        <TableHead className="w-28"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEntries.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="whitespace-nowrap">{e.tanggal}</TableCell>
                          <TableCell>{e.merekKendaraan}</TableCell>
                          <TableCell>{e.modelKendaraan}</TableCell>
                          <TableCell className="min-w-[240px]">
                            {splitJenisPekerjaan(e.jenisPekerjaan).join(", ")}
                          </TableCell>
                          <TableCell className="text-right font-medium whitespace-nowrap">{formatIDR(e.jumlahSales)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(e)}>
                                <Edit2 className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Input Complain"
                                onClick={() => handleOpenComplaint(e)}
                                className="hover:bg-accent/10 hover:text-accent"
                              >
                                <MessageSquarePlus className="h-4 w-4 text-accent" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Tampil per halaman:</span>
                      <Select value={itemsPerPage.toString()} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Halaman {currentPage} dari {totalPages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <footer className="gradient-dark mt-auto py-4 text-center px-4">
        <p className="text-sm text-muted-foreground">Copyright &copy; 2026 Product &amp; Service Development</p>
      </footer>
    </div>
  );
}
