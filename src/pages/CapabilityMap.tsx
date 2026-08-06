import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Save, RefreshCw, RotateCcw, Trash2, Award, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import logoMobeng from "@/assets/logomobeng.jpg";
import { useStoreContext } from "@/lib/storeContext";
import {
  getCapabilityMap,
  saveCapabilityMap,
  type MechanicRow,
  type CapabilityMapData,
} from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_JOB_COUNT = 10;
const DEFAULT_JOBS = Array.from({ length: DEFAULT_JOB_COUNT }, (_, i) => `Pekerjaan ${i + 1}`);

export default function CapabilityMapPage() {
  const { selectedStore } = useStoreContext();

  const [jobs, setJobs] = useState<string[]>(DEFAULT_JOBS);
  const [rows, setRows] = useState<MechanicRow[]>([]);
  const [rowSeq, setRowSeq] = useState<number>(1);
  const [statusText, setStatusText] = useState<string>("belum tersimpan");
  const [loading, setLoading] = useState<boolean>(true);
  const [resetArmed, setResetArmed] = useState<boolean>(false);

  const todayDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Load data for selected store
  const loadStoreData = useCallback(async () => {
    if (!selectedStore) return;
    setLoading(true);
    try {
      const data = await getCapabilityMap(selectedStore);
      if (data) {
        const loadedJobs = data.jobs && data.jobs.length > 0 ? data.jobs : DEFAULT_JOBS;
        setJobs(loadedJobs);
        setRows(
          (data.rows || []).map((r, idx) => ({
            id: r.id || idx + 1,
            nama: r.nama || "",
            masa: r.masa || "",
            checks:
              r.checks && r.checks.length === loadedJobs.length
                ? r.checks
                : loadedJobs.map((_, i) => Boolean(r.checks && r.checks[i])),
          }))
        );
        if (data.rows && data.rows.length > 0) {
          setRowSeq(Math.max(...data.rows.map((r) => Number(r.id) || 0), 0) + 1);
        }
        setStatusText("data toko dimuat");
      } else {
        // Init with 3 empty rows if no data
        setJobs(DEFAULT_JOBS);
        setRows([
          { id: 1, nama: "", masa: "", checks: Array(DEFAULT_JOB_COUNT).fill(false) },
          { id: 2, nama: "", masa: "", checks: Array(DEFAULT_JOB_COUNT).fill(false) },
          { id: 3, nama: "", masa: "", checks: Array(DEFAULT_JOB_COUNT).fill(false) },
        ]);
        setRowSeq(4);
        setStatusText("belum ada data tersimpan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data capability map.");
    } finally {
      setLoading(false);
    }
  }, [selectedStore]);

  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  // Handle job title change
  const handleJobChange = (index: number, val: string) => {
    const nextJobs = [...jobs];
    nextJobs[index] = val || `Pekerjaan ${index + 1}`;
    setJobs(nextJobs);
    setStatusText("belum tersimpan");
  };

  // Add new Job Type
  const addJobType = () => {
    const newJobTitle = `Pekerjaan ${jobs.length + 1}`;
    setJobs((prev) => [...prev, newJobTitle]);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        checks: [...r.checks, false],
      }))
    );
    setStatusText("belum tersimpan");
    toast.success(`Jenis pekerjaan '${newJobTitle}' ditambahkan.`);
  };

  // Remove Job Type by index
  const removeJobType = (index: number) => {
    if (jobs.length <= 1) {
      toast.error("Minimal harus ada 1 jenis pekerjaan.");
      return;
    }
    const removedName = jobs[index];
    setJobs((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        checks: r.checks.filter((_, i) => i !== index),
      }))
    );
    setStatusText("belum tersimpan");
    toast.info(`Pekerjaan No. ${index + 1} (${removedName}) telah dihapus.`);
  };

  // Add Mechanic Row
  const addRow = (nama = "", masa = "", checks = null) => {
    setRows((prev) => [
      ...prev,
      {
        id: rowSeq,
        nama,
        masa,
        checks: checks || Array(jobs.length).fill(false),
      },
    ]);
    setRowSeq((prev) => prev + 1);
    setStatusText("belum tersimpan");
  };

  // Remove Mechanic Row
  const removeRow = (id: number | string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setStatusText("belum tersimpan");
  };

  // Toggle Stamp Check
  const toggleCheck = (rowId: number | string, jobIndex: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          const nextChecks = [...r.checks];
          nextChecks[jobIndex] = !nextChecks[jobIndex];
          return { ...r, checks: nextChecks };
        }
        return r;
      })
    );
    setStatusText("belum tersimpan");
  };

  // Update Mechanic Text
  const updateMechanicText = (rowId: number | string, field: "nama" | "masa", value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
    setStatusText("belum tersimpan");
  };

  // Save Data
  const handleSave = async () => {
    if (!selectedStore) return;
    try {
      const payload: CapabilityMapData = {
        toko: selectedStore,
        jobs,
        rows,
      };
      await saveCapabilityMap(payload, selectedStore);
      const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      setStatusText(`tersimpan di Supabase (${timeStr})`);
      toast.success(`Data Capability Map (${selectedStore}) berhasil disimpan ke Supabase!`);
    } catch (e: any) {
      console.error("Save Capability Map error:", e);
      const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      setStatusText(`tersimpan lokal (${timeStr})`);
      toast.warning(
        `Tersimpan di penyimpanan lokal! Jika Supabase gagal, jalankan SQL tabel 'capability_maps' di Supabase SQL Editor.`,
        { duration: 6000 }
      );
    }
  };

  // Reset Form
  const handleReset = () => {
    if (!resetArmed) {
      setResetArmed(true);
      setTimeout(() => setResetArmed(false), 3000);
      toast.info("Klik sekali lagi pada tombol Reset Form untuk mengkonfirmasi.");
    } else {
      setRows([]);
      setResetArmed(false);
      setStatusText("form direset");
      toast.success("Form capability map direset.");
    }
  };

  // Calculate Job Percentages
  const getJobPct = (ji: number) => {
    if (!rows.length) return 0;
    const count = rows.filter((r) => r.checks[ji]).length;
    return Math.round((100 * count) / rows.length);
  };

  // Overall Statistics
  const totalMekanik = rows.length;
  const avgPct = jobs.length
    ? Math.round(
        jobs.reduce((sum, _, ji) => sum + getJobPct(ji), 0) / jobs.length
      )
    : 0;

  let bestIdx = -1;
  let worstIdx = -1;
  let bestPct = -1;
  let worstPct = 101;

  jobs.forEach((_, ji) => {
    const pct = getJobPct(ji);
    if (pct > bestPct) {
      bestPct = pct;
      bestIdx = ji;
    }
    if (pct < worstPct) {
      worstPct = pct;
      worstIdx = ji;
    }
  });

  const fullyReady = rows.filter((r) => r.checks.length === jobs.length && r.checks.every(Boolean)).length;

  return (
    <div className="min-h-dvh bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="gradient-primary px-4 sm:px-6 py-4 shadow-lg border-b border-white/10">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard" className="transition-transform hover:scale-105 active:scale-95">
              <img src={logoMobeng} alt="Mobeng Logo" className="h-10 w-10 rounded-lg object-cover ring-2 ring-white/20" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white leading-tight flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                Capability Map Teknisi
              </h1>
              <p className="text-xs text-primary-foreground/80 uppercase tracking-wider">{selectedStore}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/dashboard" className="flex items-center gap-2 w-full px-2 py-1.5">
                    <span>Dashboard Utama</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/complaints" className="flex items-center gap-2 w-full px-2 py-1.5">
                    <span>Complaint Monitoring</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/analisa" className="flex items-center gap-2 w-full px-2 py-1.5">
                    <span>Analisa Teknis</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
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

      {/* Main Sheet Container */}
      <main className="container mx-auto px-2 sm:px-4 py-6 max-w-5xl flex-1 space-y-6">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Ticket Header Section */}
          <div className="bg-slate-900 border-b-4 border-amber-400 p-5 sm:p-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold uppercase tracking-widest mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                  MOBENG WORKSHOP OPS
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase font-heading">
                  Capability Map Teknisi
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  Pemetaan kompetensi mekanik per toko. Isi data mekanik, tandai penguasaan tiap jenis pekerjaan (No. 1–{jobs.length}), dan lihat persentase kesiapan tim secara otomatis.
                </p>
              </div>

              <div className="text-right font-mono text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700 self-end sm:self-start">
                <div>FORM-CM</div>
                <div className="text-amber-400 font-semibold">{todayDate}</div>
              </div>
            </div>

            {/* Store Banner */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="w-full sm:max-w-md">
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1 tracking-wider">
                  Toko Saat Ini
                </label>
                <Input
                  type="text"
                  value={selectedStore}
                  disabled
                  className="bg-slate-950/80 border-slate-700 text-amber-300 font-semibold text-lg h-11"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Status:</span>
                <Badge variant={statusText.startsWith("tersimpan") ? "default" : "secondary"} className="bg-amber-500/20 text-amber-300 border-amber-500/40">
                  {statusText}
                </Badge>
              </div>
            </div>
          </div>

          {/* Job Legend Grid */}
          <div className="p-5 sm:p-6 border-b border-slate-700/80 bg-slate-800/40">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <span>Daftar Jenis Pekerjaan (No. 1–{jobs.length})</span>
              </h3>
              <Button
                onClick={addJobType}
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs h-7 px-2.5 font-bold gap-1 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                + Tambah Jenis Pekerjaan
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {jobs.map((jobName, i) => (
                <div key={i} className="group relative flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-md border border-slate-700/60 focus-within:border-amber-400 transition-colors">
                  <span className="h-6 w-6 rounded bg-amber-500 text-slate-950 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <Input
                    type="text"
                    value={jobName}
                    onChange={(e) => handleJobChange(i, e.target.value)}
                    className="h-7 text-xs bg-transparent border-none focus-visible:ring-0 px-1 text-slate-200"
                    placeholder={`Pekerjaan ${i + 1}`}
                  />
                  {jobs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeJobType(i)}
                      title={`Hapus Pekerjaan No. ${i + 1}`}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors opacity-70 group-hover:opacity-100 shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-400" />
                Memuat data capability map...
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse border border-slate-700 bg-slate-900 rounded-lg overflow-hidden min-w-[820px]">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 font-mono uppercase text-[11px] border-b border-slate-700">
                    <th className="py-3 px-2 text-center w-10 border-r border-slate-700">No</th>
                    <th className="py-3 px-3 min-w-[160px] border-r border-slate-700">Nama Mekanik</th>
                    <th className="py-3 px-3 min-w-[110px] border-r border-slate-700">Masa Kerja</th>
                    {jobs.map((j, i) => (
                      <th
                        key={i}
                        className="py-3 px-1 text-center w-10 border-r border-slate-700 text-[10px]"
                        title={j}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-amber-400 font-bold">{i + 1}</span>
                          <span className="truncate max-w-[50px] inline-block font-normal text-slate-400">{j}</span>
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-2 text-center min-w-[60px] border-r border-slate-700">Skor</th>
                    <th className="py-3 px-2 text-center w-10"></th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={jobs.length + 4} className="py-8 text-center text-slate-400 font-mono italic">
                        Belum ada mekanik. Klik "+ Tambah Mekanik" untuk mulai mengisi data.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => {
                      const score = r.checks.filter(Boolean).length;
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-slate-800 hover:bg-slate-800/60 transition-colors"
                        >
                          <td className="py-2.5 px-2 text-center font-mono text-slate-400 border-r border-slate-800">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-2 border-r border-slate-800">
                            <Input
                              type="text"
                              value={r.nama}
                              placeholder="Nama mekanik"
                              onChange={(e) => updateMechanicText(r.id, "nama", e.target.value)}
                              className="h-8 text-xs bg-slate-950/60 border-slate-800 text-white focus-visible:ring-amber-500"
                            />
                          </td>
                          <td className="py-1 px-2 border-r border-slate-800">
                            <Input
                              type="text"
                              value={r.masa}
                              placeholder="cth: 2 tahun"
                              onChange={(e) => updateMechanicText(r.id, "masa", e.target.value)}
                              className="h-8 text-xs bg-slate-950/60 border-slate-800 text-slate-300 focus-visible:ring-amber-500"
                            />
                          </td>

                          {jobs.map((_, ji) => {
                            const checked = Boolean(r.checks[ji]);
                            return (
                              <td key={ji} className="py-2 px-1 text-center border-r border-slate-800">
                                <button
                                  type="button"
                                  title={jobs[ji]}
                                  onClick={() => toggleCheck(r.id, ji)}
                                  className={`w-7 h-7 mx-auto rounded flex items-center justify-center font-bold text-xs transition-all duration-150 ${
                                    checked
                                      ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 scale-105"
                                      : "bg-slate-800 text-transparent border border-slate-700 hover:border-amber-400/60"
                                  }`}
                                >
                                  ✓
                                </button>
                              </td>
                            );
                          })}

                          <td className="py-2 px-2 text-center border-r border-slate-800">
                            <Badge
                              variant="outline"
                              className={`font-mono text-xs font-bold border ${
                                score === jobs.length
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : score >= Math.ceil(jobs.length / 2)
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                  : "bg-slate-800 text-slate-300 border-slate-700"
                              }`}
                            >
                              {score}/{jobs.length}
                            </Badge>
                          </td>

                          <td className="py-2 px-1 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRow(r.id)}
                              className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
                              title="Hapus Mekanik"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {/* Table Footer: % MEKANIK YANG MENGUASAI */}
                {rows.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-950 text-slate-200 font-mono text-xs border-t-2 border-slate-700">
                      <td colSpan={3} className="py-3 px-4 text-right font-bold tracking-wider text-amber-400 border-r border-slate-700 uppercase">
                        % Mekanik Menguasai
                      </td>
                      {jobs.map((_, ji) => {
                        const pct = getJobPct(ji);
                        return (
                          <td key={ji} className="py-2 px-1 text-center border-r border-slate-800 relative overflow-hidden">
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-amber-500/20 transition-all duration-300"
                              style={{ height: `${pct}%` }}
                            />
                            <span className="relative z-10 font-bold text-[11px] text-amber-300">{pct}%</span>
                          </td>
                        );
                      })}
                      <td className="border-r border-slate-800"></td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-700/80 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => addRow()}
              className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-semibold font-mono text-xs gap-2"
            >
              <UserPlus className="h-4 w-4" />
              + Tambah Mekanik
            </Button>

            <Button
              onClick={addJobType}
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-mono text-xs gap-2"
            >
              <Plus className="h-4 w-4 text-amber-400" />
              + Tambah Jenis Pekerjaan
            </Button>

            <Button
              onClick={handleSave}
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white font-mono text-xs gap-2"
            >
              <Save className="h-4 w-4 text-emerald-400" />
              Simpan Data
            </Button>

            <Button
              onClick={loadStoreData}
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white font-mono text-xs gap-2"
            >
              <RefreshCw className="h-4 w-4 text-sky-400" />
              Muat Data Toko
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              className={`font-mono text-xs gap-2 ${
                resetArmed
                  ? "bg-rose-600 text-white border-rose-500 hover:bg-rose-700"
                  : "border-slate-700 bg-slate-800 text-rose-400 hover:bg-rose-950/40"
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              {resetArmed ? "Konfirmasi Reset?" : "Reset Form"}
            </Button>
          </div>

          {/* Summary Panel */}
          <div className="p-5 sm:p-6 bg-slate-950/60 border-t border-slate-700/80">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="py-3 px-4 bg-slate-950 border-b border-slate-800">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center justify-between">
                  <span>Rekap Kesiapan per Jenis Pekerjaan</span>
                  <span className="text-slate-400 font-normal text-[10px]">Toko: {selectedStore}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  {jobs.map((jobName, ji) => {
                    const pct = getJobPct(ji);
                    return (
                      <div key={ji} className="flex items-center gap-3 text-xs font-mono">
                        <span className="h-5 w-5 rounded bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-700">
                          {ji + 1}
                        </span>
                        <span className="w-36 sm:w-48 truncate text-slate-300" title={jobName}>
                          {jobName}
                        </span>
                        <div className="flex-1 h-3 bg-slate-800 rounded overflow-hidden border border-slate-700/60 relative">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-bold text-amber-300">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* Overall Statistics Badges */}
                <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center font-mono">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div className="text-xl font-bold text-white">{totalMekanik}</div>
                    <div className="text-[10px] uppercase text-slate-400 mt-0.5">Total Mekanik</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div className="text-xl font-bold text-amber-400">{avgPct}%</div>
                    <div className="text-[10px] uppercase text-slate-400 mt-0.5">Rata-rata Kesiapan</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div className="text-xl font-bold text-emerald-400">{fullyReady}</div>
                    <div className="text-[10px] uppercase text-slate-400 mt-0.5">Kuasai Semua ({jobs.length}/{jobs.length})</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div className="text-base font-bold text-sky-400 truncate">
                      {rows.length && bestIdx >= 0 ? `${bestPct}%` : "-"}
                    </div>
                    <div className="text-[9px] uppercase text-slate-400 mt-0.5 truncate" title={bestIdx >= 0 ? jobs[bestIdx] : ""}>
                      Tertinggi: {bestIdx >= 0 ? jobs[bestIdx] : "-"}
                    </div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div className="text-base font-bold text-rose-400 truncate">
                      {rows.length && worstIdx >= 0 ? `${worstPct}%` : "-"}
                    </div>
                    <div className="text-[9px] uppercase text-slate-400 mt-0.5 truncate" title={worstIdx >= 0 ? jobs[worstIdx] : ""}>
                      Terendah: {worstIdx >= 0 ? jobs[worstIdx] : "-"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs font-mono text-slate-500 border-t border-slate-800/80">
        Data tersimpan secara otomatis untuk toko <span className="text-slate-400">{selectedStore}</span>.
      </footer>
    </div>
  );
}
