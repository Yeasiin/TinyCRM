import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/crm",
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE activities 
      ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES tasks(id) ON DELETE CASCADE;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS activities_taskId_idx ON activities USING btree (task_id);
    `);
    console.log("Migration applied: added task_id to activities");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
