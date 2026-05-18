import { Pool } from "pg";
import fs from "fs";
import path from "path";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/crm",
});

async function run() {
  const client = await pool.connect();
  try {
    // Clean up any partially created CRM objects
    const cleanup = `
      DROP TABLE IF EXISTS activities, notes, tasks, deals, customers, leads CASCADE;
      DROP TYPE IF EXISTS activity_type, task_status, lead_status;
    `;
    console.log("Cleaning up partial objects...");
    await client.query(cleanup);

    const sqlPath = path.join(process.cwd(), "drizzle", "0000_numerous_shape.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    const statements = sql.split(";--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);

    await client.query("BEGIN");
    for (const stmt of statements) {
      const clean = stmt.replace(/-->\s*statement-breakpoint/g, "").trim();
      if (!clean) continue;
      console.log("Running:", clean.substring(0, 80) + "...");
      await client.query(clean);
    }
    await client.query("COMMIT");
    console.log("Migration applied successfully.");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
