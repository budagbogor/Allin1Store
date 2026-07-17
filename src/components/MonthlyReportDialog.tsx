import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, CheckCircle2 } from "lucide-react";
import { BULAN, getMonthlyReports, saveMonthlyReport, type MonthlyReport } from "@/lib/data";
import { useStoreContext } from "@/lib/storeContext";
import { toast } from "sonner";

export function MonthlyReportDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [bulan, setBulan] = useState("");
  const [performa, setPerforma] = useState("");
  const [kendala, setKendala] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const { selectedStore } = useStoreContext();

  const fetchReports = useCallback(async () => {
    if (!selectedStore) return;
    try {
      const data = await getMonthlyReports(selectedStore);
      setReports(data.filter(r => r.tahun === 2026));
    } catch (err) {
      console.error(err);
    }
  }, [selectedStore]);

  useEffect(() => {
    if (open) {
      fetchReports();
    }
  }, [open, fetchReports]);

  const handleLoad = (val: string) => {
    setBulan(val);
    const idx = parseInt(val, 10);
    const existing = reports.find((r) => r.bulan === idx);
    if (existing) {
      setPerforma(existing.penjelasanPerforma || "");
      setKendala(existing.kendala || "");
      setActionPlan(existing.actionPlan || "");
    } else {
      setPerforma("");
      setKendala("");
      setActionPlan("");
    }
  };

  const handleSave = async () => {
    if (bulan === "") {
      toast.error("Pilih bulan terlebih dahulu!");
      return;
    }
    setSaving(true);
    try {
      const existing = reports.find(r => r.bulan === parseInt(bulan));
      await saveMonthlyReport({
        bulan: parseInt(bulan, 10),
        tahun: 2026,
        penjelasanPerforma: performa,
        kendala,
        actionPlan,
        totalSalesToko: existing?.totalSalesToko || 0,
      }, selectedStore);
      toast.success("Laporan bulanan berhasil disimpan!");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch {
      toast.error("Gagal menyimpan laporan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2 w-full justify-start font-normal text-slate-700 hover:bg-slate-100 h-9 px-2">
          <FileText className="h-4 w-4 text-blue-600" />
          Laporan Bulanan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Laporan Bulanan 2026</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Bulan</Label>
            <NoSSRSelect value={bulan} onValueChange={handleLoad} reports={reports} />
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

          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status Laporan 2026</h4>
            <div className="grid grid-cols-2 gap-2">
              {BULAN.map((b, i) => {
                const hasData = reports.some(r => r.bulan === i && (r.penjelasanPerforma || r.kendala));
                return (
                  <div key={i} className={`text-[10px] p-2 rounded flex justify-between items-center ${hasData ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    <span className="font-medium">{b}</span>
                    {hasData ? (
                      <CheckCircle2 className="h-3 w-3 text-blue-600" />
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NoSSRSelect({ value, onValueChange, reports }: any) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger><SelectValue placeholder="Pilih bulan" /></SelectTrigger>
      <SelectContent>
        {BULAN.map((b, i) => {
          const hasData = reports.some((r: any) => r.bulan === i && (r.penjelasanPerforma || r.kendala));
          return (
            <SelectItem key={i} value={String(i)}>
              {b} 2026 {hasData ? "✓" : ""}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
