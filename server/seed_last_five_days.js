import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'salonsync.db');

// ─── Reference Data (matches db.js exactly) ───────────────────────────────────

const services = [
  { id: 1,  name: "Haircut (Men)",       price: 300,  duration: 30  },
  { id: 2,  name: "Haircut (Women)",     price: 600,  duration: 60  },
  { id: 3,  name: "Hair Color",          price: 1500, duration: 90  },
  { id: 4,  name: "Facial",              price: 800,  duration: 60  },
  { id: 5,  name: "Manicure",            price: 500,  duration: 45  },
  { id: 6,  name: "Pedicure",            price: 600,  duration: 45  },
  { id: 7,  name: "Beard Trim",          price: 150,  duration: 20  },
  { id: 8,  name: "Waxing (Full Arms)",  price: 400,  duration: 30  },
  { id: 9,  name: "Hair Spa",            price: 1200, duration: 75  },
  { id: 10, name: "Bridal Makeup",       price: 8000, duration: 180 },
];

// Staff per branch
const branchStaff = {
  1: [
    { id: 1,  name: "Ravi Kumar"       },
    { id: 2,  name: "Priya Sharma"     },
    { id: 3,  name: "Vikram Malhotra"  },
    { id: 4,  name: "Nisha Sen"        },
    { id: 5,  name: "Amit Trivedi"     },
  ],
  2: [
    { id: 6,  name: "Anjali Reddy"     },
    { id: 7,  name: "Mohammed Irfan"   },
    { id: 8,  name: "Rajesh Kulkarni"  },
    { id: 9,  name: "Divya Joshi"      },
    { id: 10, name: "Karan Singhal"    },
  ],
  3: [
    { id: 11, name: "Sunita Patel"     },
    { id: 12, name: "Deepak Nair"      },
    { id: 13, name: "Suresh Rao"       },
    { id: 14, name: "Tina Fernandes"   },
    { id: 15, name: "Ananya Roy"       },
  ],
};

const customers = [
  { id: 1,  name: "Meera Joshi"      },
  { id: 2,  name: "Arjun Singh"      },
  { id: 3,  name: "Kavya Rao"        },
  { id: 4,  name: "Rahul Verma"      },
  { id: 5,  name: "Sneha Gupta"      },
  { id: 6,  name: "Aditya Roy"       },
  { id: 7,  name: "Pooja Nair"       },
  { id: 8,  name: "Vikram Rathore"   },
  { id: 9,  name: "Tanvi Shah"       },
  { id: 10, name: "Rohan Das"        },
  { id: 11, name: "Karan Malhotra"   },
  { id: 12, name: "Priti Patel"      },
  { id: 13, name: "Harish Rao"       },
  { id: 14, name: "Kiran Sen"        },
  { id: 15, name: "Rahul Nair"       },
  { id: 16, name: "Aisha Joshi"      },
  { id: 17, name: "Vijay Deshmukh"   },
  { id: 18, name: "Deepa Pillai"     },
  { id: 19, name: "Priya Saxena"     },
  { id: 20, name: "Sameer Gokhale"   },
  { id: 21, name: "Mahesh Hegde"     },
  { id: 22, name: "Rishi Kulkarni"   },
  { id: 23, name: "Harsh Pandya"     },
  { id: 24, name: "Abdul Siddiqui"   },
  { id: 25, name: "Sneha Iyer"       },
  { id: 26, name: "Abhijit Roy"      },
  { id: 27, name: "Kirti Das"        },
  { id: 28, name: "Sohail Qureshi"   },
  { id: 29, name: "Ayush Banerjee"   },
  { id: 30, name: "Komal Mehta"      },
];

const sources = ["walkin", "website", "whatsapp", "call", "instagram"];

// ─── Hand-crafted per-day appointment plans ───────────────────────────────────
// Format per entry: [staffIndex(0-4), customerIndex(0-29), serviceId, time, source]
// staffIndex is 0-based within branchStaff[branchId]
// All past-day appointments will be status = 'completed'

const dayPlans = {
  // May 25 (Mon)
  "2026-05-25": {
    1: [
      [0, 0,  1, "09:00", "walkin"],
      [1, 1,  3, "09:30", "website"],
      [2, 2,  5, "09:00", "whatsapp"],
      [3, 3,  4, "10:00", "call"],
      [4, 4,  7, "09:30", "walkin"],
      [0, 5,  9, "10:30", "instagram"],
      [1, 6,  2, "11:30", "website"],
      [2, 7,  8, "10:30", "walkin"],
      [3, 8,  6, "11:30", "whatsapp"],
      [4, 9,  1, "11:00", "walkin"],
      [0, 10, 4, "13:00", "call"],
      [1, 11, 7, "14:00", "walkin"],
      [2, 12, 1, "13:30", "website"],
      [3, 13, 3, "14:00", "instagram"],
      [4, 14, 9, "13:00", "walkin"],
    ],
    2: [
      [0, 15, 10, "09:00", "website"],
      [1, 16,  1, "09:30", "walkin"],
      [2, 17,  2, "09:00", "whatsapp"],
      [3, 18,  5, "10:00", "call"],
      [4, 19,  7, "09:30", "walkin"],
      [0, 20,  4, "12:00", "instagram"],
      [1, 21,  9, "11:30", "website"],
      [2, 22,  3, "11:00", "walkin"],
      [3, 23,  6, "12:00", "whatsapp"],
      [4, 24,  1, "11:30", "walkin"],
      [0, 25,  8, "14:00", "call"],
      [1, 26,  2, "15:00", "walkin"],
      [2, 27,  7, "14:00", "website"],
      [3, 28,  4, "15:30", "instagram"],
    ],
    3: [
      [0, 29, 2, "09:00", "walkin"],
      [1,  0, 5, "09:30", "website"],
      [2,  1, 8, "09:00", "whatsapp"],
      [3,  2, 4, "10:00", "call"],
      [4,  3, 1, "09:30", "walkin"],
      [0,  4, 9, "11:30", "instagram"],
      [1,  5, 3, "11:00", "website"],
      [2,  6, 7, "10:30", "walkin"],
      [3,  7, 6, "12:00", "whatsapp"],
      [4,  8, 2, "11:30", "walkin"],
      [0,  9, 4, "13:00", "call"],
      [1, 10, 1, "14:30", "walkin"],
      [2, 11, 9, "13:30", "website"],
    ],
  },

  // May 26 (Tue)
  "2026-05-26": {
    1: [
      [0, 12,  2, "09:00", "website"],
      [1, 13,  7, "09:30", "walkin"],
      [2, 14,  4, "09:00", "whatsapp"],
      [3, 15,  9, "10:00", "call"],
      [4, 16,  1, "09:30", "instagram"],
      [0, 17,  3, "11:00", "walkin"],
      [1, 18,  5, "11:30", "website"],
      [2, 19,  8, "10:30", "walkin"],
      [3, 20,  6, "12:00", "whatsapp"],
      [4, 21,  2, "11:00", "walkin"],
      [0, 22,  7, "13:30", "call"],
      [1, 23,  9, "14:00", "walkin"],
      [2, 24,  1, "13:00", "website"],
      [3, 25,  4, "15:00", "instagram"],
      [4, 26,  3, "14:30", "walkin"],
    ],
    2: [
      [0, 27,  1, "09:00", "walkin"],
      [1, 28,  5, "09:30", "website"],
      [2, 29,  7, "09:00", "whatsapp"],
      [3,  0,  3, "10:30", "call"],
      [4,  1,  9, "10:00", "walkin"],
      [0,  2,  2, "12:00", "instagram"],
      [1,  3,  4, "11:30", "website"],
      [2,  4,  6, "11:00", "walkin"],
      [3,  5,  8, "13:00", "whatsapp"],
      [4,  6,  1, "12:30", "walkin"],
      [0,  7, 10, "13:30", "call"],
      [1,  8,  7, "15:00", "walkin"],
      [2,  9,  2, "14:30", "website"],
      [3, 10,  5, "16:00", "instagram"],
    ],
    3: [
      [0, 11,  4, "09:00", "walkin"],
      [1, 12,  9, "09:30", "website"],
      [2, 13,  1, "09:00", "whatsapp"],
      [3, 14,  7, "10:00", "call"],
      [4, 15,  3, "09:30", "walkin"],
      [0, 16,  8, "11:00", "instagram"],
      [1, 17,  2, "11:30", "website"],
      [2, 18,  6, "10:30", "walkin"],
      [3, 19,  4, "12:00", "whatsapp"],
      [4, 20,  5, "11:30", "walkin"],
      [0, 21,  1, "13:30", "call"],
      [1, 22,  9, "14:00", "walkin"],
      [2, 23,  7, "13:00", "website"],
    ],
  },

  // May 27 (Wed)
  "2026-05-27": {
    1: [
      [0, 24,  9, "09:30", "walkin"],
      [1, 25,  1, "09:00", "website"],
      [2, 26,  3, "09:30", "call"],
      [3, 27,  5, "10:00", "whatsapp"],
      [4, 28,  7, "09:00", "walkin"],
      [0, 29,  4, "11:30", "instagram"],
      [1,  0,  8, "11:00", "website"],
      [2,  1,  2, "11:30", "walkin"],
      [3,  2,  6, "12:30", "call"],
      [4,  3,  9, "12:00", "walkin"],
      [0,  4,  1, "14:00", "website"],
      [1,  5,  7, "14:30", "walkin"],
      [2,  6,  4, "13:30", "whatsapp"],
      [3,  7,  3, "15:00", "instagram"],
      [4,  8,  2, "14:00", "walkin"],
    ],
    2: [
      [0,  9,  7, "09:00", "walkin"],
      [1, 10,  2, "09:30", "website"],
      [2, 11,  5, "09:00", "whatsapp"],
      [3, 12,  9, "10:00", "call"],
      [4, 13,  1, "09:30", "walkin"],
      [0, 14,  4, "11:30", "instagram"],
      [1, 15, 10, "10:00", "website"],
      [2, 16,  8, "11:00", "walkin"],
      [3, 17,  3, "12:30", "whatsapp"],
      [4, 18,  6, "12:00", "walkin"],
      [0, 19,  7, "14:00", "call"],
      [1, 20,  1, "15:00", "walkin"],
      [2, 21,  9, "14:30", "website"],
      [3, 22,  2, "16:00", "instagram"],
    ],
    3: [
      [0, 23,  3, "09:00", "walkin"],
      [1, 24,  7, "09:30", "website"],
      [2, 25,  9, "09:00", "whatsapp"],
      [3, 26,  2, "10:00", "call"],
      [4, 27,  4, "09:30", "walkin"],
      [0, 28,  1, "11:30", "instagram"],
      [1, 29,  8, "11:00", "website"],
      [2,  0,  5, "10:30", "walkin"],
      [3,  1,  6, "12:00", "whatsapp"],
      [4,  2,  3, "11:30", "walkin"],
      [0,  3,  9, "13:30", "call"],
      [1,  4,  1, "14:00", "walkin"],
      [2,  5,  7, "13:00", "website"],
    ],
  },

  // May 28 (Thu)
  "2026-05-28": {
    1: [
      [0,  6,  1, "09:00", "walkin"],
      [1,  7,  3, "09:30", "website"],
      [2,  8,  5, "09:00", "whatsapp"],
      [3,  9,  7, "10:00", "call"],
      [4, 10,  9, "09:30", "walkin"],
      [0, 11,  2, "11:30", "instagram"],
      [1, 12,  4, "11:00", "website"],
      [2, 13,  8, "10:30", "walkin"],
      [3, 14,  6, "12:00", "whatsapp"],
      [4, 15,  1, "11:30", "walkin"],
      [0, 16,  7, "13:30", "call"],
      [1, 17,  9, "14:00", "walkin"],
      [2, 18,  3, "13:00", "website"],
      [3, 19,  4, "15:00", "instagram"],
      [4, 20,  2, "14:00", "walkin"],
    ],
    2: [
      [0, 21,  5, "09:00", "walkin"],
      [1, 22,  1, "09:30", "website"],
      [2, 23,  7, "09:00", "whatsapp"],
      [3, 24,  3, "10:00", "call"],
      [4, 25,  9, "09:30", "walkin"],
      [0, 26, 10, "11:30", "instagram"],
      [1, 27,  2, "11:00", "website"],
      [2, 28,  4, "10:30", "walkin"],
      [3, 29,  6, "12:00", "whatsapp"],
      [4,  0,  8, "11:30", "walkin"],
      [0,  1,  1, "14:00", "call"],
      [1,  2,  5, "14:30", "walkin"],
      [2,  3,  9, "13:30", "website"],
      [3,  4,  7, "15:00", "instagram"],
    ],
    3: [
      [0,  5,  2, "09:00", "walkin"],
      [1,  6,  8, "09:30", "website"],
      [2,  7,  4, "09:00", "whatsapp"],
      [3,  8,  1, "10:00", "call"],
      [4,  9,  6, "09:30", "walkin"],
      [0, 10,  9, "11:00", "instagram"],
      [1, 11,  3, "11:30", "website"],
      [2, 12,  5, "10:30", "walkin"],
      [3, 13,  7, "12:00", "whatsapp"],
      [4, 14,  2, "11:30", "walkin"],
      [0, 15,  4, "13:30", "call"],
      [1, 16,  1, "14:00", "walkin"],
      [2, 17,  9, "13:00", "website"],
    ],
  },

  // May 29 (Fri)
  "2026-05-29": {
    1: [
      [0, 18,  3, "09:00", "website"],
      [1, 19,  1, "09:30", "walkin"],
      [2, 20,  7, "09:00", "whatsapp"],
      [3, 21,  9, "10:00", "call"],
      [4, 22,  4, "09:30", "walkin"],
      [0, 23,  2, "11:00", "instagram"],
      [1, 24,  5, "11:30", "website"],
      [2, 25,  8, "10:30", "walkin"],
      [3, 26,  6, "12:30", "whatsapp"],
      [4, 27,  1, "12:00", "walkin"],
      [0, 28,  3, "14:00", "call"],
      [1, 29,  7, "14:30", "walkin"],
      [2,  0,  9, "13:30", "website"],
      [3,  1,  4, "15:00", "instagram"],
      [4,  2,  2, "14:00", "walkin"],
    ],
    2: [
      [0,  3,  1, "09:00", "walkin"],
      [1,  4,  7, "09:30", "website"],
      [2,  5,  3, "09:00", "whatsapp"],
      [3,  6,  5, "10:00", "call"],
      [4,  7, 10, "09:30", "walkin"],
      [0,  8,  9, "11:30", "instagram"],
      [1,  9,  2, "11:00", "website"],
      [2, 10,  4, "10:30", "walkin"],
      [3, 11,  6, "12:00", "whatsapp"],
      [4, 12,  8, "12:30", "walkin"],
      [0, 13,  1, "14:00", "call"],
      [1, 14,  5, "14:30", "walkin"],
      [2, 15,  7, "13:30", "website"],
      [3, 16,  3, "15:30", "instagram"],
    ],
    3: [
      [0, 17,  4, "09:00", "walkin"],
      [1, 18,  9, "09:30", "website"],
      [2, 19,  2, "09:00", "whatsapp"],
      [3, 20,  1, "10:00", "call"],
      [4, 21,  7, "09:30", "walkin"],
      [0, 22,  3, "11:00", "instagram"],
      [1, 23,  5, "11:30", "website"],
      [2, 24,  6, "10:30", "walkin"],
      [3, 25,  8, "12:00", "whatsapp"],
      [4, 26,  4, "11:30", "walkin"],
      [0, 27,  9, "13:30", "call"],
      [1, 28,  1, "14:00", "walkin"],
      [2, 29,  7, "13:00", "website"],
    ],
  },
};

// ─── Today's live appointments (mixed statuses) ────────────────────────────────
const todayDate = new Date().toISOString().slice(0, 10);

const todayPlan = {
  1: [
    [0, 0,  1, "09:00", "walkin",    "completed"],
    [1, 1,  3, "09:30", "website",   "completed"],
    [2, 2,  5, "09:00", "whatsapp",  "completed"],
    [3, 3,  4, "10:00", "call",      "completed"],
    [4, 4,  7, "09:30", "walkin",    "completed"],
    [0, 5,  9, "10:30", "instagram", "inprogress"],
    [1, 6,  2, "11:30", "website",   "inprogress"],
    [2, 7,  8, "10:30", "walkin",    "confirmed"],
    [3, 8,  6, "11:30", "whatsapp",  "confirmed"],
    [4, 9,  1, "11:00", "walkin",    "confirmed"],
    [0, 10, 4, "13:00", "call",      "pending"],
    [1, 11, 7, "14:00", "walkin",    "pending"],
    [2, 12, 1, "13:30", "website",   "pending"],
  ],
  2: [
    [0, 13, 10, "09:00", "website",   "completed"],
    [1, 14,  1, "09:30", "walkin",    "completed"],
    [2, 15,  2, "09:00", "whatsapp",  "completed"],
    [3, 16,  5, "10:00", "call",      "completed"],
    [4, 17,  7, "09:30", "walkin",    "completed"],
    [0, 18,  4, "12:00", "instagram", "inprogress"],
    [1, 19,  9, "11:30", "website",   "inprogress"],
    [2, 20,  3, "11:00", "walkin",    "confirmed"],
    [3, 21,  6, "12:00", "whatsapp",  "confirmed"],
    [4, 22,  1, "11:30", "walkin",    "confirmed"],
    [0, 23,  8, "14:00", "call",      "pending"],
    [1, 24,  2, "15:00", "walkin",    "pending"],
    [2, 25,  7, "14:00", "website",   "pending"],
  ],
  3: [
    [0, 26, 2, "09:00", "walkin",    "completed"],
    [1, 27, 5, "09:30", "website",   "completed"],
    [2, 28, 8, "09:00", "whatsapp",  "completed"],
    [3, 29, 4, "10:00", "call",      "completed"],
    [4,  0, 1, "09:30", "walkin",    "completed"],
    [0,  1, 9, "11:30", "instagram", "inprogress"],
    [1,  2, 3, "11:00", "website",   "inprogress"],
    [2,  3, 7, "10:30", "walkin",    "confirmed"],
    [3,  4, 6, "12:00", "whatsapp",  "confirmed"],
    [4,  5, 2, "11:30", "walkin",    "confirmed"],
    [0,  6, 4, "13:00", "call",      "pending"],
    [1,  7, 1, "14:30", "walkin",    "pending"],
    [2,  8, 9, "13:30", "website",   "pending"],
  ],
};

// ─── Seeder ───────────────────────────────────────────────────────────────────

async function seed() {
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

  const allDates = [...Object.keys(dayPlans), todayDate];
  const uniqueDates = [...new Set(allDates)];

  console.log(`\n🗑  Clearing appointments for: ${uniqueDates.join(', ')}`);
  for (const d of uniqueDates) {
    await db.run('DELETE FROM appointments WHERE date = ?', [d]);
  }

  let count = 0;

  // ── Past days ──────────────────────────────────────────────────────────────
  for (const [date, branchPlans] of Object.entries(dayPlans)) {
    // Skip if this date is today (handled below)
    if (date === todayDate) continue;

    for (const [branchId, slots] of Object.entries(branchPlans)) {
      const staffArr = branchStaff[Number(branchId)];
      for (const [staffIdx, custIdx, svcId, time, source] of slots) {
        const staffMember = staffArr[staffIdx];
        const customer    = customers[custIdx];
        const service     = services.find(s => s.id === svcId);

        await db.run(
          `INSERT INTO appointments
            (customerId, customerName, staffId, staffName, serviceId, serviceName, branchId, date, time, status, source, amount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
          [customer.id, customer.name, staffMember.id, staffMember.name,
           service.id, service.name, Number(branchId), date, time, source, service.price]
        );
        count++;
      }
    }
  }

  console.log(`✅ Past days seeded: ${count} appointments`);

  // ── Today's live appointments ──────────────────────────────────────────────
  let todayCount = 0;
  for (const [branchId, slots] of Object.entries(todayPlan)) {
    const staffArr = branchStaff[Number(branchId)];
    for (const [staffIdx, custIdx, svcId, time, source, status] of slots) {
      const staffMember = staffArr[staffIdx];
      const customer    = customers[custIdx];
      const service     = services.find(s => s.id === svcId);

      await db.run(
        `INSERT INTO appointments
          (customerId, customerName, staffId, staffName, serviceId, serviceName, branchId, date, time, status, source, amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customer.id, customer.name, staffMember.id, staffMember.name,
         service.id, service.name, Number(branchId), todayDate, time, status, source, service.price]
      );
      count++;
      todayCount++;
    }
  }

  console.log(`✅ Today (${todayDate}) seeded: ${todayCount} live appointments`);
  console.log(`\n🎉 Total seeded: ${count} appointments across ${uniqueDates.length} days\n`);

  await db.close();
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
