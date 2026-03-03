export interface Trail {
  id: string;
  name: string;
  dist_km: number;
  elev_m: number;
  gpx_path: string;
  lat: number;
  lng: number;
  description: string;
  difficulty: "easy" | "moderate" | "hard";
  image?: string;
}

export const SAMPLE_TRAILS: Trail[] = [
  {
    id: "t1",
    name: "Kothaligad Fort Trek",
    dist_km: 12.5,
    elev_m: 927,
    gpx_path: "/trails/kothaligad.gpx",
    lat: 19.0330,
    lng: 73.4660,
    description: "A historic hill fort near Karjat with panoramic views of the Sahyadri range. The pinnacle offers a 360° view.",
    difficulty: "moderate",
  },
  {
    id: "t2",
    name: "Harishchandragad via Nalichi Vaat",
    dist_km: 18.0,
    elev_m: 1424,
    gpx_path: "/trails/harishchandragad.gpx",
    lat: 19.3893,
    lng: 73.7772,
    description: "One of the toughest treks in Maharashtra. The Konkan Kada cliff face is breathtaking and vertigo-inducing.",
    difficulty: "hard",
  },
  {
    id: "t3",
    name: "Lohagad Fort Trek",
    dist_km: 7.0,
    elev_m: 1033,
    gpx_path: "/trails/lohagad.gpx",
    lat: 18.7088,
    lng: 73.4769,
    description: "An easy weekend trek near Lonavala with well-carved stone steps and Vinchu Kata (Scorpion Tail) viewpoint.",
    difficulty: "easy",
  },
];
