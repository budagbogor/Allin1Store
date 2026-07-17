import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target } from "lucide-react";
import { getStoreTarget, saveStoreTarget, formatIDR } from "@/lib/data";
import { useStoreContext } from "@/lib/storeContext";
import { toast } from "sonner";

export function TargetDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<number | null>(null);
  const { selectedStore } = useStoreContext();

  const fetchTarget = useCallback(async () => {
    if (!selectedStore) return;
    try {
      const data = await getStoreTarget(selectedStore, 2026);
      setCurrentTarget(data);
      setTarget(String(data));
    } catch (err) {
      console.error(err);
    }
  }, [selectedStore]);

  useEffect(() => {
    if (open) {
      fetchTarget();
    }
  }, [open, fetchTarget]);

  const handleSave = async () => {
    if (target === "") {
      toast.error("Isi nilai target tahunan!");
      return;
    }
    setSaving(true);
    try {
      await saveStoreTarget(selectedStore, 2026, parseFloat(target));
      toast.success("Target tahunan berhasil disimpan!");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch {
      toast.error("Gagal menyimpan target.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2 w-full justify-start font-normal text-slate-700 hover:bg-slate-100 h-9 px-2">
          <Target className="h-4 w-4 text-purple-600" />
          Set Target Tahunan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Target Tahunan 2026</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-sm text-muted-foreground">
            Atur target penjualan tahunan untuk toko <strong>{selectedStore}</strong>.
          </div>
          
          {currentTarget !== null && (
            <div className="bg-slate-50 p-3 rounded-md border text-sm">
              Target saat ini: <strong>{formatIDR(currentTarget)}</strong>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Target Tahunan (Rp)</Label>
            <Input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Contoh: 650000000"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-purple-600 hover:bg-purple-700">
            {saving ? "Menyimpan..." : "Simpan Target"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
