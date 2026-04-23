import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MEREK_KENDARAAN, MODEL_BY_MEREK, COMPLAINT_TYPES, saveComplaint, type ComplaintEntry } from "@/lib/data";
import { toast } from "sonner";

interface Props {
  onSuccess: () => void;
}

export function ComplaintForm({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [merek, setMerek] = useState<(typeof MEREK_KENDARAAN)[number] | "">("");
  const [model, setModel] = useState("");
  const [jenisComplain, setJenisComplain] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [saving, setSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSubmit = async () => {
    if (!date || !merek || !model || !jenisComplain) {
      toast.error("Semua field wajib harus diisi!");
      return;
    }
    setSaving(true);
    try {
      await saveComplaint({
        tanggal: format(date, "yyyy-MM-dd"),
        merekKendaraan: merek,
        modelKendaraan: model,
        jenisComplain: jenisComplain,
        keterangan: keterangan,
        status: "Open",
      });
      toast.success("Complaint berhasil disimpan!");
      setOpen(false);
      onSuccess();
      // Reset form
      setMerek("");
      setModel("");
      setJenisComplain("");
      setKeterangan("");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan complaint. Pastikan tabel 'complaints' sudah ada di Supabase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full sm:w-auto border-accent text-accent hover:bg-accent hover:text-white">
          <Plus className="h-4 w-4" />
          Input Complain Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-accent">Input Complain Paska Instalasi</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Tanggal Temuan</Label>
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
                    if (d) setDate(d);
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
            <Label>Jenis Complain</Label>
            <Select value={jenisComplain} onValueChange={setJenisComplain}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis complain" />
              </SelectTrigger>
              <SelectContent>
                {COMPLAINT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Keterangan Tambahan</Label>
            <Textarea
              placeholder="Jelaskan detail complain..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full mt-2 bg-accent hover:bg-accent/90">
            {saving ? "Menyimpan..." : "Simpan Complain"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
