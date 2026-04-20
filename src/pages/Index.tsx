import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Car, TrendingUp, Target, Trash2, AlertCircle, Download, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InputForm } from "@/components/InputForm";
import { MonthlyReportDialog } from "@/components/MonthlyReportDialog";
import {
  getEntries,
  formatIDR,
  getMonthlySales,
  getTopPekerjaan,
  getTopModelKendaraan,
  TARGET_TAHUNAN,
  BULAN,
  deleteEntry,
  getMonthlyReports,
  splitJenisPekerjaan,
  downloadDataExcel,
  type SalesEntry,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import logoMobeng from "@/assets/logomobeng.jpg";

export default function Dashboard() {
  const [allEntries, setAllEntries] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<SalesEntry | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const data = await getEntries();
      setAllEntries(data);
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

  const totalSales = allEntries.reduce((sum, e) => sum + e.jumlahSales, 0);
  const progressPct = Math.min((totalSales / TARGET_TAHUNAN) * 100, 100);
  const sisaTarget = Math.max(TARGET_TAHUNAN - totalSales, 0);
  const monthlySales = getMonthlySales(allEntries);
  const topPekerjaan = getTopPekerjaan(allEntries);
  const topModel = getTopModelKendaraan(allEntries, 10);
  const unitCount = allEntries.length;

  const chartData = BULAN.map((name, i) => ({ name, sales: monthlySales[i] }));

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
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={logoMobeng} alt="Mobeng Logo" className="h-12 w-12 rounded-lg object-cover ring-2 ring-primary-foreground shadow-md" />
            <div>
              <h1 className="text-2xl text-primary-foreground">All in 1 Store 2026</h1>
              <p className="text-primary-foreground/70 text-sm font-body">Mobeng Harapan Indah — Dashboard Tracking</p>
            </div>
          </div>
          <div className="flex w-full flex-col sm:w-auto sm:flex-row gap-2">
            <InputForm onSuccess={fetchEntries} />
            <MonthlyReportDialog />
            <Button variant="secondary" className="gap-2 w-full sm:w-auto" onClick={handleDownload} disabled={loading}>
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
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

      <main className="container mx-auto flex-1 py-5 sm:py-6 px-3 sm:px-4 space-y-5 sm:space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Memuat data...</p>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-body text-muted-foreground">Total Sales 2026</CardTitle>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-heading font-bold">{formatIDR(totalSales)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{progressPct.toFixed(1)}% dari target</p>
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
                  <CardTitle className="text-sm font-medium font-body text-muted-foreground">Unit Entry</CardTitle>
                  <Card className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-heading font-bold">{unitCount}</div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-body text-muted-foreground">Progress Target</CardTitle>
                  <Target className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-heading font-bold mb-2">{progressPct.toFixed(1)}%</div>
                  <Progress value={progressPct} className="h-3" />
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="glass-card lg:col-span-2">
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

              <div className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Top 5 Jenis Pekerjaan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topPekerjaan.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-8">Belum ada data</p>
                    ) : (
                      <div className="space-y-4">
                        {topPekerjaan.map((item, i) => {
                          const maxVal = topPekerjaan[0]?.value || 1;
                          const pct = (item.value / maxVal) * 100;
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
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Top 10 Model Kendaraan</CardTitle>
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

            {/* Recent Entries Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Data Pekerjaan Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                {allEntries.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Belum ada data. Klik "Input Data Baru" untuk mulai.</p>
                ) : (
                  <Table className="min-w-[720px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Merek</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Jenis Pekerjaan</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allEntries.slice(0, 20).map((e) => (
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
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
