import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  ArrowLeft, Clock, Wrench, ClipboardList, Search, Timer, ChevronDown, ChevronUp, Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import logoMobeng from "@/assets/logomobeng.jpg";
import {
  getEntries,
  getLeadtimeByPekerjaan,
  getTopSpecialTools,
  getAvgLeadtimeMenit,
  getEntriesWithLangkah,
  formatLeadtime,
  splitJenisPekerjaan,
  type SalesEntry,
} from "@/lib/data";
import { useStoreContext } from "@/lib/storeContext";

const CHART_COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#7c3aed", "#4f46e5",
  "#06b6d4", "#0891b2", "#0e7490", "#10b981", "#059669",
  "#f59e0b", "#d97706",
];

function formatMenit(menit: number): string {
  if (menit === 0) return "-";
  const j = Math.floor(menit / 60);
  const m = menit % 60;
  if (j === 0) return `${m} menit`;
  if (m === 0) return `${j} jam`;
  return `${j}j ${m}m`;
}

interface LangkahRowProps {
  entry: SalesEntry;
}

function LangkahRow({ entry }: LangkahRowProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <TableRow className="hover:bg-muted/50 transition-colors">
        <TableCell className="whitespace-nowrap font-medium">{entry.tanggal}</TableCell>
        <TableCell>
          <div className="font-semibold text-sm">{entry.modelKendaraan}</div>
          <div className="text-xs text-muted-foreground">{entry.merekKendaraan}</div>
        </TableCell>
        <TableCell className="max-w-[200px]">
          <div className="flex flex-wrap gap-1">
            {splitJenisPekerjaan(entry.jenisPekerjaan).map((j, i) => (
              <span key={i} className="inline-flex text-xs bg-secondary px-2 py-0.5 rounded-full">{j}</span>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-center whitespace-nowrap text-sm">
          {formatLeadtime(entry.leadtimeJam ?? 0, entry.leadtimeMenit ?? 0)}
        </TableCell>
        <TableCell className="text-center">
          {entry.specialTools
            ? entry.specialTools.split(" | ").filter(Boolean).map((t, i) => (
                <span key={i} className="inline-flex text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mr-1 mb-1">{t}</span>
              ))
            : <span className="text-muted-foreground text-xs">-</span>
          }
        </TableCell>
        <TableCell className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-7 gap-1 text-xs"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Tutup" : "Lihat"}
          </Button>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 px-6 pb-4 pt-2">
            <div className="flex items-start gap-2">
              <ClipboardList className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Langkah Pengerjaan</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{entry.langkahPengerjaan}</p>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function AnalisaPage() {
  const [allEntries, setAllEntries] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedStore } = useStoreContext();

  const fetchEntriesData = useCallback(async () => {
    if (!selectedStore) return;
    try {
      const data = await getEntries(selectedStore);
      setAllEntries(data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data analisa.");
    } finally {
      setLoading(false);
    }
  }, [selectedStore]);

  useEffect(() => {
    fetchEntriesData();
  }, [fetchEntriesData]);

  const leadtimeByPekerjaan = getLeadtimeByPekerjaan(allEntries);
  const topTools = getTopSpecialTools(allEntries);
  const avgLeadtime = getAvgLeadtimeMenit(allEntries);
  const entriesWithLangkah = getEntriesWithLangkah(allEntries);

  const totalWithLeadtime = allEntries.filter(
    e => (e.leadtimeJam ?? 0) > 0 || (e.leadtimeMenit ?? 0) > 0
  ).length;

  const maxLeadtime = allEntries.reduce((max, e) => {
    const total = (e.leadtimeJam ?? 0) * 60 + (e.leadtimeMenit ?? 0);
    return total > max ? total : max;
  }, 0);
  const maxLeadtimeEntry = allEntries.find(
    e => (e.leadtimeJam ?? 0) * 60 + (e.leadtimeMenit ?? 0) === maxLeadtime
  );

  const filteredLangkah = entriesWithLangkah.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.merekKendaraan.toLowerCase().includes(q) ||
      e.modelKendaraan.toLowerCase().includes(q) ||
      e.jenisPekerjaan.toLowerCase().includes(q) ||
      (e.langkahPengerjaan ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header */}
      <header
        className="px-4 sm:px-6 py-4 shadow-lg"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)" }}
      >
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
              <h1 className="text-xl text-white font-heading">Dashboard Analisa Teknis</h1>
              <p className="text-indigo-300 text-xs font-body">{selectedStore}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link to="/capability-map">
              <Button variant="outline" size="sm" className="border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 gap-1.5 text-xs">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Capability Map</span>
              </Button>
            </Link>
            <div className="text-right hidden sm:block">
              <p className="text-indigo-200 text-xs">{allEntries.length} total data pekerjaan</p>
              <p className="text-indigo-300 text-xs">{totalWithLeadtime} dengan data leadtime</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 py-6 px-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Memuat data analisa...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card border-l-4 border-l-indigo-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Timer className="h-4 w-4 text-indigo-500" />
                    Rata-rata Leadtime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatMenit(avgLeadtime)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">dari {totalWithLeadtime} data terisi</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    Leadtime Terlama
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {formatMenit(maxLeadtime)}
                  </div>
                  {maxLeadtimeEntry && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {maxLeadtimeEntry.merekKendaraan} {maxLeadtimeEntry.modelKendaraan}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-500" />
                    Total Special Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {topTools.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">jenis tools unik tercatat</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-emerald-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-emerald-500" />
                    Langkah Didokumentasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {entriesWithLangkah.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    dari {allEntries.length} total pekerjaan
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leadtime per Pekerjaan */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-500" />
                    Rata-rata Leadtime per Pekerjaan
                    <span className="text-xs font-normal text-muted-foreground ml-1">(menit)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leadtimeByPekerjaan.length === 0 ? (
                    <div className="h-[500px] flex items-center justify-center">
                      <p className="text-muted-foreground text-sm text-center">
                        Belum ada data leadtime.<br />
                        <span className="text-xs">Isi field leadtime saat input pekerjaan.</span>
                      </p>
                    </div>
                  ) : (
                    <div className="h-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={leadtimeByPekerjaan} layout="vertical" margin={{ left: 8, right: 32 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}m`} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={350}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(val: number) => [`${formatMenit(val)}`, "Avg Leadtime"]}
                            labelFormatter={(label) => label}
                          />
                          <Bar dataKey="avgMenit" radius={[0, 4, 4, 0]}>
                            {leadtimeByPekerjaan.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Special Tools */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-500" />
                    Top Special Tools Digunakan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topTools.length === 0 ? (
                    <div className="h-[500px] flex items-center justify-center">
                      <p className="text-muted-foreground text-sm text-center">
                        Belum ada data special tools.<br />
                        <span className="text-xs">Isi field special tools saat input pekerjaan.</span>
                      </p>
                    </div>
                  ) : (
                    <div className="h-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topTools} layout="vertical" margin={{ left: 8, right: 32 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={300}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip formatter={(val: number) => [`${val}x digunakan`, "Frekuensi"]} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {topTools.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[(i + 5) % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Leadtime Stats per Pekerjaan — Tabel Ringkas */}
            {leadtimeByPekerjaan.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Timer className="h-5 w-5 text-indigo-500" />
                    Statistik Leadtime per Jenis Pekerjaan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[45%] min-w-[250px]">Jenis Pekerjaan</TableHead>
                          <TableHead className="text-center whitespace-nowrap">Jumlah Data</TableHead>
                          <TableHead className="text-center whitespace-nowrap">Avg Leadtime</TableHead>
                          <TableHead className="w-full">Proporsi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leadtimeByPekerjaan.map((item, i) => {
                          const maxVal = leadtimeByPekerjaan[0]?.avgMenit || 1;
                          const pct = (item.avgMenit / maxVal) * 100;
                          return (
                            <TableRow key={item.name}>
                              <TableCell className="font-medium text-sm">{item.name}</TableCell>
                              <TableCell className="text-center text-sm">{item.count}x</TableCell>
                              <TableCell className="text-center font-semibold text-sm text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                {formatMenit(item.avgMenit)}
                              </TableCell>
                              <TableCell>
                                <div className="h-2 rounded-full bg-secondary overflow-hidden min-w-[80px]">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${pct}%`,
                                      background: CHART_COLORS[i % CHART_COLORS.length],
                                    }}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Log Langkah Pengerjaan */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-emerald-500" />
                    Log Langkah Pengerjaan
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      ({filteredLangkah.length} entri)
                    </span>
                  </CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari kendaraan, pekerjaan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {entriesWithLangkah.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Belum ada langkah pengerjaan yang didokumentasikan.</p>
                    <p className="text-xs text-muted-foreground mt-1">Isi field "Langkah Pengerjaan" saat input data baru.</p>
                  </div>
                ) : filteredLangkah.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <p className="text-muted-foreground text-sm">Tidak ada hasil untuk "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Kendaraan</TableHead>
                          <TableHead>Jenis Pekerjaan</TableHead>
                          <TableHead className="text-center">Leadtime</TableHead>
                          <TableHead className="text-center">Special Tools</TableHead>
                          <TableHead className="text-center">Langkah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLangkah.map((entry) => (
                          <LangkahRow key={entry.id} entry={entry} />
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

      <footer
        className="py-4 text-center border-t"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}
      >
        <p className="text-xs text-indigo-400">© 2026 Technical Analysis — {selectedStore}</p>
      </footer>
    </div>
  );
}
