import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { BULAN, getMonthlyReports, saveMonthlyReport } from "@/lib/data";
import { toast } from "sonner";

export function StoreSalesDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [bulan, setBulan] = useState("");
  const [totalSalesToko, setTotalSalesToko] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentReport, setCurrentReport] = useState<any>(null);

  const handleLoad = async (val: string) => {
    setBulan(val);
    const idx = parseInt(val, 10);
    try {
      const reports = await getMonthlyReports();
      const existing = reports.find((r) => r.bulan === idx && r.tahun === 2026);
      if (existing) {
        setTotalSalesToko(existing.totalSalesToko ? String(existing.totalSalesToko) : "");
        setCurrentReport(existing);
      } else {
        setTotalSalesToko("");
        setCurrentReport(null);
      }
    } catch {
      toast.error("Gagal memuat data sales.");
    }
  };

  const handleSave = async () => {
    if (bulan === "") {
      toast.error("Pilih bulan terlebih dahulu!");
      return;
    }
    setSaving(true);
    try {
      // Kita tetap menggunakan saveMonthlyReport tapi hanya mengupdate totalSalesToko
      // Jika report belum ada, kita buat baru dengan field lainnya kosong
      await saveMonthlyReport({
        bulan: parseInt(bulan, 10),
        tahun: 2026,
        penjelasanPerforma: currentReport?.penjelasanPerforma || "",
        kendala: currentReport?.kendala || "",
        actionPlan: currentReport?.actionPlan || "",
        totalSalesToko: totalSalesToko ? Number(totalSalesToko) : 0,
      });
      toast.success("Total sales toko berhasil disimpan!");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch {
      toast.error("Gagal menyimpan data sales.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full sm:w-auto bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
          <Calculator className="h-4 w-4" />
          Input Sales Toko
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Input Total Sales Toko 2026</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Bulan</Label>
            <Select value={bulan} onValueChange={handleLoad}>
              <SelectTrigger><SelectValue placeholder="Pilih bulan" /></SelectTrigger>
              <SelectContent>
                {BULAN.map((b, i) => (
                  <SelectItem key={i} value={String(i)}>{b} 2026</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Total Sales Toko (IDR)</Label>
            <Input 
              type="number" 
              value={totalSalesToko} 
              onChange={(e) => setTotalSalesToko(e.target.value)} 
              placeholder="Masukkan total sales seluruh kategori..." 
            />
            <p className="text-[10px] text-muted-foreground italic">
              *Angka ini digunakan sebagai pembanding (denominator) untuk menghitung % kontribusi project.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Menyimpan..." : "Simpan Sales Toko"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
