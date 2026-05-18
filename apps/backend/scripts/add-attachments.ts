import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/crm",
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
        customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
        task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
        filename text NOT NULL,
        r2_key text NOT NULL UNIQUE,
        content_type text,
        size integer,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS attachments_userId_idx ON attachments USING btree (user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS attachments_leadId_idx ON attachments USING btree (lead_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS attachments_customerId_idx ON attachments USING btree (customer_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS attachments_taskId_idx ON attachments USING btree (task_id);`);
    console.log("Migration applied: created attachments table");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
