import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'salonsync.db');

async function viewDb() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log('==================================================');
  console.log('       SalonSync SQLite Database Inspector        ');
  console.log('==================================================\n');

  const tables = ['branches', 'services', 'staff', 'customers', 'appointments', 'inventory', 'wa_messages', 'notifications'];

  for (const table of tables) {
    try {
      const countRes = await db.get(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`📊 Table: "${table}" (${countRes.count} total records)`);
      
      const rows = await db.all(`SELECT * FROM ${table} LIMIT 5`);
      if (rows.length === 0) {
        console.log('   (Empty table)\n');
      } else {
        console.table(rows);
        console.log('');
      }
    } catch (e) {
      console.log(`❌ Error querying table "${table}": ${e.message}\n`);
    }
  }

  await db.close();
}

viewDb();
