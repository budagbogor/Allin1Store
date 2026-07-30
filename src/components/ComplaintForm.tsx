import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Plus, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  MEREK_KENDARAAN,
  MODEL_BY_MEREK,
  JENIS_PEKERJAAN,
  COMPLAINT_TYPES,
  PENYEBAB_MASALAH_OPTIONS,
  saveComplaint,
  updateComplaint,
  type ComplaintEntry,
  type ComplaintStatus,
} from "@/lib/data";
import { useStoreContext } from "@/lib/storeContext";
import { toast } from "sonner";

interface PrefillData {
  merekKendaraan: string;
  modelKendaraan: string;
  jenisPekerjaan?: string;
}

interface Props {
  onSuccess: () => void;
  prefillData?: PrefillData;
  initialData?: ComplaintEntry | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ComplaintForm({
  onSuccess,
  prefillData,
  initialData,
  trigger,
  open: openProp,
  onOpenChange,
}: Props) {
  const isControlled = openProp !== undefined;
  const [openInternal, setOpenInternal] = useState(false);
  const open = isControlled ? openProp! : openInternal;
  const setOpen = (val: boolean) => {
    if (!isControlled) setOpenInternal(val);
    onOpenChange?.(val);
  };
  const { selectedStore } = useStoreContext();

  const [date, setDate] = useState<Date>(new Date());
  const [merek, setMerek] = useState<(typeof MEREK_KENDARAAN)[number] | "">("");
  const [model, setModel] = useState("");
  const [jenisPekerjaanSebelumnya, setJenisPekerjaanSebelumnya] = useState("");
  const [jenisComplain, setJenisComplain] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [status, setStatus] = useState<ComplaintStatus>("Open");
  const [pic, setPic] = useState("");
  const [penyebabMasalah, setPenyebabMasalah] = useState("");
  const [catatanPenanganan, setCatatanPenanganan] = useState("");
  const [saving, setSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const isEditing = Boolean(initialData?.id);

  // Pre-fill data kendaraan / edit data saat dialog dibuka
  useEffect(() => {
    if (open) {
      if (initialData) {
        try {
          setDate(initialData.tanggal ? parseISO(initialData.tanggal) : new Date());
        } catch {
          setDate(new Date());
        }
        setMerek(initialData.merekKendaraan as (typeof MEREK_KENDARAAN)[number] || "");
        setModel(initialData.modelKendaraan || "");
        setJenisPekerjaanSebelumnya(initialData.jenisPekerjaanSebelumnya || "");
        setJenisComplain(initialData.jenisComplain || "");
        setKeterangan(initialData.keterangan || "");
        setStatus(initialData.status || "Open");
        setPic(initialData.pic || "");
        setPenyebabMasalah(initialData.penyebabMasalah || "");
        setCatatanPenanganan(initialData.catatanPenanganan || "");
      } else if (prefillData) {
        setMerek(prefillData.merekKendaraan as (typeof MEREK_KENDARAAN)[number] || "");
        setModel(prefillData.modelKendaraan || "");
        setJenisPekerjaanSebelumnya(prefillData.jenisPekerjaan || "");
        setStatus("Open");
      }
    } else {
      // Reset form saat dialog ditutup jika bukan controlled mode
      if (!initialData) {
        setMerek("");
        setModel("");
        setJenisPekerjaanSebelumnya("");
        setJenisComplain("");
        setKeterangan("");
        setStatus("Open");
        setPic("");
        setPenyebabMasalah("");
        setCatatanPenanganan("");
        setDate(new Date());
      }
    }
  }, [open, prefillData, initialData]);

  const handleSubmit = async () => {
    if (!date || !merek || !model || !jenisComplain) {
      toast.error("Tanggal, Merek, Model, dan Jenis Complain wajib diisi!");
      return;
    }
    setSaving(true);
    try {
      const complaintPayload = {
        tanggal: format(date, "yyyy-MM-dd"),
        merekKendaraan: merek,
        modelKendaraan: model,
        jenisPekerjaanSebelumnya: jenisPekerjaanSebelumnya,
        jenisComplain: jenisComplain,
        keterangan: keterangan,
        status: status,
        pic: pic,
        penyebabMasalah: penyebabMasalah,
        catatanPenanganan: catatanPenanganan,
      };

      if (isEditing && initialData) {
        await updateComplaint(initialData.id, complaintPayload);
        toast.success("Data complaint berhasil diperbarui!");
      } else {
        await saveComplaint(complaintPayload, selectedStore);
        toast.success("Complaint berhasil disimpan!");
      }

      setOpen(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan complaint. Pastikan koneksi atau database Supabase siap.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="gap-2 w-full sm:w-auto border-accent text-accent hover:bg-accent hover:text-white">
            <Plus className="h-4 w-4" />
            Input Complain Baru
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-accent flex items-center gap-2">
            {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {isEditing ? "Edit / Penanganan Complain" : "Input Complain Paska Instalasi"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {/* Tanggal */}
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

          {/* Merek & Model Kendaraan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <SelectValue placeholder="Pilih merek" />
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
                  <SelectValue placeholder={merek ? "Pilih model" : "Pilih merek dulu"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {(merek ? MODEL_BY_MEREK[merek] : []).map((md) => (
                    <SelectItem key={md} value={md}>{md}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jenis Pekerjaan Sebelumnya */}
          <div className="grid gap-2">
            <Label>Jenis Pekerjaan Paska Instalasi (Sebelumnya)</Label>
            <Select value={jenisPekerjaanSebelumnya} onValueChange={setJenisPekerjaanSebelumnya}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis pekerjaan sebelumnya" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {JENIS_PEKERJAAN.map((jp) => (
                  <SelectItem key={jp} value={jp}>{jp}</SelectItem>
                ))}
                {jenisPekerjaanSebelumnya && !JENIS_PEKERJAAN.includes(jenisPekerjaanSebelumnya) && (
                  <SelectItem value={jenisPekerjaanSebelumnya}>{jenisPekerjaanSebelumnya}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Input
              placeholder="Atau tuliskan jenis pekerjaan secara manual jika tidak ada di daftar..."
              value={jenisPekerjaanSebelumnya}
              onChange={(e) => setJenisPekerjaanSebelumnya(e.target.value)}
              className="text-xs mt-1"
            />
          </div>

          {/* Jenis Complain */}
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

          {/* Keterangan Masalah */}
          <div className="grid gap-2">
            <Label>Keterangan Deskripsi Complain</Label>
            <Textarea
              placeholder="Jelaskan detail masalah komplain dari pelanggan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="border-t pt-3 mt-1 space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Penanganan & Resolusi Complain
            </h4>

            {/* Status & PIC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Status Penanganan</Label>
                <Select value={status} onValueChange={(val) => setStatus(val as ComplaintStatus)}>
                  <SelectTrigger className="font-semibold">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open" className="text-red-600 font-medium">🔴 Open</SelectItem>
                    <SelectItem value="In Progress" className="text-amber-600 font-medium">🟡 In Progress</SelectItem>
                    <SelectItem value="Resolved" className="text-blue-600 font-medium">🔵 Resolved</SelectItem>
                    <SelectItem value="Closed" className="text-emerald-600 font-medium">🟢 Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>PIC Yang Menangani</Label>
                <Input
                  placeholder="Nama Mekanik / SA / PIC"
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                />
              </div>
            </div>

            {/* Penyebab Masalah */}
            <div className="grid gap-2">
              <Label>Kategori Penyebab Masalah</Label>
              <Select value={penyebabMasalah} onValueChange={setPenyebabMasalah}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kesimpulan penyebab masalah" />
                </SelectTrigger>
                <SelectContent>
                  {PENYEBAB_MASALAH_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Catatan Penanganan & Solusi */}
            <div className="grid gap-2">
              <Label>Catatan / Kesimpulan Penanganan & Solusi</Label>
              <Textarea
                placeholder="Tuliskan kesimpulan investigasi penyebab dan tindakan yang sudah/akan dilakukan..."
                value={catatanPenanganan}
                onChange={(e) => setCatatanPenanganan(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full mt-2 bg-accent hover:bg-accent/90">
            {saving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Simpan Complain"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


