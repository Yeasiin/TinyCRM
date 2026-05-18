import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/crm",
});

async function run() {
  const client = await pool.connect();
  try {
    // Check if drizzle_migrations table exists (created by drizzle-kit migrate)
    const { rows } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      );
    `);
    const exists = rows[0]?.exists;

    if (!exists) {
      // Create the drizzle schema and migrations table if it doesn't exist
      await client.query(`CREATE SCHEMA IF NOT EXISTS "drizzle";`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
          id SERIAL PRIMARY KEY,
          hash text NOT NULL UNIQUE,
          created_at bigint
        );
      `);
    }

    // Ensure unique constraint on hash
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = '__drizzle_migrations_hash_unique'
        ) THEN
          ALTER TABLE "drizzle"."__drizzle_migrations" ADD CONSTRAINT __drizzle_migrations_hash_unique UNIQUE (hash);
        END IF;
      END $$;
    `);

    // Insert our migration record
    await client.query(`
      INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
      VALUES ('0000_numerous_shape', ${Date.now()})
      ON CONFLICT (hash) DO NOTHING;
    `);

    console.log("Migration journal updated.");
  } catch (err) {
    console.error("Failed to update journal:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
