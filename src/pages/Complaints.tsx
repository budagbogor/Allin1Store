import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { AlertCircle, CheckCircle2, Clock, Trash2, ArrowLeft, MessageSquare, Edit, CheckCircle, UserCheck, Wrench, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ComplaintForm } from "@/components/ComplaintForm";
import {
  getComplaints,
  deleteComplaint,
  getComplaintStats,
  getComplaintCauseStats,
  getEntries,
  type ComplaintEntry,
  type SalesEntry,
  BULAN,
} from "@/lib/data";
import { useStoreContext } from "@/lib/storeContext";
import logoMobeng from "@/assets/logomobeng.jpg";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#8b5cf6", "#3b82f6", "#10b981", "#64748b"];
const CAUSE_COLORS: Record<string, string> = {
  "Spare Part": "#ef4444",
  Pengerjaan: "#f97316",
  "Faktor Lain": "#8b5cf6",
  "Belum Diidentifikasi": "#94a3b8",
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintEntry[]>([]);
  const [salesEntries, setSalesEntries] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingComplaint, setEditingComplaint] = useState<ComplaintEntry | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { selectedStore } = useStoreContext();

  const fetchComplaints = useCallback(async () => {
    if (!selectedStore) return;
    try {
      const [complaintData, salesData] = await Promise.all([
        getComplaints(selectedStore),
        getEntries(selectedStore),
      ]);
      setComplaints(complaintData);
      setSalesEntries(salesData);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data complain.");
    } finally {
      setLoading(false);
    }
  }, [selectedStore]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const stats = getComplaintStats(complaints);
  const causeStats = getComplaintCauseStats(complaints);
  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter((c) => c.status === "Open").length;
  const inProgressComplaints = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedComplaints = complaints.filter((c) => c.status === "Resolved").length;
  const closedComplaints = complaints.filter((c) => c.status === "Closed").length;

  const getComplaintLastTxMonth = (c: ComplaintEntry) => {
    const compDate = new Date(c.tanggal);

    // Try matching by Work Order number first
    if (c.noWo && c.noWo.trim()) {
      const match = salesEntries.find((s) => s.noWo && s.noWo.trim().toLowerCase() === c.noWo!.trim().toLowerCase());
      if (match) {
        return new Date(match.tanggal);
      }
    }

    // Legacy fallback by brand/model/date
    const compMerek = (c.merekKendaraan || "").trim().toLowerCase();
    const compModel = (c.modelKendaraan || "").trim().toLowerCase();

    const matchingSales = salesEntries.filter((s) => {
      // If either has a different non-empty WO, don't match (prevents false matches on different units)
      if ((c.noWo && c.noWo.trim()) || (s.noWo && s.noWo.trim())) {
        if (c.noWo?.trim().toLowerCase() !== s.noWo?.trim().toLowerCase()) {
          return false;
        }
      }
      const salesMerek = (s.merekKendaraan || "").trim().toLowerCase();
      const salesModel = (s.modelKendaraan || "").trim().toLowerCase();
      const isMerekMatch = compMerek.includes(salesMerek) || salesMerek.includes(compMerek) || compMerek === salesMerek;
      const isModelMatch = compModel.includes(salesModel) || salesModel.includes(compModel) || compModel === salesModel;
      return isMerekMatch && isModelMatch && new Date(s.tanggal) <= compDate;
    });

    if (matchingSales.length > 0) {
      matchingSales.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      return new Date(matchingSales[0].tanggal);
    }

    return compDate;
  };

  const monthlyStats = Array.from({ length: 12 }, (_, monthIdx) => {
    const salesCount = salesEntries.filter((s) => {
      const d = new Date(s.tanggal);
      return d.getFullYear() === 2026 && d.getMonth() === monthIdx;
    }).length;

    const complaintCount = complaints.filter((c) => {
      const lastTxDate = getComplaintLastTxMonth(c);
      return lastTxDate.getFullYear() === 2026 && lastTxDate.getMonth() === monthIdx;
    }).length;

    const ratio = salesCount > 0 ? complaintCount / salesCount : 0;

    return {
      monthName: BULAN[monthIdx],
      salesCount,
      complaintCount,
      ratio,
    };
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data complain ini?")) return;
    try {
      await deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
      toast.success("Data dihapus.");
    } catch {
      toast.error("Gagal menghapus data.");
    }
  };

  const handleOpenEdit = (complaint: ComplaintEntry) => {
    setEditingComplaint(complaint);
    setIsEditOpen(true);
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="bg-slate-900 px-4 sm:px-6 py-4 shadow-lg border-b border-accent/20">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard" className="transition-transform hover:scale-105 active:scale-95">
              <img src={logoMobeng} alt="Mobeng Logo" className="h-10 w-10 rounded-lg object-cover" />
            </Link>
            <div>
              <h1 className="text-xl text-white font-heading">Complaint Monitoring</h1>
              <p className="text-slate-400 text-xs font-body">{selectedStore}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <Link to="/capability-map">
              <Button variant="outline" size="sm" className="border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 gap-1.5 text-xs">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Capability Map</span>
              </Button>
            </Link>
            <ComplaintForm onSuccess={fetchComplaints} />
          </div>
        </div>
      </header>

      {/* Edit Modal */}
      {isEditOpen && (
        <ComplaintForm
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) setEditingComplaint(null);
          }}
          initialData={editingComplaint}
          onSuccess={fetchComplaints}
        />
      )}

      <main className="container mx-auto flex-1 py-6 px-4 space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Memuat data complain...</p>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="glass-card border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Complain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{totalComplaints}</div>
                    <MessageSquare className="h-7 w-7 text-primary/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status: Open</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-red-500">{openComplaints}</div>
                    <AlertCircle className="h-7 w-7 text-red-500/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-amber-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-amber-500">{inProgressComplaints}</div>
                    <Clock className="h-7 w-7 text-amber-500/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-500">{resolvedComplaints}</div>
                    <CheckCircle2 className="h-7 w-7 text-blue-500/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-emerald-600 sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Closed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-emerald-600">{closedComplaints}</div>
                    <CheckCircle className="h-7 w-7 text-emerald-600/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-accent" />
                    Distribusi Jenis Complain
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {stats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-amber-500" />
                    Analisa Penyebab Masalah
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={causeStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {causeStats.map((entry) => (
                            <Cell key={entry.name} fill={CAUSE_COLORS[entry.name] || "#64748b"} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t">
                    {causeStats.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: CAUSE_COLORS[entry.name] || "#64748b" }}
                        />
                        <span className="truncate font-medium">{entry.name}</span>
                        <span className="text-muted-foreground ml-auto">({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Complaint Ratio Section */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Rasio Rework (Per Bulan Transaksi)
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Rasio rework dihitung berdasarkan perbandingan jumlah unit complain dengan total unit entry service baru pada bulan transaksi service terakhir unit tersebut.
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800">
                        <TableHead>Bulan Transaksi Service Terakhir</TableHead>
                        <TableHead className="text-center">Total Unit Service Baru</TableHead>
                        <TableHead className="text-center">Jumlah Unit Complain</TableHead>
                        <TableHead className="text-center font-bold">Rasio Rework</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyStats
                        .filter((m) => m.salesCount > 0 || m.complaintCount > 0)
                        .map((m) => (
                          <TableRow key={m.monthName} className="hover:bg-slate-50/50">
                            <TableCell className="font-semibold">{m.monthName} 2026</TableCell>
                            <TableCell className="text-center">{m.salesCount} unit</TableCell>
                            <TableCell className="text-center">{m.complaintCount} unit</TableCell>
                            <TableCell className="text-center font-bold">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                m.ratio > 0.1 ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" :
                                m.ratio > 0.05 ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                                m.ratio > 0 ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                                "bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-300"
                              }`}>
                                {m.ratio.toFixed(2)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      {monthlyStats.filter((m) => m.salesCount > 0 || m.complaintCount > 0).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">
                            Belum ada data transaksi service atau complain untuk tahun 2026.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Complaints Table */}
            <Card className="glass-card overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Log Penanganan & Tracking Complain</CardTitle>
                  <p className="text-xs text-muted-foreground">Kelola status hingga Closed, tentukan PIC, dan catat kesimpulan penyebab masalah</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {complaints.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-12">Belum ada data complain.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800">
                          <TableHead>No. WO</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Unit Kendaraan</TableHead>
                          <TableHead>Jenis Complain</TableHead>
                          <TableHead>Penyebab Masalah</TableHead>
                          <TableHead>PIC Menangani</TableHead>
                          <TableHead>Catatan Solusi / Masalah</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {complaints.map((c) => (
                          <TableRow key={c.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-mono text-xs font-bold text-slate-600">{c.noWo || "-"}</TableCell>
                            <TableCell className="whitespace-nowrap font-medium text-xs">{c.tanggal}</TableCell>
                            <TableCell>
                              <div className="text-sm font-bold">{c.modelKendaraan}</div>
                              <div className="text-xs text-muted-foreground">{c.merekKendaraan}</div>
                              {c.jenisPekerjaanSebelumnya && (
                                <div className="text-[11px] text-accent font-medium mt-1 inline-flex items-center gap-1 bg-accent/10 px-1.5 py-0.5 rounded">
                                  <span>Pekerjaan:</span>
                                  <span className="font-semibold">{c.jenisPekerjaanSebelumnya}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                {c.jenisComplain}
                              </span>
                            </TableCell>
                            <TableCell>
                              {c.penyebabMasalah ? (
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                                  c.penyebabMasalah === "Spare Part" ? "bg-red-50 text-red-700 border border-red-200" :
                                  c.penyebabMasalah === "Pengerjaan" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                  "bg-purple-50 text-purple-700 border border-purple-200"
                                }`}>
                                  {c.penyebabMasalah}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {c.pic ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                                  {c.pic}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">-</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2" title={c.catatanPenanganan || c.keterangan}>
                                {c.catatanPenanganan || c.keterangan || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                c.status === "Closed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                                c.status === "Resolved" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" : 
                                c.status === "In Progress" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : 
                                "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              }`}>
                                {c.status === "Closed" && "🟢 "}
                                {c.status === "Resolved" && "🔵 "}
                                {c.status === "In Progress" && "🟡 "}
                                {c.status === "Open" && "🔴 "}
                                {c.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Edit / Penanganan"
                                  onClick={() => handleOpenEdit(c)}
                                >
                                  <Edit className="h-4 w-4 text-accent" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Hapus"
                                  onClick={() => handleDelete(c.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <footer className="bg-slate-900 py-4 text-center border-t border-slate-800">
        <p className="text-xs text-slate-500">© 2026 Quality Assurance Department — {selectedStore}</p>
      </footer>
    </div>
  );
}

