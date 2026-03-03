import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SAMPLE_TRAILS } from "@/data/trails";
import { addHazard, getUnsyncedHazards, markHazardsSynced, getAllHazards, Hazard } from "@/lib/hazardDb";
import { ArrowLeft, AlertTriangle, Wifi, WifiOff, RefreshCw, Plus, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CATEGORIES: Hazard["category"][] = ["rockfall", "wildlife", "weather", "trail_damage", "other"];

const HazardsPage = () => {
  const navigate = useNavigate();
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [form, setForm] = useState({
    trail_id: SAMPLE_TRAILS[0].id,
    category: "rockfall" as Hazard["category"],
    description: "",
    lat: 19.033,
    lng: 73.466,
  });

  const loadHazards = async () => {
    const all = await getAllHazards();
    setHazards(all);
    const unsynced = await getUnsyncedHazards();
    setUnsyncedCount(unsynced.length);
  };

  useEffect(() => {
    loadHazards();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const handleAddHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    await addHazard({
      ...form,
      reported_at: new Date().toISOString(),
      synced: false,
    });
    setForm(f => ({ ...f, description: "" }));
    setShowForm(false);
    await loadHazards();
    toast.success("Hazard saved locally (offline outbox)");
  };

  const handleSync = async () => {
    setSyncing(true);
    const unsynced = await getUnsyncedHazards();
    if (unsynced.length === 0) {
      toast.info("Nothing to sync");
      setSyncing(false);
      return;
    }

    // Simulate POST to /api/v1/hazards/sync
    await new Promise(r => setTimeout(r, 1000));
    const ids = unsynced.map(h => h.id!);
    await markHazardsSynced(ids);
    await loadHazards();
    toast.success(`Synced ${ids.length} hazard(s) to server`);
    setSyncing(false);
  };

  const getTrailName = (id: string) => SAMPLE_TRAILS.find(t => t.id === id)?.name ?? id;

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-forest px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-primary-foreground hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground font-display">Hazard Reports</h1>
              <p className="text-primary-foreground/60 text-xs">Offline-first hazard sync</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-primary-foreground/70 text-xs">
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? "Online" : "Offline"}
            </div>
            {unsyncedCount > 0 && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 bg-primary-foreground/20 text-primary-foreground text-xs rounded-lg px-3 py-1.5 hover:bg-primary-foreground/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                Sync ({unsyncedCount})
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full mb-6 flex items-center justify-center gap-2 bg-card border border-border rounded-xl py-3 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Plus className="w-4 h-4" />
          Report a Hazard
        </button>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddHazard}
              className="bg-card rounded-2xl shadow-card border border-border p-5 mb-6 space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Trail</label>
                  <select
                    value={form.trail_id}
                    onChange={e => setForm(f => ({ ...f, trail_id: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {SAMPLE_TRAILS.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Describe the hazard..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.001"
                    value={form.lat}
                    onChange={e => setForm(f => ({ ...f, lat: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.001"
                    value={form.lng}
                    onChange={e => setForm(f => ({ ...f, lng: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full gradient-sunset text-secondary-foreground rounded-lg py-2.5 font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Save to Outbox
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Hazard list */}
        <div className="space-y-3">
          {hazards.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">No hazards reported yet.</p>
          )}
          {hazards.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 flex items-start gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-trail-warning mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">{h.category.replace("_", " ")}</span>
                  <span className="text-xs text-muted-foreground">{getTrailName(h.trail_id)}</span>
                </div>
                <p className="text-sm">{h.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(h.reported_at).toLocaleString()}</p>
              </div>
              {h.synced ? (
                <CheckCircle className="w-4 h-4 text-trail-success shrink-0" />
              ) : (
                <span className="text-xs bg-trail-warning/15 text-trail-earth px-2 py-0.5 rounded-full shrink-0">pending</span>
              )}
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HazardsPage;
