import { useState } from "react";
import { SAMPLE_TRAILS, Trail } from "@/data/trails";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, Mountain, ArrowRight, LogOut, MapPin, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const difficultyColors = {
  easy: "bg-trail-success/15 text-trail-success",
  moderate: "bg-trail-warning/15 text-trail-earth",
  hard: "bg-trail-danger/15 text-destructive",
};

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const filtered = SAMPLE_TRAILS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-forest">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mountain className="w-6 h-6 text-primary-foreground" />
            <h1 className="text-xl font-bold text-primary-foreground font-display">Trekking Ally</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/hazards")}
              className="text-primary-foreground/80 hover:text-primary-foreground text-sm flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Hazards
            </button>
            <span className="text-primary-foreground/70 text-sm">Hi, {username}</span>
            <button
              onClick={logout}
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-8 pt-4">
          <h2 className="text-2xl font-bold text-primary-foreground font-display mb-1">
            Discover Trails
          </h2>
          <p className="text-primary-foreground/70 text-sm mb-6">
            Explore and plan your next adventure
          </p>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trails by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl bg-background/95 backdrop-blur-sm pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-card"
            />
          </div>
        </div>
      </header>

      {/* Trail Cards */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trail, i) => (
            <TrailCard key={trail.id} trail={trail} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No trails match your search.</p>
        )}
      </main>
    </div>
  );
};

function TrailCard({ trail, index }: { trail: Trail; index: number }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-card rounded-2xl shadow-card hover:shadow-elevated transition-shadow border border-border overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/plan/${trail.id}`)}
    >
      <div className="relative">
        {trail.image ? (
          <img src={trail.image} alt={trail.name} className="h-40 w-full object-cover" loading="lazy" />
        ) : (
          <div className="gradient-hero h-40" />
        )}
        <div className="absolute bottom-3 left-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColors[trail.difficulty]}`}>
            {trail.difficulty}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold font-display text-lg mb-1 group-hover:text-primary transition-colors">{trail.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{trail.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{trail.dist_km} km</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{trail.elev_m} m</span>
          </div>
          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
