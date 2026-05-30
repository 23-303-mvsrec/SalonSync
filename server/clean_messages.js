import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'salonsync.db');

async function cleanMessages() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log("Cleaning chatbot options/messy messages from wa_messages table...");

    const res = await db.run(`
      DELETE FROM wa_messages 
      WHERE text IN ('1', '2', '3', '4', '5', '6', '7', '8', '9', 'hello', 'confirm', 'Hello', 'Confirm')
         OR text LIKE '%Booking Confirmed%'
         OR text LIKE '%Choose your preferred stylist%'
         OR text LIKE '%select a treatment category%'
         OR text LIKE '%Choose a timing slot today%'
         OR text LIKE '%Finally, please reply with your Full Name%'
         OR text LIKE '%Great! You selected%'
         OR text LIKE '%timing slot%chosen%';
    `);

    console.log(`Successfully deleted ${res.changes} messy chatbot selection messages.`);
    await db.close();
  } catch (err) {
    console.error("Error cleaning messages:", err.message);
  }
}

cleanMessages();
