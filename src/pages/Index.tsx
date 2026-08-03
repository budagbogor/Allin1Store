import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Car, TrendingUp, Target, Trash2, AlertCircle, Download, Edit2, AlertTriangle, MessageSquarePlus, BarChart3, ChevronDown, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { InputForm } from "@/components/InputForm";
import { ComplaintForm } from "@/components/ComplaintForm";
import { MonthlyReportDialog } from "@/components/MonthlyReportDialog";
import { StoreSalesDialog } from "@/components/StoreSalesDialog";
import { TargetDialog } from "@/components/TargetDialog";
import { cn } from "@/lib/utils";
import {
  getEntries,
  formatIDR,
  getMonthlySales,
  getMonthlyEntries,
  getTopPekerjaan,
  getTopModelKendaraan,
  getTopModelKendaraanPerPekerjaan,
  getStoreTarget,
  BULAN,
  deleteEntry,
  getMonthlyReports,
  splitJenisPekerjaan,
  downloadDataExcel,
  getComplaints,
  type SalesEntry,
  type MonthlyReport,
  type ComplaintEntry,
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
import { useStoreContext } from "@/lib/storeContext";

const ReportContent = ({ report, showMonth = true }: { report: MonthlyReport; showMonth?: boolean }) => (
  <div className="space-y-3">
    {showMonth && (
      <div className="font-bold text-slate-900 dark:text-slate-100 border-b pb-1">
        {BULAN[report.bulan]} {report.tahun}
      </div>
    )}
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Penjelasan Performa Sales Toko
      </h4>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
        {report.penjelasanPerforma || "-"}
      </p>
    </div>
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Kendala Operasional
      </h4>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
        {report.kendala || "-"}
      </p>
    </div>
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Rencana Aksi (Action Plan)
      </h4>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
        {report.actionPlan || "-"}
      </p>
    </div>
  </div>
);

export default function Dashboard() {
  const [allEntries, setAllEntries] = useState<SalesEntry[]>([]);
  const [complaints, setComplaints] = useState<ComplaintEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<SalesEntry | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [complaintPrefill, setComplaintPrefill] = useState<{ merekKendaraan: string; modelKendaraan: string; jenisPekerjaan?: string } | null>(null);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [showComplaintsOnly, setShowComplaintsOnly] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [targetTahunan, setTargetTahunan] = useState(650_000_000);
  const { selectedStore } = useStoreContext();

  const fetchEntries = useCallback(async () => {
    if (!selectedStore) return;
    try {
      const [entriesData, reportsData, targetData, complaintsData] = await Promise.all([
        getEntries(selectedStore),
        getMonthlyReports(selectedStore),
        getStoreTarget(selectedStore, 2026),
        getComplaints(selectedStore),
      ]);
      setAllEntries(entriesData);
      setMonthlyReports(reportsData);
      setTargetTahunan(targetData);
      setComplaints(complaintsData);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data dari database.");
    } finally {
      setLoading(false);
    }
  }, [selectedStore]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries, selectedStore]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, showComplaintsOnly]);

  const getComplaintForEntry = useCallback((entry: SalesEntry): ComplaintEntry | undefined => {
    return (
      complaints.find(
        (c) =>
          c.merekKendaraan.toLowerCase() === entry.merekKendaraan.toLowerCase() &&
          c.modelKendaraan.toLowerCase() === entry.modelKendaraan.toLowerCase() &&
          c.tanggal === entry.tanggal
      ) ||
      complaints.find(
        (c) =>
          c.merekKendaraan.toLowerCase() === entry.merekKendaraan.toLowerCase() &&
          c.modelKendaraan.toLowerCase() === entry.modelKendaraan.toLowerCase()
      )
    );
  }, [complaints]);

  const filteredEntries = allEntries.filter((e) => {
    if (selectedMonth !== "all") {
      const date = new Date(e.tanggal);
      if (date.getMonth() !== parseInt(selectedMonth)) return false;
    }
    if (showComplaintsOnly) {
      return Boolean(getComplaintForEntry(e));
    }
    return true;
  });

  const totalComplaintsCount = allEntries.filter((e) => Boolean(getComplaintForEntry(e))).length;

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalSales = filteredEntries.reduce((sum, e) => sum + e.jumlahSales, 0);
  const monthlySales = getMonthlySales(filteredEntries);
  const monthlyEntries = getMonthlyEntries(filteredEntries);
  const topPekerjaan = getTopPekerjaan(filteredEntries, Number.POSITIVE_INFINITY);
  const topModel = getTopModelKendaraan(filteredEntries, 20);
  const topModelPerPekerjaan = getTopModelKendaraanPerPekerjaan(
    filteredEntries,
    topPekerjaan.map((t) => t.name)
  );
  const unitCount = filteredEntries.length;
  const maxPekerjaanSales = Math.max(...topPekerjaan.map((t) => t.value), 1);
  const maxModelCount = Math.max(...topModel.map((m) => m.value), 1);

  let currentTotalSalesToko = 0;
  if (selectedMonth === "all") {
    currentTotalSalesToko = monthlyReports.reduce((sum, r) => sum + (r.totalSalesToko || 0), 0);
  } else {
    const monthIdx = parseInt(selectedMonth);
    const report = monthlyReports.find(r => r.bulan === monthIdx && r.tahun === 2026);
    currentTotalSalesToko = report?.totalSalesToko || 0;
  }
  const salesPercentage = currentTotalSalesToko > 0 ? (totalSales / currentTotalSalesToko) * 100 : 0;
  const targetPeriode = selectedMonth === "all" ? targetTahunan : targetTahunan / 12;
  const targetAchievementPercentage = targetPeriode > 0 ? (totalSales / targetPeriode) * 100 : 0;

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
      jenisPekerjaan: splitJenisPekerjaan(entry.jenisPekerjaan).join(", "),
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
      const monthlyReports = await getMonthlyReports(selectedStore);
      await downloadDataExcel({ entries: allEntries, monthlyReports });
    } catch (err) {
      console.error(err);
      toast.error("Gagal mendownload data.");
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="gradient-primary px-4 sm:px-6 py-4 sm:py-5 shadow-lg">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="transition-transform hover:scale-105 active:scale-95 shrink-0">
                <img src={logoMobeng} alt="Mobeng Logo" className="h-10 w-10 rounded-lg object-cover ring-2 ring-primary-foreground/50" />
              </Link>
              <div className="flex flex-col justify-center">
                <h1 className="text-base sm:text-lg font-bold text-white leading-tight">All in 1 Store</h1>
                <p className="text-[9px] sm:text-[10px] text-primary-foreground/70 uppercase tracking-wider">{selectedStore}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={loading || allEntries.length === 0}
                className="hidden sm:inline-flex border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5">
                    <span>Menu Store</span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
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
                      <span>Complaint Monitoring</span>
                      {complaints.length > 0 && (
                        <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0">
                          {complaints.length}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
                    <Link to="/analisa" className="flex items-center gap-2 w-full px-2 py-1.5">
                      <BarChart3 className="h-4 w-4 text-indigo-500" />
                      <span>Analisa Teknis</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <div className="space-y-1">
                    <TargetDialog onSuccess={fetchEntries} />
                    <StoreSalesDialog onSuccess={fetchEntries} />
                    <MonthlyReportDialog onSuccess={fetchEntries} />
                  </div>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <DropdownMenuItem onClick={handleDownload} disabled={loading || allEntries.length === 0} className="sm:hidden cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Export Excel</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/select-store" className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-muted-foreground">
                      <span>Ganti Toko</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
      </header>

      <InputForm
        editData={editingEntry}
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingEntry(null);
        }}
        onSuccess={fetchEntries}
      />

      <ComplaintForm
        prefillData={complaintPrefill ?? undefined}
        open={isComplaintOpen}
        onOpenChange={(open) => {
          setIsComplaintOpen(open);
          if (!open) setComplaintPrefill(null);
        }}
        onSuccess={fetchEntries}
        trigger={<span />}
      />

      <main className="container mx-auto flex-1 py-5 sm:py-6 px-3 sm:px-4 space-y-5 sm:space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Memuat data...</p>
        ) : (
          <>
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
                    <SelectItem value="all">Semua Bulan (2026)</SelectItem>
                    {BULAN.map((b, i) => (
                      <SelectItem key={b} value={i.toString()}>
                        {b} 2026
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-heading">{formatIDR(totalSales)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {salesPercentage > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {salesPercentage.toFixed(1)}% dari Total Sales Toko ({formatIDR(currentTotalSalesToko)})
                      </span>
                    ) : (
                      "Total akumulasi pekerjaan"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Unit Dikerjakan</CardTitle>
                  <Car className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-heading">{unitCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total unit kendaraan</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {selectedMonth === "all" ? "Target Sales 2026" : `Target Sales (${BULAN[parseInt(selectedMonth)]})`}
                  </CardTitle>
                  <Target className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-heading">{formatIDR(targetPeriode)}</div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Pencapaian Sales:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {targetAchievementPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(100, targetAchievementPercentage)} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-rose-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Complain Paska Instalasi</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold font-heading text-rose-600 dark:text-rose-400">
                      {complaints.length}
                    </div>
                    <Link to="/complaints">
                      <Button variant="ghost" size="sm" className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1 h-auto">
                        Detail →
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total komplain tercatat</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Tren Sales Bulanan (2026)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tickLine={false} />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                          />
                          <Tooltip
                            formatter={(value: number) => [formatIDR(value), "Sales"]}
                            cursor={{ fill: "transparent" }}
                          />
                          <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, i) => (
                              <Cell key={`cell-${i}`} fill={i === new Date().getMonth() ? "hsl(var(--accent))" : "hsl(var(--primary))"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Jumlah Unit Dikerjakan per Bulan (2026)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartDataEntries}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tickLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <Tooltip
                            formatter={(value: number) => [`${value} Unit`, "Jumlah"]}
                            cursor={{ fill: "transparent" }}
                          />
                          <Bar dataKey="entries" radius={[4, 4, 0, 0]}>
                            {chartDataEntries.map((_, i) => (
                              <Cell key={`cell-${i}`} fill={i === new Date().getMonth() ? "hsl(var(--accent))" : "hsl(var(--primary))"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Peringkat Jenis Pekerjaan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                      {topPekerjaan.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Belum ada data jenis pekerjaan.</p>
                      ) : (
                        topPekerjaan.map((item, i) => {
                          const pct = (item.value / maxPekerjaanSales) * 100;
                          const stats = topModelPerPekerjaan[item.name];
                          const topModelsText = (stats?.models || [])
                            .map((m) => `${m.name} (${m.value})`)
                            .join(", ");
                          return (
                            <div key={item.name} className="space-y-1.5 hover:bg-muted/30 p-1.5 rounded transition-colors">
                              <div className="flex justify-between items-center text-sm">
                                <span className="truncate flex items-center gap-2">
                                  <span className="text-xs font-bold text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
                                  <span className="font-medium">{item.name}</span>
                                </span>
                                <span className="font-semibold text-primary shrink-0 ml-2">{formatIDR(item.value)}</span>
                              </div>
                              <Progress value={pct} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                              {stats?.totalUnit ? (
                                <div className="flex items-start justify-between gap-2 mt-1">
                                  <p
                                    className="text-[11px] text-muted-foreground min-w-0 flex-1 whitespace-normal break-words leading-snug"
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <span className="font-medium text-foreground/70">Kendaraan: </span>
                                    {topModelsText || "-"}
                                  </p>
                                  <span className="text-[10px] text-muted-foreground shrink-0 font-medium bg-muted/60 px-1.5 py-0.5 rounded">
                                    {stats.totalUnit} unit
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Top 20 Model Kendaraan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                      {topModel.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Belum ada data model kendaraan.</p>
                      ) : (
                        topModel.map((item, i) => {
                          const pct = (item.value / maxModelCount) * 100;
                          return (
                            <div key={item.name} className="space-y-1.5 hover:bg-muted/30 p-1 rounded transition-colors">
                              <div className="flex justify-between items-center text-sm">
                                <span className="truncate flex items-center gap-2">
                                  <span className="text-xs font-bold text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
                                  <span className="font-medium">{item.name}</span>
                                </span>
                                <Badge variant="secondary" className="font-semibold text-xs ml-2 shrink-0">
                                  {item.value} Unit
                                </Badge>
                              </div>
                              <Progress value={pct} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="glass-card">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Data Pekerjaan Terbaru</CardTitle>
                  <p className="text-xs text-muted-foreground">Pekerjaan terdaftar beserta penanda status komplain</p>
                </div>
                {totalComplaintsCount > 0 && (
                  <Button
                    variant={showComplaintsOnly ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setShowComplaintsOnly(!showComplaintsOnly)}
                    className="text-xs gap-1.5"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {showComplaintsOnly ? "Tampilkan Semua Data" : `Filter Ada Complain (${totalComplaintsCount})`}
                  </Button>
                )}
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
                        <TableHead>Model & Status Complain</TableHead>
                        <TableHead>Jenis Pekerjaan</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                        <TableHead className="w-28"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEntries.map((e) => {
                        const matchingComplaint = getComplaintForEntry(e);
                        return (
                          <TableRow
                            key={e.id}
                            className={cn(
                              matchingComplaint && "bg-rose-50/40 hover:bg-rose-50/70 dark:bg-rose-950/20"
                            )}
                          >
                            <TableCell className="whitespace-nowrap font-medium text-xs">{e.tanggal}</TableCell>
                            <TableCell>{e.merekKendaraan}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1 items-start">
                                <span className="font-semibold">{e.modelKendaraan}</span>
                                {matchingComplaint && (
                                  <Link to="/complaints">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[10px] px-2 py-0.5 font-bold gap-1 cursor-pointer transition-transform hover:scale-105 shadow-sm",
                                        matchingComplaint.status === "Closed"
                                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                                          : matchingComplaint.status === "Resolved"
                                          ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                                          : matchingComplaint.status === "In Progress"
                                          ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                                          : "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300"
                                      )}
                                      title={`Klik untuk lihat detail di Complaint Monitoring\nJenis: ${matchingComplaint.jenisComplain}\nStatus: ${matchingComplaint.status}\nPIC: ${matchingComplaint.pic || '-'}`}
                                    >
                                      <AlertCircle className="h-3 w-3 shrink-0" />
                                      Complain: {matchingComplaint.status}
                                    </Badge>
                                  </Link>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[240px]">
                              {splitJenisPekerjaan(e.jenisPekerjaan).join(", ")}
                            </TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">{formatIDR(e.jumlahSales)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(e)} title="Edit Pekerjaan">
                                  <Edit2 className="h-4 w-4 text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title={
                                    matchingComplaint
                                      ? `Ada Complain (${matchingComplaint.jenisComplain} - ${matchingComplaint.status}). Klik untuk kelola.`
                                      : "Input Complain"
                                  }
                                  onClick={() => handleOpenComplaint(e)}
                                  className={cn(
                                    "relative hover:bg-accent/10 hover:text-accent",
                                    matchingComplaint && "text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40"
                                  )}
                                >
                                  {matchingComplaint ? (
                                    <>
                                      <MessageSquare className="h-4 w-4 text-rose-600 fill-rose-100" />
                                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                                      </span>
                                    </>
                                  ) : (
                                    <MessageSquarePlus className="h-4 w-4 text-accent" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} title="Hapus Pekerjaan">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
