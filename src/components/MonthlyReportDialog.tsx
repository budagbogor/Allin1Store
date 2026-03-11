import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import { BULAN, getMonthlyReports, saveMonthlyReport } from "@/lib/data";
import { toast } from "sonner";

export function MonthlyReportDialog() {
  const [open, setOpen] = useState(false);
  const [bulan, setBulan] = useState("");
  const [performa, setPerforma] = useState("");
  const [kendala, setKendala] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLoad = async (val: string) => {
    setBulan(val);
    const idx = parseInt(val, 10);
    try {
      const reports = await getMonthlyReports();
      const existing = reports.find((r) => r.bulan === idx && r.tahun === 2026);
      if (existing) {
        setPerforma(existing.penjelasanPerforma);
        setKendala(existing.kendala);
        setActionPlan(existing.actionPlan);
      } else {
        setPerforma("");
        setKendala("");
        setActionPlan("");
      }
    } catch {
      toast.error("Gagal memuat laporan.");
    }
  };

  const handleSave = async () => {
    if (bulan === "") {
      toast.error("Pilih bulan terlebih dahulu!");
      return;
    }
    setSaving(true);
    try {
      await saveMonthlyReport({
        bulan: parseInt(bulan, 10),
        tahun: 2026,
        penjelasanPerforma: performa,
        kendala,
        actionPlan,
      });
      toast.success("Laporan bulanan berhasil disimpan!");
      setOpen(false);
    } catch {
      toast.error("Gagal menyimpan laporan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <FileText className="h-4 w-4" />
          Laporan Bulanan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Laporan Bulanan 2026</DialogTitle>
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
            <Label>Penjelasan Performa</Label>
            <Textarea rows={3} value={performa} onChange={(e) => setPerforma(e.target.value)} placeholder="Jelaskan performa bulan ini..." />
          </div>
          <div className="grid gap-2">
            <Label>Kendala</Label>
            <Textarea rows={3} value={kendala} onChange={(e) => setKendala(e.target.value)} placeholder="Kendala yang dihadapi..." />
          </div>
          <div className="grid gap-2">
            <Label>Action Plan</Label>
            <Textarea rows={3} value={actionPlan} onChange={(e) => setActionPlan(e.target.value)} placeholder="Rencana tindak lanjut..." />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full mt-2">
            {saving ? "Menyimpan..." : "Simpan Laporan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
