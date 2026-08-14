import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("C:\\Users\\amanu\\.local\\share\\opencode\\opencode.db", { readOnly: true });
const cols = db.prepare("PRAGMA table_info(session)").all().map((c) => c.name);
console.log("SESSION COLS:", cols.join(", "));
const s = db
  .prepare(
    "SELECT COUNT(*) n, SUM(tokens_input) tin, SUM(tokens_output) tout, SUM(tokens_cache_read) tc, SUM(tokens_reasoning) trea, SUM(tokens_cache_write) tcw, SUM(cost) cost FROM session"
  )
  .get();
console.log(JSON.stringify(s, null, 2));
const m = db
  .prepare(
    "SELECT model, COUNT(*) n, SUM(tokens_input) tin, SUM(tokens_output) tout, SUM(tokens_cache_read) tc, SUM(tokens_reasoning) trea, SUM(tokens_cache_write) tcw FROM session GROUP BY model"
  )
  .all();
console.log(JSON.stringify(m, null, 2));
