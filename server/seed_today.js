import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'salonsync.db');

async function seedTodayAppointments() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Get current date formatted as YYYY-MM-DD in local time
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  console.log(`Booking today's appointments for date: ${todayStr}`);

  // We will book appointments up to 11 am without conflicts:
  // Ravi Kumar (1), Priya Sharma (2), Vikram Malhotra (3), Nisha Sen (4), Amit Trivedi (5)
  const appointmentsToBook = [
    {
      customerId: 1,
      customerName: "Meera Joshi",
      staffId: 1,
      staffName: "Ravi Kumar",
      serviceId: 2,
      serviceName: "Haircut (Women)",
      branchId: 1,
      date: todayStr,
      time: "09:00",
      status: "confirmed",
      source: "whatsapp",
      amount: 600
    },
    {
      customerId: 2,
      customerName: "Arjun Singh",
      staffId: 2,
      staffName: "Priya Sharma",
      serviceId: 3,
      serviceName: "Hair Color",
      branchId: 1,
      date: todayStr,
      time: "09:30",
      status: "confirmed",
      source: "instagram",
      amount: 1500
    },
    {
      customerId: 4,
      customerName: "Rahul Verma",
      staffId: 3,
      staffName: "Vikram Malhotra",
      serviceId: 5,
      serviceName: "Manicure",
      branchId: 1,
      date: todayStr,
      time: "10:00",
      status: "confirmed",
      source: "voice",
      amount: 500
    },
    {
      customerId: 5,
      customerName: "Sneha Gupta",
      staffId: 4,
      staffName: "Nisha Sen",
      serviceId: 4,
      serviceName: "Facial",
      branchId: 1,
      date: todayStr,
      time: "10:30",
      status: "confirmed",
      source: "walkin",
      amount: 800
    },
    {
      customerId: 6,
      customerName: "Aditya Roy",
      staffId: 5,
      staffName: "Amit Trivedi",
      serviceId: 1,
      serviceName: "Haircut (Men)",
      branchId: 1,
      date: todayStr,
      time: "11:00",
      status: "confirmed",
      source: "website",
      amount: 300
    }
  ];

  for (const appt of appointmentsToBook) {
    try {
      // Check if duplicate already exists to avoid duplicate seeding
      const existing = await db.get(
        'SELECT * FROM appointments WHERE date = ? AND time = ? AND staffId = ?',
        [appt.date, appt.time, appt.staffId]
      );

      if (existing) {
        console.log(`Appointment already exists for ${appt.staffName} at ${appt.time}. Skipping.`);
        continue;
      }

      await db.run(
        `INSERT INTO appointments (
          customerId, customerName, staffId, staffName, serviceId, serviceName, branchId, date, time, status, source, amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          appt.customerId,
          appt.customerName,
          appt.staffId,
          appt.staffName,
          appt.serviceId,
          appt.serviceName,
          appt.branchId,
          appt.date,
          appt.time,
          appt.status,
          appt.source,
          appt.amount
        ]
      );
      console.log(`✅ Booked: ${appt.customerName} with ${appt.apptName || appt.staffName} at ${appt.time} via ${appt.source}`);
    } catch (err) {
      console.error(`❌ Failed to book appointment for ${appt.customerName}:`, err.message);
    }
  }

  await db.close();
  console.log("Seeding complete.");
}

seedTodayAppointments();
