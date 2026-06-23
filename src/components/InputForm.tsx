import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, Clock, Wrench, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { JENIS_PEKERJAAN_GROUPS, MEREK_KENDARAAN, MODEL_BY_MEREK, saveEntry, updateEntry, type SalesEntry } from "@/lib/data";
import { toast } from "sonner";

interface Props {
  onSuccess: () => void;
  editData?: SalesEntry | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InputForm({ onSuccess, editData, open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const [date, setDate] = useState<Date>();
  const [merek, setMerek] = useState<(typeof MEREK_KENDARAAN)[number] | "">("");
  const [merekManual, setMerekManual] = useState("");
  const [isCustomMerek, setIsCustomMerek] = useState(false);
  const [model, setModel] = useState("");
  const [modelManual, setModelManual] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [tahun, setTahun] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [jenisList, setJenisList] = useState<string[]>([]);
  const [jenisSelect, setJenisSelect] = useState("");
  const [jenisManualInput, setJenisManualInput] = useState("");
  const [sales, setSales] = useState("");
  const [saving, setSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Leadtime
  const [leadtimeJam, setLeadtimeJam] = useState("");
  const [leadtimeMenit, setLeadtimeMenit] = useState("");

  // Special Tools
  const [specialToolsList, setSpecialToolsList] = useState<string[]>([]);
  const [specialToolInput, setSpecialToolInput] = useState("");

  // Langkah Pengerjaan
  const [langkahPengerjaan, setLangkahPengerjaan] = useState("");

  useEffect(() => {
    if (open && editData) {
      setDate(new Date(editData.tanggal));
      // Check if merek is in the predefined list
      const merekInList = MEREK_KENDARAAN.includes(editData.merekKendaraan as any);
      if (merekInList) {
        setMerek(editData.merekKendaraan as any);
        setMerekManual("");
        setIsCustomMerek(false);
      } else {
        setMerek("");
        setMerekManual(editData.merekKendaraan);
        setIsCustomMerek(true);
      }
      // Check if model is in the predefined list
      const modelsForMerek = merekInList ? MODEL_BY_MEREK[editData.merekKendaraan as (typeof MEREK_KENDARAAN)[number]] : [];
      const modelInList = modelsForMerek.includes(editData.modelKendaraan);
      if (modelInList) {
        setModel(editData.modelKendaraan);
        setModelManual("");
        setIsCustomModel(false);
      } else {
        setModel("");
        setModelManual(editData.modelKendaraan);
        setIsCustomModel(true);
      }
      setTahun(editData.tahunKendaraan || "");
      setJenisList(editData.jenisPekerjaan.split(" | ").map((s) => s.trim()));
      setSales(new Intl.NumberFormat("id-ID").format(editData.jumlahSales));
      setSelectedCategory("");
      setCustomCategory("");
      setIsCustomCategory(false);
      setJenisManualInput("");
      // Field baru
      setLeadtimeJam(editData.leadtimeJam ? String(editData.leadtimeJam) : "");
      setLeadtimeMenit(editData.leadtimeMenit ? String(editData.leadtimeMenit) : "");
      setSpecialToolsList(
        editData.specialTools
          ? editData.specialTools.split(" | ").map(s => s.trim()).filter(Boolean)
          : []
      );
      setLangkahPengerjaan(editData.langkahPengerjaan ?? "");
    } else if (open && !editData) {
      setDate(undefined);
      setMerek("");
      setMerekManual("");
      setIsCustomMerek(false);
      setModel("");
      setModelManual("");
      setIsCustomModel(false);
      setTahun("");
      setSelectedCategory("");
      setCustomCategory("");
      setIsCustomCategory(false);
      setJenisList([]);
      setJenisSelect("");
      setJenisManualInput("");
      setSales("");
      setLeadtimeJam("");
      setLeadtimeMenit("");
      setSpecialToolsList([]);
      setSpecialToolInput("");
      setLangkahPengerjaan("");
    }
  }, [open, editData]);

  const addJenis = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setJenisList((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setJenisSelect("");
  };

  const removeJenis = (val: string) => {
    setJenisList((prev) => prev.filter((j) => j !== val));
  };

  const addSpecialTool = () => {
    const trimmed = specialToolInput.trim();
    if (!trimmed) return;
    setSpecialToolsList((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setSpecialToolInput("");
  };

  const removeSpecialTool = (val: string) => {
    setSpecialToolsList((prev) => prev.filter((t) => t !== val));
  };

  const filteredJobs = JENIS_PEKERJAAN_GROUPS.find((g) => g.category === selectedCategory)?.items || [];

  const handleSubmit = async () => {
    const finalMerek = isCustomMerek ? merekManual.trim() : merek;
    const finalModel = isCustomModel ? modelManual.trim() : model;

    if (!date || !finalMerek || !finalModel || jenisList.length === 0 || !sales) {
      toast.error("Semua field wajib harus diisi!");
      return;
    }
    const amount = parseInt(sales.replace(/\D/g, ""), 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Jumlah sales harus berupa angka positif!");
      return;
    }

    const jamVal = parseInt(leadtimeJam || "0", 10);
    const menitVal = parseInt(leadtimeMenit || "0", 10);

    setSaving(true);
    try {
      const payload = {
        tanggal: format(date, "yyyy-MM-dd"),
        merekKendaraan: finalMerek,
        modelKendaraan: finalModel,
        tahunKendaraan: tahun.trim(),
        jenisPekerjaan: jenisList.join(" | "),
        jumlahSales: amount,
        leadtimeJam: isNaN(jamVal) ? 0 : jamVal,
        leadtimeMenit: isNaN(menitVal) ? 0 : menitVal,
        specialTools: specialToolsList.join(" | "),
        langkahPengerjaan: langkahPengerjaan.trim(),
      };

      if (editData?.id) {
        await updateEntry(editData.id, payload);
        toast.success("Data berhasil diperbarui!");
      } else {
        await saveEntry(payload);
        toast.success("Data berhasil disimpan!");
      }

      setOpen(false);
      onSuccess();
    } catch {
      toast.error("Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  const formatSalesInput = (val: string) => {
    const num = val.replace(/\D/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(num, 10));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editData && (
        <DialogTrigger asChild>
          <Button className="gap-2 w-full bg-primary hover:bg-primary/90 shadow-md transition-all duration-300">
            <Plus className="h-4 w-4" />
            Input Data Baru
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editData ? "Edit Pekerjaan Harian" : "Input Pekerjaan Harian"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">

          {/* Tanggal */}
          <div className="grid gap-2">
            <Label>Tanggal</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd MMMM yyyy") : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setPopoverOpen(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Merek Kendaraan */}
          <div className="grid gap-2">
            <Label>Merek Kendaraan</Label>
            {!isCustomMerek ? (
              <div className="flex gap-2">
                <Select
                  value={merek}
                  onValueChange={(val) => {
                    if (val === "__custom__") {
                      setIsCustomMerek(true);
                      setMerek("");
                      setModel("");
                      setIsCustomModel(true);
                      setModelManual("");
                    } else {
                      setMerek(val as (typeof MEREK_KENDARAAN)[number]);
                      setModel("");
                      setIsCustomModel(false);
                      setModelManual("");
                    }
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih merek kendaraan" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {MEREK_KENDARAAN.filter(m => m !== "Others").map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                    <SelectItem value="__custom__" className="text-primary font-medium">
                      + Input Manual
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Ketik merek kendaraan..."
                  value={merekManual}
                  onChange={(e) => setMerekManual(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsCustomMerek(false);
                    setMerekManual("");
                    setMerek("");
                    setModel("");
                    setIsCustomModel(false);
                    setModelManual("");
                  }}
                  title="Kembali ke pilihan"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Model Kendaraan */}
          <div className="grid gap-2">
            <Label>Model Kendaraan</Label>
            {!isCustomModel ? (
              <div className="flex gap-2">
                <Select value={model} onValueChange={(val) => {
                  if (val === "__custom__") {
                    setIsCustomModel(true);
                    setModel("");
                    setModelManual("");
                  } else {
                    setModel(val);
                  }
                }} disabled={!merek && !isCustomMerek}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={merek ? "Pilih model kendaraan" : "Pilih merek dulu"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {(merek ? MODEL_BY_MEREK[merek] : []).filter(md => md !== "Others").map((md) => (
                      <SelectItem key={md} value={md}>{md}</SelectItem>
                    ))}
                    <SelectItem value="__custom__" className="text-primary font-medium">
                      + Input Manual
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Ketik model kendaraan..."
                  value={modelManual}
                  onChange={(e) => setModelManual(e.target.value)}
                  className="flex-1"
                />
                {!isCustomMerek && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setIsCustomModel(false);
                      setModelManual("");
                      setModel("");
                    }}
                    title="Kembali ke pilihan"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Tahun Kendaraan */}
          <div className="grid gap-2">
            <Label>Tahun Kendaraan <span className="text-muted-foreground text-xs font-normal">(opsional)</span></Label>
            <Input
              type="number"
              placeholder="contoh: 2018"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
            />
          </div>

          {/* Kategori Sistem */}
          <div className="grid gap-2">
            <Label>Kategori Sistem</Label>
            {!isCustomCategory ? (
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={(val) => {
                  if (val === "__custom__") {
                    setIsCustomCategory(true);
                    setSelectedCategory("");
                    setCustomCategory("");
                  } else {
                    setSelectedCategory(val);
                  }
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih kategori sistem" />
                  </SelectTrigger>
                  <SelectContent>
                    {JENIS_PEKERJAAN_GROUPS.map((group) => (
                      <SelectItem key={group.category} value={group.category}>
                        {group.category}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__" className="text-primary font-medium">
                      + Input Manual
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Ketik kategori sistem..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="flex-1"
                  disabled
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsCustomCategory(false);
                    setCustomCategory("");
                    setSelectedCategory("");
                  }}
                  title="Kembali ke pilihan"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Jenis Pekerjaan */}
          <div className="grid gap-2">
            <Label>Jenis Pekerjaan</Label>
            {!isCustomCategory ? (
              <Select
                value={jenisSelect}
                onValueChange={(val) => {
                  setJenisSelect(val);
                  addJenis(val);
                }}
                disabled={!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCategory ? "Pilih pekerjaan" : "Pilih kategori dulu"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredJobs.filter(j => j !== "Others").map((j) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {/* Input manual jenis pekerjaan */}
            <div className="flex gap-2">
              <Input
                placeholder="Ketik jenis pekerjaan manual..."
                value={jenisManualInput}
                onChange={(e) => setJenisManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (jenisManualInput.trim()) {
                      addJenis(jenisManualInput.trim());
                      setJenisManualInput("");
                    }
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (jenisManualInput.trim()) {
                    addJenis(jenisManualInput.trim());
                    setJenisManualInput("");
                  }
                }}
                disabled={!jenisManualInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {jenisList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {jenisList.map((j) => (
                  <span
                    key={j}
                    className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs"
                  >
                    <span className="max-w-[260px] truncate">{j}</span>
                    <button
                      type="button"
                      onClick={() => removeJenis(j)}
                      className="ml-1 rounded-full p-0.5 hover:bg-secondary/70 focus:outline-none"
                      aria-label={`Hapus ${j}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Jumlah Sales */}
          <div className="grid gap-2">
            <Label>Jumlah Sales (IDR)</Label>
            <Input
              placeholder="contoh: 500000"
              value={sales}
              onChange={(e) => setSales(formatSalesInput(e.target.value))}
            />
          </div>

          {/* ─── FIELD BARU ─── */}

          {/* Leadtime Pengerjaan */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Leadtime Pengerjaan <span className="text-muted-foreground text-xs font-normal">(opsional)</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={leadtimeJam}
                  onChange={(e) => setLeadtimeJam(e.target.value)}
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">jam</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={leadtimeMenit}
                  onChange={(e) => setLeadtimeMenit(e.target.value)}
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">menit</span>
              </div>
            </div>
          </div>

          {/* Special Tools */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-1.5">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              Special Tools <span className="text-muted-foreground text-xs font-normal">(opsional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nama special tool..."
                value={specialToolInput}
                onChange={(e) => setSpecialToolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSpecialTool();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addSpecialTool}
                disabled={!specialToolInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {specialToolsList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {specialToolsList.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 text-xs"
                  >
                    <Wrench className="h-3 w-3 mr-1 opacity-70" />
                    <span className="max-w-[180px] truncate">{tool}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecialTool(tool)}
                      className="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                      aria-label={`Hapus ${tool}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Langkah Pengerjaan */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Langkah Pengerjaan <span className="text-muted-foreground text-xs font-normal">(opsional)</span>
            </Label>
            <Textarea
              placeholder="Tulis langkah-langkah detail pengerjaan di sini..."
              value={langkahPengerjaan}
              onChange={(e) => setLangkahPengerjaan(e.target.value)}
              className="min-h-[120px] resize-y text-sm"
            />
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full mt-2">
            {saving ? "Menyimpan..." : editData ? "Perbarui Data" : "Simpan Data"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
