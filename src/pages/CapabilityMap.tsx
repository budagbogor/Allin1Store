import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Save, RefreshCw, RotateCcw, Trash2, Award, ChevronDown, Plus, X, Printer } from "lucide-react";
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

  // Print PDF
  const handlePrint = () => {
    window.print();
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
    <div className="min-h-dvh bg-slate-100 text-slate-800 flex flex-col font-sans print:bg-white print:text-black">
      {/* Dynamic Print Compact CSS Styles for A4 Portrait 1-Page */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 3mm 4mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-size: 9.5px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-container {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-compact-p {
            padding: 4px 8px !important;
          }
          .print-compact-gap {
            gap: 4px !important;
          }
          .print-compact-row {
            padding-top: 1px !important;
            padding-bottom: 1px !important;
          }
          .print-compact-input {
            height: 20px !important;
            font-size: 9px !important;
            padding: 0 4px !important;
          }
          .print-compact-bar {
            height: 6px !important;
          }
          .print-stat-box {
            padding: 3px 6px !important;
          }
          .print-stat-num {
            font-size: 12px !important;
          }
          table {
            min-width: 100% !important;
            width: 100% !important;
          }
          th, td {
            padding: 2px 2px !important;
            font-size: 9px !important;
          }
          button {
            border-width: 1px !important;
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <header className="gradient-primary px-4 sm:px-6 py-4 shadow-lg border-b border-white/10 print-hidden">
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
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="border-sky-300 bg-white text-sky-700 hover:bg-sky-50 gap-1.5 font-bold shadow-sm"
            >
              <Printer className="h-4 w-4 text-sky-600" />
              <span>Cetak PDF</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5">
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
      <main className="container mx-auto px-2 sm:px-4 py-6 max-w-5xl flex-1 space-y-6 print:p-0 print:max-w-none print:m-0 print:space-y-2">
        <div className="bg-white border border-slate-300 rounded-xl shadow-xl overflow-hidden print-container">
          {/* Ticket Header Section */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-slate-100 text-slate-900 border-b-4 border-amber-500 p-5 sm:p-6 print-compact-p relative">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 print-compact-gap">
              <div>
                <div className="flex items-center gap-2 text-amber-700 font-mono text-xs font-bold uppercase tracking-widest mb-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse print-hidden"></span>
                  MOBENG WORKSHOP OPS
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-wide uppercase font-heading">
                  Capability Map Teknisi
                </h2>
                <p className="text-slate-700 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed font-medium">
                  Pemetaan kompetensi mekanik per toko. Isi data mekanik, tandai penguasaan tiap jenis pekerjaan (No. 1–{jobs.length}), dan lihat persentase kesiapan tim secara otomatis.
                </p>
              </div>

              <div className="text-right font-mono text-xs text-slate-700 bg-white/90 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm self-end sm:self-start">
                <div>FORM-CM</div>
                <div className="text-amber-700 font-bold">{todayDate}</div>
              </div>
            </div>

            {/* Store Banner */}
            <div className="mt-4 pt-3 border-t border-slate-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="w-full sm:max-w-md">
                <label className="block text-[10px] font-mono uppercase text-slate-600 font-bold mb-0.5 tracking-wider">
                  Toko Saat Ini
                </label>
                <Input
                  type="text"
                  value={selectedStore}
                  disabled
                  className="bg-white border-slate-300 text-amber-900 font-bold text-base h-9 shadow-sm print-compact-input"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-600 font-bold">Status:</span>
                <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold">
                  {statusText}
                </Badge>
              </div>
            </div>
          </div>

          {/* Job Legend Grid */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 print-compact-p">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span>Daftar Jenis Pekerjaan (No. 1–{jobs.length})</span>
              </h3>
              <Button
                onClick={addJobType}
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs h-7 px-2.5 font-bold gap-1 shadow-sm print-hidden"
              >
                <Plus className="h-3.5 w-3.5" />
                + Tambah Jenis Pekerjaan
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 print-compact-gap">
              {jobs.map((jobName, i) => (
                <div
                  key={i}
                  title={jobName}
                  className="group relative flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-300 shadow-sm focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all"
                >
                  <span className="h-6 w-6 rounded bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-inner">
                    {i + 1}
                  </span>
                  <Input
                    type="text"
                    value={jobName}
                    onChange={(e) => handleJobChange(i, e.target.value)}
                    className="h-7 text-xs font-semibold bg-transparent border-none focus-visible:ring-0 px-1 text-slate-800 placeholder:text-slate-400 w-full"
                    placeholder={`Pekerjaan ${i + 1}`}
                  />
                  {jobs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeJobType(i)}
                      title={`Hapus Pekerjaan No. ${i + 1}`}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition-all shrink-0 print-hidden"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="p-4 sm:p-5 overflow-x-auto print-compact-p">
            {loading ? (
              <div className="py-12 text-center text-slate-500 font-mono text-sm">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-500" />
                Memuat data capability map...
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse border border-slate-300 bg-white rounded-lg overflow-hidden min-w-[800px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-mono uppercase text-[11px] border-b-2 border-slate-300 font-bold">
                    <th className="py-2.5 px-2 text-center w-9 border-r border-slate-300">No</th>
                    <th className="py-2.5 px-3 min-w-[150px] border-r border-slate-300">Nama Mekanik</th>
                    <th className="py-2.5 px-3 min-w-[100px] border-r border-slate-300">Masa Kerja</th>
                    {jobs.map((j, i) => (
                      <th
                        key={i}
                        className="py-2 px-1 text-center min-w-[50px] border-r border-slate-300 text-[10px]"
                        title={j}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-amber-700 font-bold">{i + 1}</span>
                          <span className="truncate max-w-[65px] inline-block font-bold text-slate-800">{j}</span>
                        </div>
                      </th>
                    ))}
                    <th className="py-2.5 px-2 text-center min-w-[55px] border-r border-slate-300">Skor</th>
                    <th className="py-2.5 px-2 text-center w-8 print-hidden"></th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={jobs.length + 4} className="py-8 text-center text-slate-500 font-mono italic">
                        Belum ada mekanik. Klik "+ Tambah Mekanik" untuk mulai mengisi data.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => {
                      const score = r.checks.filter(Boolean).length;
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-slate-200 hover:bg-slate-50 transition-colors print-compact-row"
                        >
                          <td className="py-1.5 px-2 text-center font-mono text-slate-600 font-bold border-r border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-2 border-r border-slate-200">
                            <Input
                              type="text"
                              value={r.nama}
                              placeholder="Nama mekanik"
                              onChange={(e) => updateMechanicText(r.id, "nama", e.target.value)}
                              className="h-7 text-xs font-semibold bg-white border-slate-300 text-slate-900 focus-visible:ring-amber-500"
                            />
                          </td>
                          <td className="py-1 px-2 border-r border-slate-200">
                            <Input
                              type="text"
                              value={r.masa}
                              placeholder="cth: 2 tahun"
                              onChange={(e) => updateMechanicText(r.id, "masa", e.target.value)}
                              className="h-7 text-xs bg-white border-slate-300 text-slate-800 font-medium focus-visible:ring-amber-500"
                            />
                          </td>

                          {jobs.map((_, ji) => {
                            const checked = Boolean(r.checks[ji]);
                            return (
                              <td key={ji} className="py-1 px-1 text-center border-r border-slate-200">
                                <button
                                  type="button"
                                  title={jobs[ji]}
                                  onClick={() => toggleCheck(r.id, ji)}
                                  className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-xs transition-all duration-150 ${
                                    checked
                                      ? "bg-amber-400 text-slate-950 border border-amber-600 shadow-sm scale-105"
                                      : "bg-slate-100 text-transparent border border-slate-300 hover:border-amber-500"
                                  }`}
                                >
                                  ✓
                                </button>
                              </td>
                            );
                          })}

                          <td className="py-1 px-2 text-center border-r border-slate-200">
                            <Badge
                              variant="outline"
                              className={`font-mono text-xs font-bold border ${
                                score === jobs.length
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : score >= Math.ceil(jobs.length / 2)
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : "bg-slate-100 text-slate-700 border-slate-300"
                              }`}
                            >
                              {score}/{jobs.length}
                            </Badge>
                          </td>

                          <td className="py-1 px-1 text-center print-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRow(r.id)}
                              className="h-6 w-6 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
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
                    <tr className="bg-slate-200 text-slate-900 font-mono text-xs border-t-2 border-slate-300">
                      <td colSpan={3} className="py-2.5 px-4 text-right font-bold tracking-wider text-amber-800 border-r border-slate-300 uppercase">
                        % Mekanik Menguasai
                      </td>
                      {jobs.map((_, ji) => {
                        const pct = getJobPct(ji);
                        return (
                          <td key={ji} className="py-1.5 px-1 text-center border-r border-slate-300 relative overflow-hidden">
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-amber-400/40 transition-all duration-300"
                              style={{ height: `${pct}%` }}
                            />
                            <span className="relative z-10 font-bold text-[11px] text-slate-950">{pct}%</span>
                          </td>
                        );
                      })}
                      <td className="border-r border-slate-300"></td>
                      <td className="print-hidden"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center gap-3 print-hidden">
            <Button
              onClick={() => addRow()}
              className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold font-mono text-xs gap-2 shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              + Tambah Mekanik
            </Button>

            <Button
              onClick={addJobType}
              variant="outline"
              className="border-amber-500/40 bg-amber-50 text-amber-800 hover:bg-amber-100 font-mono text-xs gap-2 font-bold"
            >
              <Plus className="h-4 w-4 text-amber-600" />
              + Tambah Jenis Pekerjaan
            </Button>

            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs gap-2 font-bold shadow-sm"
            >
              <Save className="h-4 w-4 text-white" />
              Simpan Data
            </Button>

            <Button
              onClick={handlePrint}
              className="bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs gap-2 font-bold shadow-sm"
            >
              <Printer className="h-4 w-4 text-white" />
              Cetak / Simpan PDF
            </Button>

            <Button
              onClick={loadStoreData}
              variant="outline"
              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-mono text-xs gap-2"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
              Muat Data Toko
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              className={`font-mono text-xs gap-2 ${
                resetArmed
                  ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700"
                  : "border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              {resetArmed ? "Konfirmasi Reset?" : "Reset Form"}
            </Button>
          </div>

          {/* Summary Panel */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 print-compact-p">
            <Card className="bg-white border-slate-300 text-slate-800 shadow-sm print:shadow-none print:border-slate-300">
              <CardHeader className="py-2.5 px-4 bg-slate-200 text-slate-900 border-b border-slate-300">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-amber-800 flex items-center justify-between">
                  <span>Rekap Kesiapan per Jenis Pekerjaan</span>
                  <span className="text-slate-600 font-semibold text-[10px]">Toko: {selectedStore}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-3 print-compact-p">
                <div className="space-y-1.5 print-compact-gap">
                  {jobs.map((jobName, ji) => {
                    const pct = getJobPct(ji);
                    return (
                      <div key={ji} className="flex items-center gap-2.5 text-xs font-mono">
                        <span className="h-5 w-5 rounded bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 border border-amber-500 shadow-sm">
                          {ji + 1}
                        </span>
                        <span className="w-44 sm:w-56 shrink-0 text-slate-900 font-semibold truncate" title={jobName}>
                          {jobName}
                        </span>
                        <div className="flex-1 h-3 bg-slate-200 rounded overflow-hidden border border-slate-300 relative print-compact-bar">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-bold text-slate-950 text-[11px]">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* Overall Statistics Badges */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
                  <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 print-stat-box">
                    <div className="text-lg font-bold text-slate-900 print-stat-num">{totalMekanik}</div>
                    <div className="text-[9px] uppercase font-semibold text-slate-500 mt-0.5">Total Mekanik</div>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 print-stat-box">
                    <div className="text-lg font-bold text-amber-800 print-stat-num">{avgPct}%</div>
                    <div className="text-[9px] uppercase font-semibold text-amber-900 mt-0.5">Rata-rata Kesiapan</div>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200 print-stat-box">
                    <div className="text-lg font-bold text-emerald-800 print-stat-num">{fullyReady}</div>
                    <div className="text-[9px] uppercase font-semibold text-emerald-900 mt-0.5">Kuasai Semua ({jobs.length}/{jobs.length})</div>
                  </div>
                  <div className="bg-sky-50 p-2 rounded-lg border border-sky-200 print-stat-box">
                    <div className="text-sm font-bold text-sky-800 truncate print-stat-num">
                      {rows.length && bestIdx >= 0 ? `${bestPct}%` : "-"}
                    </div>
                    <div className="text-[9px] uppercase font-semibold text-sky-900 mt-0.5 truncate" title={bestIdx >= 0 ? jobs[bestIdx] : ""}>
                      Tertinggi: {bestIdx >= 0 ? jobs[bestIdx] : "-"}
                    </div>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg border border-rose-200 print-stat-box">
                    <div className="text-sm font-bold text-rose-800 truncate print-stat-num">
                      {rows.length && worstIdx >= 0 ? `${worstPct}%` : "-"}
                    </div>
                    <div className="text-[9px] uppercase font-semibold text-rose-900 mt-0.5 truncate" title={worstIdx >= 0 ? jobs[worstIdx] : ""}>
                      Terendah: {worstIdx >= 0 ? jobs[worstIdx] : "-"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs font-mono text-slate-500 border-t border-slate-200 print-hidden">
        Data tersimpan secara otomatis untuk toko <span className="text-slate-800 font-semibold">{selectedStore}</span>.
      </footer>
    </div>
  );
}
