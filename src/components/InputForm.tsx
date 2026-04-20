import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [model, setModel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [jenisList, setJenisList] = useState<string[]>([]);
  const [jenisSelect, setJenisSelect] = useState("");
  const [sales, setSales] = useState("");
  const [saving, setSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (open && editData) {
      setDate(new Date(editData.tanggal));
      setMerek(editData.merekKendaraan as any);
      setModel(editData.modelKendaraan);
      setJenisList(editData.jenisPekerjaan.split(" | ").map((s) => s.trim()));
      setSales(new Intl.NumberFormat("id-ID").format(editData.jumlahSales));
      setSelectedCategory(""); // Reset category on edit
    } else if (open && !editData) {
      setDate(undefined);
      setMerek("");
      setModel("");
      setSelectedCategory("");
      setJenisList([]);
      setJenisSelect("");
      setSales("");
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

  const filteredJobs = JENIS_PEKERJAAN_GROUPS.find((g) => g.category === selectedCategory)?.items || [];

  const handleSubmit = async () => {
    if (!date || !merek || !model || jenisList.length === 0 || !sales) {
      toast.error("Semua field harus diisi!");
      return;
    }
    const amount = parseInt(sales.replace(/\D/g, ""), 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Jumlah sales harus berupa angka positif!");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        tanggal: format(date, "yyyy-MM-dd"),
        merekKendaraan: merek,
        modelKendaraan: model,
        jenisPekerjaan: jenisList.join(" | "),
        jumlahSales: amount,
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
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Input Data Baru
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editData ? "Edit Pekerjaan Harian" : "Input Pekerjaan Harian"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
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

          <div className="grid gap-2">
            <Label>Merek Kendaraan</Label>
            <Select
              value={merek}
              onValueChange={(val) => {
                setMerek(val as (typeof MEREK_KENDARAAN)[number]);
                setModel("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih merek kendaraan" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {MEREK_KENDARAAN.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Model Kendaraan</Label>
            <Select value={model} onValueChange={setModel} disabled={!merek}>
              <SelectTrigger>
                <SelectValue placeholder={merek ? "Pilih model kendaraan" : "Pilih merek dulu"} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {(merek ? MODEL_BY_MEREK[merek] : []).map((md) => (
                  <SelectItem key={md} value={md}>{md}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Kategori Sistem</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori sistem" />
              </SelectTrigger>
              <SelectContent>
                {JENIS_PEKERJAAN_GROUPS.map((group) => (
                  <SelectItem key={group.category} value={group.category}>
                    {group.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Jenis Pekerjaan</Label>
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
                {filteredJobs.map((j) => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                      className="ml-1 rounded-full p-0.5 hover:bg-secondary/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label={`Hapus ${j}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Jumlah Sales (IDR)</Label>
            <Input
              placeholder="contoh: 500000"
              value={sales}
              onChange={(e) => setSales(formatSalesInput(e.target.value))}
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
