import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { BULAN, getMonthlyReports, saveMonthlyReport, type MonthlyReport, formatIDR } from "@/lib/data";
import { useStoreContext } from "@/lib/storeContext";
import { toast } from "sonner";

export function StoreSalesDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [bulan, setBulan] = useState("");
  const [sales, setSales] = useState("");
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
    if (existing && existing.totalSalesToko) {
      setSales(String(existing.totalSalesToko));
    } else {
      setSales("");
    }
  };

  const handleSave = async () => {
    if (bulan === "" || sales === "") {
      toast.error("Pilih bulan dan isi total sales!");
      return;
    }
    setSaving(true);
    try {
      await saveMonthlyReport({
        bulan: parseInt(bulan, 10),
        tahun: 2026,
        totalSalesToko: parseFloat(sales),
        penjelasanPerforma: reports.find(r => r.bulan === parseInt(bulan))?.penjelasanPerforma || "",
        kendala: reports.find(r => r.bulan === parseInt(bulan))?.kendala || "",
        actionPlan: reports.find(r => r.bulan === parseInt(bulan))?.actionPlan || "",
      }, selectedStore);
      toast.success("Data sales toko berhasil disimpan!");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch {
      toast.error("Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2 w-full justify-start font-normal text-slate-700 hover:bg-slate-100 h-9 px-2">
          <Calculator className="h-4 w-4 text-emerald-600" />
          Input Sales
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Total Sales Toko 2026</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Bulan</Label>
            <Select value={bulan} onValueChange={handleLoad}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {BULAN.map((b, i) => {
                  const hasData = reports.some(r => r.bulan === i && r.totalSalesToko);
                  return (
                    <SelectItem key={i} value={String(i)}>
                      {b} 2026 {hasData ? "✓" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Total Sales Toko (Rp)</Label>
            <Input
              type="number"
              value={sales}
              onChange={(e) => setSales(e.target.value)}
              placeholder="Contoh: 500000000"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Menyimpan..." : "Simpan Data"}
          </Button>

          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Riwayat Input 2026</h4>
            <div className="grid grid-cols-2 gap-2">
              {BULAN.map((b, i) => {
                const report = reports.find(r => r.bulan === i);
                const hasData = report && report.totalSalesToko;
                return (
                  <div key={i} className={`text-[10px] p-2 rounded flex justify-between items-center ${hasData ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    <span className="font-medium">{b}</span>
                    {hasData ? (
                      <span className="font-bold">{formatIDR(report.totalSalesToko || 0)}</span>
                    ) : (
                      <span>Belum ada</span>
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
