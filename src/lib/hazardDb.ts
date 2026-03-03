import { openDB, IDBPDatabase } from "idb";

export interface Hazard {
  id?: number;
  trail_id: string;
  lat: number;
  lng: number;
  category: "rockfall" | "wildlife" | "weather" | "trail_damage" | "other";
  description: string;
  reported_at: string;
  synced: boolean;
}

const DB_NAME = "trekking-ally-hazards";
const STORE_NAME = "hazards";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("by-synced", "synced");
        store.createIndex("by-trail", "trail_id");
      },
    });
  }
  return dbPromise;
}

export async function addHazard(hazard: Omit<Hazard, "id">): Promise<number> {
  const db = await getDB();
  return db.add(STORE_NAME, hazard) as Promise<number>;
}

export async function getUnsyncedHazards(): Promise<Hazard[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME) as Hazard[];
  return all.filter(h => !h.synced);
}

export async function getAllHazards(): Promise<Hazard[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function getHazardsByTrail(trailId: string): Promise<Hazard[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE_NAME, "by-trail", trailId);
}

export async function markHazardsSynced(ids: number[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  for (const id of ids) {
    const hazard = await tx.store.get(id);
    if (hazard) {
      hazard.synced = true;
      await tx.store.put(hazard);
    }
  }
  await tx.done;
}
