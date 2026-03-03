import { Trail } from "@/data/trails";

export interface TrekPlanInput {
  trail_id: string;
  season: "summer" | "monsoon" | "winter" | "autumn";
  group_size: number;
  fitness_level: "beginner" | "intermediate" | "advanced";
}

export interface TrekPlanResult {
  estimated_time_minutes: number;
  hydration_liters: number;
  food_calories: number;
  rest_stops: number;
  rest_strategy: string;
  difficulty_score: number;
  season_advisory: string;
}

const SEASON_MULTIPLIER: Record<string, number> = {
  summer: 1.2,
  monsoon: 1.4,
  winter: 0.95,
  autumn: 1.0,
};

const FITNESS_MULTIPLIER: Record<string, number> = {
  beginner: 1.5,
  intermediate: 1.0,
  advanced: 0.75,
};

export function planTrek(trail: Trail, input: TrekPlanInput): TrekPlanResult {
  // Simulated ML inference — heuristic-based prediction
  const baseTime = (trail.dist_km / 3.5) * 60 + (trail.elev_m / 300) * 30;
  const seasonMul = SEASON_MULTIPLIER[input.season] ?? 1;
  const fitnessMul = FITNESS_MULTIPLIER[input.fitness_level] ?? 1;
  const groupPenalty = Math.max(0, (input.group_size - 4) * 5);

  const estimated_time_minutes = Math.round(baseTime * seasonMul * fitnessMul + groupPenalty);
  const hours = estimated_time_minutes / 60;

  const hydration_liters = Math.round((hours * 0.5 * seasonMul + input.group_size * 0.3) * 10) / 10;
  const food_calories = Math.round(hours * 250 * fitnessMul);
  const rest_stops = Math.max(1, Math.floor(hours / 1.5));

  const difficulty_score = Math.min(10, Math.round(
    (trail.elev_m / 200 + trail.dist_km / 5) * seasonMul * fitnessMul
  ));

  const seasonAdvisories: Record<string, string> = {
    summer: "Carry extra water. Start early to avoid peak heat. Sunscreen essential.",
    monsoon: "Trails will be slippery. Leeches possible. Waterproof gear mandatory.",
    winter: "Great trekking weather. Carry warm layers for higher altitudes.",
    autumn: "Ideal conditions. Trails are dry and views are clear.",
  };

  const restStrategies = [
    "Short 5-min breaks every 45 minutes",
    "10-min rest at each viewpoint. One 20-min meal break midway.",
    "Frequent breaks recommended. Pace yourself on steep sections.",
  ];

  return {
    estimated_time_minutes,
    hydration_liters,
    food_calories,
    rest_stops,
    rest_strategy: restStrategies[Math.min(rest_stops - 1, 2)],
    difficulty_score,
    season_advisory: seasonAdvisories[input.season] ?? "",
  };
}
