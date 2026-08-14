import { DatabaseSync } from "node:sqlite";
import os from "node:os";
import path from "node:path";

const DB_PATH =
  process.env.OPENCODE_DB_PATH ??
  path.join(os.homedir(), ".local", "share", "opencode", "opencode.db");

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH, { open: true });
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("PRAGMA query_only = ON");
  }
  return db;
}

export function dbPath(): string {
  return DB_PATH;
}
