import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { JENIS_PEKERJAAN, MEREK_KENDARAAN, MODEL_BY_MEREK, saveEntry } from "@/lib/data";
import { toast } from "sonner";

interface Props {
  onAdded: () => void;
}

export function InputForm({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [merek, setMerek] = useState<(typeof MEREK_KENDARAAN)[number] | "">("");
  const [model, setModel] = useState("");
  const [jenisList, setJenisList] = useState<string[]>([]);
  const [jenisSelect, setJenisSelect] = useState("");
  const [sales, setSales] = useState("");
  const [saving, setSaving] = useState(false);

  const addJenis = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setJenisList((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setJenisSelect("");
  };

  const removeJenis = (val: string) => {
    setJenisList((prev) => prev.filter((j) => j !== val));
  };

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
      await saveEntry({
        tanggal: format(date, "yyyy-MM-dd"),
        merekKendaraan: merek,
        modelKendaraan: model,
        jenisPekerjaan: jenisList.join(" | "),
        jumlahSales: amount,
      });
      toast.success("Data berhasil disimpan!");
      setDate(undefined);
      setMerek("");
      setModel("");
      setJenisList([]);
      setJenisSelect("");
      setSales("");
      setOpen(false);
      onAdded();
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
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Input Data Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Input Pekerjaan Harian</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Tanggal</Label>
            <Popover>
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
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
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
            <Label>Jenis Pekerjaan</Label>
            <Select
              value={jenisSelect}
              onValueChange={(val) => {
                setJenisSelect(val);
                addJenis(val);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis pekerjaan" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {JENIS_PEKERJAAN.map((j) => (
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
            {saving ? "Menyimpan..." : "Simpan Data"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
