import { sql } from "@vercel/postgres";

// Réexport direct du client tagged-template de @vercel/postgres.
// Usage : import { sql } from "@/lib/db";  puis  await sql`SELECT * FROM users WHERE id = ${id}`;
// Les valeurs interpolées sont automatiquement échappées (protection injection SQL).
export { sql };
