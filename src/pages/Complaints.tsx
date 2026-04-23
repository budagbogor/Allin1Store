import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { AlertCircle, CheckCircle2, Clock, Trash2, ArrowLeft, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ComplaintForm } from "@/components/ComplaintForm";
import { getComplaints, deleteComplaint, getComplaintStats, type ComplaintEntry } from "@/lib/data";
import logoMobeng from "@/assets/logomobeng.jpg";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#8b5cf6", "#3b82f6", "#10b981", "#64748b"];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data complain.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const stats = getComplaintStats(complaints);
  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(c => c.status === "Open").length;
  const inProgressComplaints = complaints.filter(c => c.status === "In Progress").length;
  const resolvedComplaints = complaints.filter(c => c.status === "Resolved").length;

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

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="bg-slate-900 px-4 sm:px-6 py-4 shadow-lg border-b border-accent/20">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <img src={logoMobeng} alt="Mobeng Logo" className="h-10 w-10 rounded-lg object-cover" />
            <div>
              <h1 className="text-xl text-white font-heading">Complaint Monitoring</h1>
              <p className="text-slate-400 text-xs font-body">Paska Instalasi & Service</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <ComplaintForm onSuccess={fetchComplaints} />
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 py-6 px-4 space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Memuat data complain...</p>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Complain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{totalComplaints}</div>
                    <MessageSquare className="h-8 w-8 text-primary/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status: Open</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-red-500">{openComplaints}</div>
                    <AlertCircle className="h-8 w-8 text-red-500/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-orange-500">{inProgressComplaints}</div>
                    <Clock className="h-8 w-8 text-orange-500/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-emerald-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-emerald-500">{resolvedComplaints}</div>
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
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
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
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
                  <CardTitle className="text-lg">Persentase Complain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {stats.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Complaints Table */}
            <Card className="glass-card overflow-hidden">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg">Log Complain Kendaraan</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {complaints.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-12">Belum ada data complain.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Jenis Complain</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {complaints.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="whitespace-nowrap font-medium">{c.tanggal}</TableCell>
                            <TableCell>
                              <div className="text-sm font-bold">{c.modelKendaraan}</div>
                              <div className="text-xs text-muted-foreground">{c.merekKendaraan}</div>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">
                                {c.jenisComplain}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{c.keterangan || "-"}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                c.status === "Resolved" ? "bg-emerald-100 text-emerald-800" : 
                                c.status === "In Progress" ? "bg-orange-100 text-orange-800" : 
                                "bg-slate-100 text-slate-800"
                              }`}>
                                {c.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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
        <p className="text-xs text-slate-500">© 2026 Quality Assurance Department — Mobeng</p>
      </footer>
    </div>
  );
}
