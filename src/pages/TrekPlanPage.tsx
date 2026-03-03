import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SAMPLE_TRAILS } from "@/data/trails";
import { planTrek, TrekPlanInput, TrekPlanResult } from "@/lib/trekPlanner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ArrowLeft, Clock, Droplets, Utensils, PauseCircle, AlertTriangle, Mountain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const TrekPlanPage = () => {
  const { trailId } = useParams();
  const navigate = useNavigate();
  const trail = SAMPLE_TRAILS.find(t => t.id === trailId);

  const [form, setForm] = useState<Omit<TrekPlanInput, "trail_id">>({
    season: "winter",
    group_size: 4,
    fitness_level: "intermediate",
  });
  const [result, setResult] = useState<TrekPlanResult | null>(null);

  if (!trail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Trail not found.</p>
      </div>
    );
  }

  const handlePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const res = planTrek(trail, { ...form, trail_id: trail.id });
    setResult(res);
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-forest px-4 py-4">
        <div className="container mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-primary-foreground hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-primary-foreground font-display">{trail.name}</h1>
            <p className="text-primary-foreground/60 text-xs">{trail.dist_km} km · {trail.elev_m} m elevation</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 grid gap-6 lg:grid-cols-2">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-card border border-border h-[300px] lg:h-full min-h-[300px]">
          <MapContainer center={[trail.lat, trail.lng]} zoom={13} className="h-full w-full" scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[trail.lat, trail.lng]}>
              <Popup>{trail.name}</Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="space-y-6">
          {/* Plan Form */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold font-display">Plan Your Trek</h2>
            </div>

            <form onSubmit={handlePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Season</label>
                  <select
                    value={form.season}
                    onChange={e => setForm(f => ({ ...f, season: e.target.value as any }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="summer">Summer</option>
                    <option value="monsoon">Monsoon</option>
                    <option value="winter">Winter</option>
                    <option value="autumn">Autumn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Group Size</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.group_size}
                    onChange={e => setForm(f => ({ ...f, group_size: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Fitness Level</label>
                <select
                  value={form.fitness_level}
                  onChange={e => setForm(f => ({ ...f, fitness_level: e.target.value as any }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full gradient-forest text-primary-foreground rounded-lg py-2.5 font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Generate Trek Plan
              </button>
            </form>
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-4"
              >
                <h3 className="font-semibold font-display text-lg">Trek Plan Results</h3>

                <div className="grid grid-cols-2 gap-3">
                  <Stat icon={<Clock className="w-4 h-4" />} label="Estimated Time" value={formatTime(result.estimated_time_minutes)} />
                  <Stat icon={<Droplets className="w-4 h-4" />} label="Hydration" value={`${result.hydration_liters} L`} />
                  <Stat icon={<Utensils className="w-4 h-4" />} label="Food" value={`${result.food_calories} cal`} />
                  <Stat icon={<PauseCircle className="w-4 h-4" />} label="Rest Stops" value={String(result.rest_stops)} />
                </div>

                <div className="bg-muted rounded-xl p-4 text-sm space-y-2">
                  <p><span className="font-medium">Rest Strategy:</span> {result.rest_strategy}</p>
                  <p><span className="font-medium">Difficulty Score:</span> {result.difficulty_score}/10</p>
                </div>

                <div className="flex items-start gap-2 bg-trail-warning/10 rounded-xl p-4">
                  <AlertTriangle className="w-4 h-4 text-trail-warning mt-0.5 shrink-0" />
                  <p className="text-sm">{result.season_advisory}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">{icon}<span className="text-xs">{label}</span></div>
      <p className="font-semibold font-display text-lg">{value}</p>
    </div>
  );
}

export default TrekPlanPage;
