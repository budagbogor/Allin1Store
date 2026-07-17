import { useNavigate } from "react-router-dom";
import { STORES, useStoreContext } from "@/lib/storeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import logoMobeng from "@/assets/logomobeng.jpg";

export default function StoreSelector() {
  const { setSelectedStore } = useStoreContext();
  const navigate = useNavigate();

  const handleSelect = (store: string) => {
    setSelectedStore(store);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex justify-center">
            <img src={logoMobeng} alt="Mobeng Logo" className="h-16 w-16 rounded-xl object-cover shadow-sm" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading">Selamat Datang di All in 1 Store</CardTitle>
          <CardDescription className="text-base mt-2">
            Silakan pilih cabang toko Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STORES.map((store) => (
              <Button
                key={store}
                variant="outline"
                className="h-auto py-4 justify-start text-left hover:border-primary hover:bg-primary/5 transition-all group"
                onClick={() => handleSelect(store)}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-base">{store}</span>
                  <span className="text-xs text-muted-foreground font-normal">Pilih Cabang</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
