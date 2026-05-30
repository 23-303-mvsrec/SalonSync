import express from 'express';
import cors from 'cors';
import { initDb } from './db.js'; // Trigger re-seed
import { getAIResponse, resetConversation, getActiveSessionCount } from './gemini-chatbot.js';

const app = express();
const PORT = process.env.PORT || 5000;

function safeJsonParse(str, fallback = null) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}


app.use(cors());
app.use(express.json());

// Initialize Database connection
let db;
try {
  db = await initDb();
  console.log('Successfully connected to SQLite database.');

  // Automatically prune conflicting appointments (duplicate bookings for same stylist, date, and time slot)
  const appointments = await db.all("SELECT * FROM appointments");
  const seen = new Set();
  const toDelete = [];
  for (const a of appointments) {
    const key = `${a.date}::${a.time}::${a.staffId}`;
    if (seen.has(key)) {
      toDelete.push(a.id);
    } else {
      seen.add(key);
    }
  }
  if (toDelete.length > 0) {
    const placeholders = toDelete.map(() => '?').join(',');
    await db.run(`DELETE FROM appointments WHERE id IN (${placeholders})`, toDelete);
    console.log(`[Startup Cleanup] Deleted ${toDelete.length} conflicting appointments.`);
  }
} catch (e) {
  console.error('Fatal: Failed to connect to database:', e);
  process.exit(1);
}

// --- TELEMETRY & GATEWAY UTILITIES ---
async function sendDiscordNotification(db, messageText, embedTitle = "SalonSync Alert", embedColor = 0x5865F2) {
  try {
    const setting = await db.get("SELECT value FROM settings WHERE key = 'discord_webhook_url'");
    const webhookUrl = setting?.value;
    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      return; // No webhook configured
    }

    const payload = {
      embeds: [
        {
          title: embedTitle,
          description: messageText,
          color: embedColor,
          timestamp: new Date().toISOString(),
          footer: {
            text: "SalonSync Omnichannel Gateway"
          }
        }
      ]
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.error("Failed to dispatch Discord webhook:", await res.text());
    }
  } catch (err) {
    console.error("Error dispatching Discord webhook:", err);
  }
}

async function parseAndSaveWebhook(db, { id, sender, text, channel, clientName, phone, branchId, date }) {
  const services = await db.all("SELECT * FROM services");
  const staff = await db.all("SELECT * FROM staff");
  const branches = await db.all("SELECT * FROM branches");

  const textLower = text.toLowerCase();

  // Find matching service
  let matchedService = services.find(s => textLower.includes(s.name.toLowerCase()));
  if (!matchedService) {
    if (textLower.includes("haircut")) {
      matchedService = services.find(s => s.name.toLowerCase().includes("haircut"));
    } else if (textLower.includes("facial")) {
      matchedService = services.find(s => s.name.toLowerCase().includes("facial"));
    } else if (textLower.includes("spa")) {
      matchedService = services.find(s => s.name.toLowerCase().includes("spa"));
    } else if (textLower.includes("color")) {
      matchedService = services.find(s => s.name.toLowerCase().includes("color"));
    } else if (textLower.includes("makeup")) {
      matchedService = services.find(s => s.name.toLowerCase().includes("makeup"));
    }
  }
  if (!matchedService) matchedService = services[0];

  // Find matching stylist
  let matchedStaff = staff.find(s => 
    textLower.includes(s.name.toLowerCase()) || 
    textLower.includes(s.name.split(" ")[0].toLowerCase())
  );
  if (!matchedStaff) {
    const bId = branchId ? parseInt(branchId, 10) : 1;
    const branchStaff = staff.filter(s => s.branchId === bId);
    matchedStaff = branchStaff[0] || staff[0];
  }

  // Parse time
  let matchedTime = "12:00";
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = textLower.match(timeRegex);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? match[2] : "00";
    const ampm = match[3] ? match[3].toLowerCase() : "";
    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    if (hours >= 1 && hours <= 8 && ampm === "") hours += 12; 
    matchedTime = `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const msgId = id || "msg-" + Date.now();
  const finalBranchId = matchedStaff ? matchedStaff.branchId : (branchId ? parseInt(branchId, 10) : 1);
  const activeBranch = branches.find(b => b.id === finalBranchId) || branches[0];

  // Insert wa_messages
  await db.run(
    `INSERT INTO wa_messages (
      id, sender, text, time, channel, status, clientName, phone, service, stylist, date, timeSlot, branchId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      msgId,
      sender || "client",
      text,
      timestamp,
      channel || "whatsapp",
      "pending",
      clientName || "Guest Client",
      phone || "9888877777",
      JSON.stringify(matchedService),
      JSON.stringify(matchedStaff),
      date || new Date().toISOString().split("T")[0],
      matchedTime,
      finalBranchId
    ]
  );

  // Write notification
  const logType = channel === "whatsapp" ? "WhatsApp" : (channel === "instagram" ? "Instagram" : "Voice Call");
  const notifId = "notif-" + Date.now();
  await db.run(
    "INSERT INTO notifications (id, customerName, phone, message, type, timestamp, status, unread) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
    [
      notifId,
      clientName || "Guest Client",
      phone || "9888877777",
      `[Real-time Webhook API] Received ${logType} booking from ${clientName || "Guest"} for ${matchedService.name} with ${matchedStaff.name} at ${matchedTime}.`,
      logType,
      timestamp,
      "Delivered"
    ]
  );

  // Send Discord Alert
  let channelColor = 0x25D366; 
  if (channel === "instagram") channelColor = 0xE1306C;
  if (channel === "voice") channelColor = 0xFFB900;

  const discordMsg = `💬 **Incoming ${logType} Reservation Request!**\n\n` + 
                     `👤 **Client**: ${clientName || "Guest Client"} (${phone || "N/A"})\n` +
                     `💇 **Service**: ${matchedService.name} (₹${matchedService.price})\n` +
                     `💇 **Stylist**: ${matchedStaff.name} (${matchedStaff.role})\n` +
                     `⏰ **Schedule**: ${matchedTime} on ${date || "today"}\n` +
                     `📍 **Branch**: ${activeBranch.name}\n` +
                     `📝 **Message**: "${text}"\n\n` +
                     `*Status: Awaiting Admin Approval in Webhook Hub.*`;

  await sendDiscordNotification(db, discordMsg, `New Inbound ${logType} Webhook`, channelColor);

  if (sender === 'client') {
    setTimeout(() => {
      handleChatbotFlow(db, { phone, text, channel, clientName, id }).catch(err => {
        console.error("Error in background handleChatbotFlow:", err);
      });
    }, 300);
  }

  const savedMsg = await db.get("SELECT * FROM wa_messages WHERE id = ?", [msgId]);
  if (!savedMsg) return null;
  return {
    ...savedMsg,
    service: safeJsonParse(savedMsg.service),
    stylist: safeJsonParse(savedMsg.stylist)
  };
}

// --- CONVERSATIONAL CHATBOT SYSTEM ---
const chatbotSessions = new Map();

async function sendWhatsAppReply(db, recipientPhone, text) {
  try {
    const settings = await db.all("SELECT * FROM settings");
    const settingsObj = {};
    for (const r of settings) {
      settingsObj[r.key] = r.value;
    }

    const token = settingsObj.whatsapp_access_token;
    const phoneId = settingsObj.whatsapp_phone_number_id;

    if (!token || !phoneId) {
      console.log("No WhatsApp credentials configured. Skipping outbound response.");
      return;
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "text",
        text: { body: text }
      })
    });
    if (!res.ok) {
      console.error("Meta API responded with error:", await res.text());
    } else {
      console.log(`Dispatched WhatsApp reply to ${recipientPhone}`);
    }
  } catch (err) {
    console.error("Error sending WhatsApp reply:", err);
  }
}

async function sendInstagramReply(db, recipientId, text) {
  try {
    const settings = await db.all("SELECT * FROM settings");
    const settingsObj = {};
    for (const r of settings) {
      settingsObj[r.key] = r.value;
    }

    const token = settingsObj.instagram_access_token;
    const pageId = settingsObj.instagram_page_id;

    if (!token || !pageId) {
      console.log("No Instagram credentials configured. Skipping outbound response.");
      return;
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/me/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: { text: text }
      })
    });
    if (!res.ok) {
      console.error("Meta Instagram API responded with error:", await res.text());
    } else {
      console.log(`Dispatched Instagram reply to ${recipientId}`);
    }
  } catch (err) {
    console.error("Error sending Instagram reply:", err);
  }
}

async function handleChatbotFlow(db, { phone, text, channel, clientName, id }) {
  let isComplete = false;
  let bookingData = null;
  let appointment = null;
  let replyText = "";
  try {
    const cleanPhone = phone.trim();

    // Check if Gemini API key is configured
    const apiKeySetting = await db.get("SELECT value FROM settings WHERE key = 'gemini_api_key'");
    const apiKey = apiKeySetting?.value || process.env.GEMINI_API_KEY || '';
    const hasGeminiKey = apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY';

    if (hasGeminiKey) {
      // --- GEMINI AI FLOW ---
      const isReset = /^(hi|hello|restart|reset|start over|hey|restart booking session)$/i.test(text.trim());
      if (isReset) {
        resetConversation(cleanPhone, channel);
        await db.run(
          "UPDATE wa_messages SET status = 'pending' WHERE phone = ? AND channel = ? AND sender = 'client'",
          [cleanPhone, channel]
        );
      }

      // Call Gemini chatbot logic
      const aiResult = await getAIResponse({
        apiKey,
        phone: cleanPhone,
        userMessage: text,
        channel,
        branchId: 1 // default branch
      });

      // Save AI response to DB
      const botMsgId = 'bot-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const today = new Date().toISOString().split('T')[0];

      await db.run(
        `INSERT INTO wa_messages (id, sender, text, time, channel, status, clientName, phone, branchId, date)
         VALUES (?, 'system', ?, ?, ?, 'dispatched', ?, ?, 1, ?)`,
        [botMsgId, aiResult.message, timestamp, channel, 'SalonSync AI', cleanPhone, today]
      );

      // Dispatch real Meta replies if credentials configured
      if (channel === 'whatsapp') {
        await sendWhatsAppReply(db, cleanPhone, aiResult.message);
      } else if (channel === 'instagram') {
        await sendInstagramReply(db, cleanPhone, aiResult.message);
      }

      // If booking is complete, auto-create appointment!
      let createdAppt = null;
      if (aiResult.isComplete && aiResult.bookingData) {
        const bd = aiResult.bookingData;

        // Find or create customer
        let customer = await db.get('SELECT * FROM customers WHERE phone = ?', [cleanPhone]);
        if (!customer) {
          const r = await db.run(
            'INSERT INTO customers (name, phone, preferredBranch) VALUES (?, ?, 1)',
            [bd.client_name || clientName || 'Guest', cleanPhone]
          );
          customer = { id: r.lastID, name: bd.client_name || clientName || 'Guest' };
        }

        // Create the appointment
        const apptResult = await db.run(
          `INSERT INTO appointments (customerId, customerName, staffId, staffName, serviceId, serviceName, branchId, date, time, status, source, amount)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, 'confirmed', ?, ?)`,
          [
            customer.id,
            bd.client_name || clientName || 'Guest',
            bd.staff_id || 0,
            bd.staff_name || 'Stylist',
            bd.service_id || 0,
            bd.service_name || 'Service',
            today,
            bd.time || '14:00',
            channel,
            bd.service_price || 0
          ]
        );
        createdAppt = await db.get("SELECT * FROM appointments WHERE id = ?", [apptResult.lastID]);

        // Mark all client messages for this phone as approved
        await db.run(
          "UPDATE wa_messages SET status = 'approved', service = ?, stylist = ?, timeSlot = ? WHERE phone = ? AND sender = 'client'",
          [
            JSON.stringify({ id: bd.service_id, name: bd.service_name, price: bd.service_price }),
            JSON.stringify({ id: bd.staff_id, name: bd.staff_name }),
            bd.time,
            cleanPhone
          ]
        );

        // Add notification
        await db.run(
          `INSERT INTO notifications (id, customerName, phone, message, type, timestamp, status, unread)
           VALUES (?, ?, ?, ?, ?, ?, 'Delivered', 1)`,
          [
            'notif-ai-' + Date.now(),
            bd.client_name || clientName || 'Guest',
            cleanPhone,
            `✅ AI Booking: ${bd.service_name} with ${bd.staff_name} at ${bd.time} — Confirmed by Gemini AI`,
            channel === 'whatsapp' ? 'WhatsApp' : channel === 'instagram' ? 'Instagram' : 'Voice',
            timestamp
          ]
        );

        // Log to Discord
        const discordMsg = `🤖 **Gemini AI Booking Confirmed!**\n\n` +
          `👤 **Client**: ${bd.client_name} (${cleanPhone})\n` +
          `💇 **Service**: ${bd.service_name} (₹${bd.service_price})\n` +
          `💆 **Stylist**: ${bd.staff_name}\n` +
          `⏰ **Time**: ${bd.time} today\n` +
          `📱 **Channel**: ${channel.toUpperCase()}\n` +
          `🧠 **Powered by**: Gemini 2.0 Flash`;
        await sendDiscordNotification(db, discordMsg, '🤖 Gemini AI Booking', 0x9333ea);
      }

      return {
        isComplete: aiResult.isComplete,
        bookingData: aiResult.bookingData,
        appointment: createdAppt,
        replyText: aiResult.message
      };
    }

    // --- RULE-BASED STATE MACHINE FALLBACK ---
    const services = await db.all("SELECT * FROM services");
    const staff = await db.all("SELECT * FROM staff");
    
    if (text.trim().toLowerCase() === 'restart booking session' || text.trim().toLowerCase() === 'restart') {
      chatbotSessions.delete(cleanPhone);
    }

    let session = chatbotSessions.get(cleanPhone);
    let replyText = "";

    if (!session) {
      session = { state: 1, service: null, stylist: null, time: null, clientName: clientName || 'Guest' };
      chatbotSessions.set(cleanPhone, session);
      replyText = `Welcome to SalonSync Luxury Booking! 🌸 Please select a treatment category:\n\n` +
                  `1. Hair Care\n2. Coloring\n3. Skincare\n4. Nails\n5. Makeup\n\n` +
                  `Reply with the category number (e.g., 1 or 2) or type the name.`;
    } else if (session.state === 1) {
      const input = text.trim().toLowerCase();
      let category = 'Hair';
      if (input === '2' || input.includes('color')) category = 'Color';
      else if (input === '3' || input.includes('skin')) category = 'Skin';
      else if (input === '4' || input.includes('nail')) category = 'Nails';
      else if (input === '5' || input.includes('make') || input.includes('makeup')) category = 'Makeup';
      else category = 'Hair';

      const filteredServices = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
      session.category = category;
      session.filteredServices = filteredServices;
      session.state = 2;
      chatbotSessions.set(cleanPhone, session);

      replyText = `Great! You selected ${category} Care. Select a service:\n\n` +
                  filteredServices.map((s, idx) => `${idx + 1}. ${s.name} (₹${s.price})`).join('\n') +
                  `\n\nReply with the service number or click one.`;
    } else if (session.state === 2) {
      const input = text.trim().toLowerCase();
      const idx = parseInt(text.trim(), 10) - 1;
      let selectedService;
      if (!isNaN(idx) && session.filteredServices?.[idx]) {
        selectedService = session.filteredServices[idx];
      } else {
        selectedService = session.filteredServices?.find(s => 
          input.includes(s.name.toLowerCase()) || 
          s.name.toLowerCase().includes(input)
        ) || session.filteredServices?.[0] || services[0];
      }
      session.service = selectedService;
      
      const filteredStaff = staff.filter(s => s.branchId === 1); 
      session.filteredStaff = filteredStaff;
      session.state = 3;
      chatbotSessions.set(cleanPhone, session);

      replyText = `You selected ${selectedService.name}. Choose your preferred stylist:\n\n` +
                  filteredStaff.map((s, idx) => `${idx + 1}. ${s.name} (${s.role})`).join('\n') +
                  `\n\nReply with the stylist number or click one.`;
    } else if (session.state === 3) {
      const input = text.trim().toLowerCase();
      const idx = parseInt(text.trim(), 10) - 1;
      let selectedStaff;
      if (!isNaN(idx) && session.filteredStaff?.[idx]) {
        selectedStaff = session.filteredStaff[idx];
      } else {
        selectedStaff = session.filteredStaff?.find(s => 
          input.includes(s.name.toLowerCase()) || 
          s.name.toLowerCase().includes(input)
        ) || session.filteredStaff?.[0] || staff[0];
      }
      session.stylist = selectedStaff;
      
      session.timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '18:30'];
      session.state = 4;
      chatbotSessions.set(cleanPhone, session);

      replyText = `Stylist ${selectedStaff.name} selected. Choose a timing slot today:\n\n` +
                  session.timeSlots.map((t, idx) => `${idx + 1}. ${t}`).join('\n') +
                  `\n\nReply with the slot number or click one.`;
    } else if (session.state === 4) {
      const input = text.trim();
      const idx = parseInt(input, 10) - 1;
      let selectedTime;
      if (!isNaN(idx) && session.timeSlots?.[idx]) {
        selectedTime = session.timeSlots[idx];
      } else {
        selectedTime = session.timeSlots?.find(t => t === input || t.includes(input)) || '14:30';
      }
      session.time = selectedTime;
      
      session.state = 5;
      chatbotSessions.set(cleanPhone, session);

      replyText = `Timing slot ${selectedTime} chosen. Finally, please reply with your Full Name to confirm your booking.`;
    } else if (session.state === 5) {
      let clientNameInput = text.trim();
      if (clientNameInput.toLowerCase().startsWith('confirm name as ')) {
        clientNameInput = clientNameInput.substring(16).trim();
      }
      session.clientName = clientNameInput;

      let customer = await db.get("SELECT * FROM customers WHERE phone = ?", [cleanPhone]);
      if (!customer) {
        const result = await db.run(
          "INSERT INTO customers (name, phone, preferredBranch) VALUES (?, ?, 1)",
          [clientNameInput, cleanPhone]
        );
        customer = { id: result.lastID, name: clientNameInput, phone: cleanPhone };
      }

      const apptResult = await db.run(
        `INSERT INTO appointments (
          customerId, customerName, staffId, staffName, serviceId, serviceName, branchId, date, time, status, source, amount
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, 'confirmed', ?, ?)`,
        [
          customer.id,
          clientNameInput,
          session.stylist.id,
          session.stylist.name,
          session.service.id,
          session.service.name,
          new Date().toISOString().split('T')[0],
          session.time,
          channel,
          session.service.price
        ]
      );

      const createdAppt = await db.get("SELECT * FROM appointments WHERE id = ?", [apptResult.lastID]);
      appointment = createdAppt;
      bookingData = {
        client_name: clientNameInput,
        staff_id: session.stylist.id,
        staff_name: session.stylist.name,
        service_id: session.service.id,
        service_name: session.service.name,
        time: session.time,
        service_price: session.service.price
      };
      isComplete = true;

      const notifId = 'notif-' + Date.now();
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      await db.run(
        "INSERT INTO notifications (id, customerName, phone, message, type, timestamp, status, unread) VALUES (?, ?, ?, ?, ?, ?, 'Delivered', 1)",
        [
          notifId,
          clientNameInput,
          cleanPhone,
          `Appointment confirmed for ${session.service.name} with ${session.stylist.name} today at ${session.time}.`,
          channel === 'whatsapp' ? 'WhatsApp' : 'Instagram',
          timestamp
        ]
      );

      const discordMsg = `📅 **AI Booking Chatbot Confirmed!**\n\n` + 
                         `👤 **Client**: ${clientNameInput} (${cleanPhone})\n` +
                         `💇 **Service**: ${session.service.name} (₹${session.service.price})\n` +
                         `💇 **Stylist**: ${session.stylist.name}\n` +
                         `⏰ **Timing**: ${session.time} today\n` +
                         `📍 **Branch**: SalonSync Banjara Hills\n` +
                         `🤖 **Channel**: ${channel.toUpperCase()}`;
      await sendDiscordNotification(db, discordMsg, "AI Chatbot Booking", 0x2ecc71);

      replyText = `🎉 **Booking Confirmed!**\n\nWe look forward to seeing you, ${clientNameInput}, today at ${session.time} for a ${session.service.name}.\n\nYour SalonSync Booking ID is #${apptResult.lastID}. Thank you!`;
      chatbotSessions.delete(cleanPhone);

      // Mark all pending client messages for this phone as 'approved'
      await db.run(
        "UPDATE wa_messages SET status = 'approved' WHERE phone = ? AND sender = 'client' AND status = 'pending'",
        [cleanPhone]
      );
    }

    const botMsgId = 'bot-' + Date.now();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    await db.run(
      `INSERT INTO wa_messages (
        id, sender, text, time, channel, status, clientName, phone, service, stylist, date, timeSlot, branchId
      ) VALUES (?, 'system', ?, ?, ?, 'dispatched', ?, ?, ?, ?, ?, ?, 1)`,
      [
        botMsgId,
        replyText,
        timestamp,
        channel,
        session?.clientName || 'Guest',
        cleanPhone,
        session?.service ? JSON.stringify(session.service) : null,
        session?.stylist ? JSON.stringify(session.stylist) : null,
        new Date().toISOString().split('T')[0],
        session?.time || null
      ]
    );

    if (channel === 'whatsapp') {
      await sendWhatsAppReply(db, cleanPhone, replyText);
    } else if (channel === 'instagram') {
      await sendInstagramReply(db, cleanPhone, replyText);
    }

  } catch (err) {
    console.error("Error in handleChatbotFlow:", err);
  }

  return {
    isComplete,
    bookingData,
    appointment,
    replyText
  };
}

async function notifyDiscordAppointmentUpdate(db, oldAppt, updatedAppt) {
  try {
    if (!updatedAppt) return;
    const branchInfo = await db.get('SELECT name FROM branches WHERE id = ?', [updatedAppt.branchId]);
    const branchName = branchInfo ? branchInfo.name : 'SalonSync';

    if (oldAppt.status !== updatedAppt.status) {
      let discordMsg = '';
      let title = '';
      let color = 0x3498DB; 

      if (updatedAppt.status === 'completed' || updatedAppt.status === 'billed') {
        title = updatedAppt.status === 'billed' ? "Checkout Billed & Completed" : "Checkout Completed";
        color = 0x2ECC71; 
        discordMsg = `✅ **Appointment Checked Out & Billed!**\n\n` + 
                     `👤 **Client**: ${updatedAppt.customerName}\n` +
                     `💇 **Service**: ${updatedAppt.serviceName} (₹${updatedAppt.amount})\n` +
                     `💇 **Stylist**: ${updatedAppt.staffName}\n` +
                     `⏰ **Schedule**: ${updatedAppt.time} on ${updatedAppt.date}\n` +
                     `📍 **Branch**: ${branchName}\n` +
                     `💰 **Billing Total**: ₹${updatedAppt.amount} (Earned +${Math.round(updatedAppt.amount * 0.1)} Loyalty Points)`;
      } else if (updatedAppt.status === 'confirmed') {
        title = "Booking Confirmed";
        color = 0x3498DB; 
        discordMsg = `📅 **Appointment Confirmed!**\n\n` + 
                     `👤 **Client**: ${updatedAppt.customerName}\n` +
                     `💇 **Service**: ${updatedAppt.serviceName} (₹${updatedAppt.amount})\n` +
                     `💇 **Stylist**: ${updatedAppt.staffName}\n` +
                     `⏰ **Schedule**: ${updatedAppt.time} on ${updatedAppt.date}\n` +
                     `📍 **Branch**: ${branchName}`;
      } else if (updatedAppt.status === 'inprogress') {
        title = "Service In Progress";
        color = 0xE67E22; 
        discordMsg = `💇 **Service has Started!**\n\n` + 
                     `👤 **Client**: ${updatedAppt.customerName}\n` +
                     `💇 **Service**: ${updatedAppt.serviceName}\n` +
                     `💇 **Stylist**: ${updatedAppt.staffName}\n` +
                     `⏰ **Time**: ${updatedAppt.time}\n` +
                     `📍 **Branch**: ${branchName}\n` +
                     `*Status: In Progress*`;
      } else if (updatedAppt.status === 'cancelled') {
        title = "Booking Cancelled";
        color = 0xE74C3C; 
        discordMsg = `❌ **Appointment Cancelled**\n\n` + 
                     `👤 **Client**: ${updatedAppt.customerName}\n` +
                     `💇 **Service**: ${updatedAppt.serviceName}\n` +
                     `💇 **Stylist**: ${updatedAppt.staffName}\n` +
                     `⏰ **Schedule**: ${updatedAppt.time} on ${updatedAppt.date}\n` +
                     `📍 **Branch**: ${branchName}`;
      }

      if (discordMsg) {
        await sendDiscordNotification(db, discordMsg, title, color);
      }
    }
  } catch (err) {
    console.error("Failed to send Discord appointment update:", err);
  }
}

// --- BRANCHES ENDPOINTS ---
app.get('/api/branches', async (req, res) => {
  try {
    const branches = await db.all('SELECT * FROM branches');
    res.json(branches);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- SERVICES ENDPOINTS ---
app.get('/api/services', async (req, res) => {
  try {
    const services = await db.all('SELECT * FROM services');
    res.json(services);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- STAFF ENDPOINTS ---
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await db.all('SELECT * FROM staff');
    res.json(staff);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/staff', async (req, res) => {
  const { name, role, branchId, commissionPct, phone } = req.body;
  if (!name || !role || !phone) {
    return res.status(400).json({ error: 'Name, role, and phone are required.' });
  }

  try {
    const result = await db.run(
      'INSERT INTO staff (name, role, branchId, commissionPct, phone) VALUES (?, ?, ?, ?, ?)',
      [name, role, parseInt(branchId, 10), parseInt(commissionPct, 10) || 10, phone]
    );
    const newStaff = await db.get('SELECT * FROM staff WHERE id = ?', [result.lastID]);
    res.status(201).json(newStaff);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- CUSTOMERS ENDPOINTS ---
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await db.all('SELECT * FROM customers');
    res.json(customers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/customers', async (req, res) => {
  const { name, phone, email, loyaltyPoints, totalVisits, preferredBranch, membershipId } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone are required.' });
  }

  try {
    // Check if customer already exists by phone
    const existing = await db.get('SELECT * FROM customers WHERE phone = ?', [phone.trim()]);
    if (existing) {
      return res.status(200).json(existing); // Return existing instead of erroring
    }

    const result = await db.run(
      'INSERT INTO customers (name, phone, email, loyaltyPoints, totalVisits, preferredBranch, membershipId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        phone.trim(),
        email || null,
        parseInt(loyaltyPoints, 10) || 0,
        parseInt(totalVisits, 10) || 0,
        parseInt(preferredBranch, 10) || 1,
        membershipId ? parseInt(membershipId, 10) : null
      ]
    );
    const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
    res.status(201).json(newCustomer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/customers/:id/membership', async (req, res) => {
  const { id } = req.params;
  const { membershipId } = req.body;

  try {
    await db.run(
      'UPDATE customers SET membershipId = ? WHERE id = ?',
      [membershipId ? parseInt(membershipId, 10) : null, parseInt(id, 10)]
    );
    const updated = await db.get('SELECT * FROM customers WHERE id = ?', [parseInt(id, 10)]);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/customers/:id/redeem', async (req, res) => {
  const { id } = req.params;
  const { pointsToRedeem } = req.body;

  if (pointsToRedeem === undefined) {
    return res.status(400).json({ error: 'pointsToRedeem is required.' });
  }

  try {
    const cust = await db.get('SELECT loyaltyPoints FROM customers WHERE id = ?', [parseInt(id, 10)]);
    if (!cust) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const newPoints = Math.max(0, cust.loyaltyPoints - parseInt(pointsToRedeem, 10));
    await db.run('UPDATE customers SET loyaltyPoints = ? WHERE id = ?', [newPoints, parseInt(id, 10)]);
    const updated = await db.get('SELECT * FROM customers WHERE id = ?', [parseInt(id, 10)]);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- APPOINTMENTS ENDPOINTS ---
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await db.all('SELECT * FROM appointments');
    res.json(appointments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { customerId, customerName, staffId, staffName, serviceId, serviceName, branchId, date, time, status, source, amount } = req.body;
  
  if (!customerName || !staffId || !serviceId || !date || !time || amount === undefined) {
    return res.status(400).json({ error: 'Missing required appointment details.' });
  }

  try {
    const result = await db.run(
      `INSERT INTO appointments (
        customerId, customerName, staffId, staffName, serviceId, serviceName, branchId, date, time, status, source, amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(customerId, 10) || 0,
        customerName,
        parseInt(staffId, 10),
        staffName,
        parseInt(serviceId, 10),
        serviceName,
        parseInt(branchId, 10) || 1,
        date,
        time,
        status || 'pending',
        source || 'walkin',
        parseFloat(amount)
      ]
    );

    const newAppt = await db.get('SELECT * FROM appointments WHERE id = ?', [result.lastID]);

    // Handle completed customer visit and points updates directly in backend!
    if (status === 'completed' && customerId > 0) {
      const earnedPoints = Math.round(parseFloat(amount) * 0.1);
      await db.run(
        'UPDATE customers SET totalVisits = totalVisits + 1, loyaltyPoints = loyaltyPoints + ? WHERE id = ?',
        [earnedPoints, parseInt(customerId, 10)]
      );
    }

    // Dispatch Discord Webhook Notification
    try {
      const branchInfo = await db.get('SELECT name FROM branches WHERE id = ?', [parseInt(branchId, 10) || 1]);
      const branchName = branchInfo ? branchInfo.name : 'SalonSync';
      const discordMsg = `📅 **New Appointment Booked!**\n\n` + 
                       `👤 **Client**: ${customerName} (ID: ${customerId || 'N/A'})\n` +
                       `💇 **Service**: ${serviceName} (₹${amount})\n` +
                       `💇 **Stylist**: ${staffName}\n` +
                       `⏰ **Schedule**: ${time} on ${date}\n` +
                       `📍 **Branch**: ${branchName}\n` +
                       `🔗 **Booking Source**: \`${source || 'walkin'}\`\n` +
                       `*Status: ${status || 'pending'}*`;
      await sendDiscordNotification(db, discordMsg, "New Booking Registered", 0x8A2BE2);
    } catch (err) {
      console.error("Discord notification error:", err);
    }

    res.status(201).json(newAppt);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    const oldAppt = await db.get('SELECT * FROM appointments WHERE id = ?', [parseInt(id, 10)]);
    if (!oldAppt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    await db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, parseInt(id, 10)]);
    const updatedAppt = await db.get('SELECT * FROM appointments WHERE id = ?', [parseInt(id, 10)]);

    // Trigger loyalty updates on completion transitions
    if (oldAppt.status !== 'completed' && oldAppt.status !== 'billed' && (status === 'completed' || status === 'billed') && oldAppt.customerId > 0) {
      const earnedPoints = Math.round(oldAppt.amount * 0.1);
      await db.run(
        'UPDATE customers SET totalVisits = totalVisits + 1, loyaltyPoints = loyaltyPoints + ? WHERE id = ?',
        [earnedPoints, oldAppt.customerId]
      );
    }

    // Send Discord update notification
    await notifyDiscordAppointmentUpdate(db, oldAppt, updatedAppt);

    res.json(updatedAppt);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { status, amount, staffId, staffName, date, time, customerId, customerName, serviceId, serviceName } = req.body;

  try {
    const oldAppt = await db.get('SELECT * FROM appointments WHERE id = ?', [parseInt(id, 10)]);
    if (!oldAppt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const fields = [];
    const values = [];

    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    if (amount !== undefined) {
      fields.push('amount = ?');
      values.push(parseFloat(amount));
    }
    if (staffId !== undefined) {
      fields.push('staffId = ?');
      values.push(parseInt(staffId, 10));
    }
    if (staffName !== undefined) {
      fields.push('staffName = ?');
      values.push(staffName);
    }
    if (date !== undefined) {
      fields.push('date = ?');
      values.push(date);
    }
    if (time !== undefined) {
      fields.push('time = ?');
      values.push(time);
    }
    if (customerId !== undefined) {
      fields.push('customerId = ?');
      values.push(parseInt(customerId, 10) || 0);
    }
    if (customerName !== undefined) {
      fields.push('customerName = ?');
      values.push(customerName);
    }
    if (serviceId !== undefined) {
      fields.push('serviceId = ?');
      values.push(parseInt(serviceId, 10) || 0);
    }
    if (serviceName !== undefined) {
      fields.push('serviceName = ?');
      values.push(serviceName);
    }

    if (fields.length > 0) {
      values.push(parseInt(id, 10));
      await db.run(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    const updatedAppt = await db.get('SELECT * FROM appointments WHERE id = ?', [parseInt(id, 10)]);

    // Trigger loyalty updates on completion transitions
    if (oldAppt.status !== 'completed' && oldAppt.status !== 'billed' && (status === 'completed' || status === 'billed') && oldAppt.customerId > 0) {
      const finalAmount = amount !== undefined ? parseFloat(amount) : oldAppt.amount;
      const earnedPoints = Math.round(finalAmount * 0.1);
      await db.run(
        'UPDATE customers SET totalVisits = totalVisits + 1, loyaltyPoints = loyaltyPoints + ? WHERE id = ?',
        [earnedPoints, oldAppt.customerId]
      );
    }

    // Send Discord update notification
    await notifyDiscordAppointmentUpdate(db, oldAppt, updatedAppt);

    res.json(updatedAppt);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- INVENTORY ENDPOINTS ---
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await db.all('SELECT * FROM inventory');
    res.json(inventory);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  const { name, category, branchId, quantity, minStock, unit, price } = req.body;
  if (!name || quantity === undefined || minStock === undefined || price === undefined) {
    return res.status(400).json({ error: 'Name, quantity, minStock, and price are required.' });
  }

  try {
    const result = await db.run(
      'INSERT INTO inventory (name, category, branchId, quantity, minStock, unit, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        category || 'Supplies',
        parseInt(branchId, 10) || 1,
        parseInt(quantity, 10) || 0,
        parseInt(minStock, 10) || 5,
        unit || 'pieces',
        parseFloat(price) || 0
      ]
    );
    const newItem = await db.get('SELECT * FROM inventory WHERE id = ?', [result.lastID]);
    res.status(201).json(newItem);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, minStock, unit, price } = req.body;

  try {
    const oldItem = await db.get('SELECT * FROM inventory WHERE id = ?', [parseInt(id, 10)]);
    if (!oldItem) {
      return res.status(404).json({ error: 'Inventory item not found.' });
    }

    await db.run(
      `UPDATE inventory SET 
        name = ?, category = ?, quantity = ?, minStock = ?, unit = ?, price = ?
      WHERE id = ?`,
      [
        name !== undefined ? name : oldItem.name,
        category !== undefined ? category : oldItem.category,
        quantity !== undefined ? parseInt(quantity, 10) : oldItem.quantity,
        minStock !== undefined ? parseInt(minStock, 10) : oldItem.minStock,
        unit !== undefined ? unit : oldItem.unit,
        price !== undefined ? parseFloat(price) : oldItem.price,
        parseInt(id, 10)
      ]
    );

    const updatedItem = await db.get('SELECT * FROM inventory WHERE id = ?', [parseInt(id, 10)]);
    res.json(updatedItem);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/inventory/:id/quantity', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) {
    return res.status(400).json({ error: 'Quantity is required.' });
  }

  try {
    await db.run('UPDATE inventory SET quantity = ? WHERE id = ?', [Math.max(0, parseInt(quantity, 10)), parseInt(id, 10)]);
    const updated = await db.get('SELECT * FROM inventory WHERE id = ?', [parseInt(id, 10)]);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- WEBHOOK / WA-MESSAGES ENDPOINTS ---
app.get('/api/wa-messages', async (req, res) => {
  try {
    const messages = await db.all('SELECT * FROM wa_messages');
    
    // Parse nested service & stylist JSON fields
    const parsed = messages.map(m => ({
      ...m,
      service: safeJsonParse(m.service),
      stylist: safeJsonParse(m.stylist)
    }));
    
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/wa-messages', async (req, res) => {
  const { id, sender, text, time, channel, status, clientName, phone, service, stylist, date, timeSlot, branchId } = req.body;
  if (!id || !sender || !text) {
    return res.status(400).json({ error: 'ID, sender, and text are required.' });
  }

  try {
    await db.run(
      `INSERT INTO wa_messages (
        id, sender, text, time, channel, status, clientName, phone, service, stylist, date, timeSlot, branchId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sender,
        text,
        time,
        channel || 'whatsapp',
        status || 'pending',
        clientName || null,
        phone || null,
        service ? JSON.stringify(service) : null,
        stylist ? JSON.stringify(stylist) : null,
        date || null,
        timeSlot || null,
        branchId ? parseInt(branchId, 10) : null
      ]
    );

    const inserted = await db.get('SELECT * FROM wa_messages WHERE id = ?', [id]);
    res.status(201).json({
      ...inserted,
      service: safeJsonParse(inserted.service),
      stylist: safeJsonParse(inserted.stylist)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/wa-messages/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    await db.run('UPDATE wa_messages SET status = ? WHERE id = ?', [status, id]);
    const updated = await db.get('SELECT * FROM wa_messages WHERE id = ?', [id]);
    res.json({
      ...updated,
      service: safeJsonParse(updated.service),
      stylist: safeJsonParse(updated.stylist)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- CHATBOT SESSION ENDPOINTS ---
app.get('/api/chatbot-session/:phone', async (req, res) => {
  const cleanPhone = req.params.phone.trim();
  const session = chatbotSessions.get(cleanPhone);
  if (!session) {
    return res.json({ state: 0 });
  }
  res.json({
    state: session.state,
    category: session.category || null,
    service: session.service || null,
    stylist: session.stylist || null,
    time: session.time || null,
    clientName: session.clientName || 'Guest'
  });
});

app.post('/api/chatbot-session/:phone/reset', async (req, res) => {
  const cleanPhone = req.params.phone.trim();
  chatbotSessions.delete(cleanPhone);
  res.json({ success: true });
});

app.get('/api/chatbot-sessions', async (req, res) => {
  const sessions = [];
  for (const [phone, session] of chatbotSessions.entries()) {
    sessions.push({
      phone,
      state: session.state,
      category: session.category || null,
      service: session.service || null,
      stylist: session.stylist || null,
      time: session.time || null,
      clientName: session.clientName || 'Guest'
    });
  }
  res.json(sessions);
});

// --- NOTIFICATIONS ENDPOINTS ---
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await db.all('SELECT * FROM notifications ORDER BY rowid DESC LIMIT 50');
    // Map integer unread column back to boolean
    const mapped = notifications.map(n => ({
      ...n,
      unread: n.unread === 1
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  const { id, customerName, phone, message, type, timestamp, status, unread } = req.body;
  if (!customerName || !phone || !message) {
    return res.status(400).json({ error: 'Customer name, phone, and message are required.' });
  }

  const notifId = id || 'notif-' + Date.now();
  const rawUnread = unread === false ? 0 : 1;

  try {
    await db.run(
      'INSERT INTO notifications (id, customerName, phone, message, type, timestamp, status, unread) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        notifId,
        customerName,
        phone,
        message,
        type || 'WhatsApp',
        timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        status || 'Delivered',
        rawUnread
      ]
    );

    const inserted = await db.get('SELECT * FROM notifications WHERE id = ?', [notifId]);
    res.status(201).json({
      ...inserted,
      unread: inserted.unread === 1
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/notifications/read', async (req, res) => {
  try {
    await db.run('UPDATE notifications SET unread = 0');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- SYSTEM SETTINGS ENDPOINTS ---
app.get('/api/settings', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM settings');
    const settingsObj = {};
    for (const r of rows) {
      settingsObj[r.key] = r.value;
    }
    res.json(settingsObj);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const settingsObj = req.body;
  try {
    for (const [key, value] of Object.entries(settingsObj)) {
      await db.run(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        [key, String(value !== null && value !== undefined ? value : '')]
      );
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/settings/test-discord', async (req, res) => {
  const { discord_webhook_url } = req.body;
  try {
    const testUrl = discord_webhook_url;
    if (!testUrl || !testUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Valid Webhook URL is required.' });
    }
    const payload = {
      embeds: [
        {
          title: "🔗 SalonSync Integration Test",
          description: "Hello! This is a test notification from SalonSync. Your Discord webhook integration is active and working beautifully! 🎉",
          color: 0x5865F2,
          timestamp: new Date().toISOString(),
          footer: {
            text: "SalonSync Omnichannel Gateway"
          }
        }
      ]
    };
    const discordRes = await fetch(testUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!discordRes.ok) {
      return res.status(400).json({ error: `Discord responded with status ${discordRes.status}: ${await discordRes.text()}` });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- META WEBHOOK VERIFICATION ENDPOINTS ---
app.get('/api/webhooks/whatsapp', async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyTokenSetting = await db.get("SELECT value FROM settings WHERE key = 'whatsapp_verify_token'");
  const expectedToken = verifyTokenSetting?.value || 'salonsync_verify_token';

  if (mode && token) {
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('WHATSAPP_WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

app.get('/api/webhooks/instagram', async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyTokenSetting = await db.get("SELECT value FROM settings WHERE key = 'whatsapp_verify_token'");
  const expectedToken = verifyTokenSetting?.value || 'salonsync_verify_token';

  if (mode && token) {
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('INSTAGRAM_WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

// --- REAL WEBHOOK ENDPOINTS ---
app.post('/api/webhooks/whatsapp', async (req, res) => {
  try {
    const payload = req.body;
    await db.run('INSERT INTO webhook_logs (payload) VALUES (?)', [JSON.stringify(payload, null, 2)]);

    let clientName = 'WhatsApp Guest';
    let phone = '9888877777';
    let text = '';
    let msgId = 'wamid.' + Math.random().toString(36).substring(2, 15);
    let date = new Date().toISOString().split('T')[0];
    let branchId = 1;
    // Use channel from payload if provided (allows simulator to tag correctly)
    let channel = payload.channel || 'whatsapp';

    if (payload.object === 'whatsapp_business_account' && payload.entry?.[0]?.changes?.[0]?.value) {
      const value = payload.entry[0].changes[0].value;
      const contact = value.changes[0].value.contacts?.[0];
      const message = value.changes[0].value.messages?.[0];
      
      clientName = contact?.profile?.name || 'WhatsApp Guest';
      phone = contact?.wa_id || message?.from || '9888877777';
      text = message?.text?.body || '';
      msgId = message?.id || msgId;
      channel = 'whatsapp';
    } else {
      clientName = payload.clientName || payload.sender || clientName;
      phone = payload.phone || phone;
      text = payload.text || '';
      msgId = payload.id || msgId;
      date = payload.date || date;
      branchId = parseInt(payload.branchId, 10) || 1;
    }

    if (!text) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const savedMsg = await parseAndSaveWebhook(db, {
      id: msgId,
      sender: 'client',
      text,
      channel,
      clientName,
      phone,
      branchId,
      date
    });

    res.status(200).json({ success: true, message: savedMsg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/webhooks/instagram', async (req, res) => {
  try {
    const payload = req.body;
    await db.run('INSERT INTO webhook_logs (payload) VALUES (?)', [JSON.stringify(payload, null, 2)]);

    let clientName = 'Instagram Guest';
    let phone = '9888877777';
    let text = '';
    let msgId = 'igmid.' + Math.random().toString(36).substring(2, 15);
    let date = new Date().toISOString().split('T')[0];
    let branchId = 1;

    if (payload.object === 'instagram_business_account' && payload.entry?.[0]?.changes?.[0]?.value) {
      const value = payload.entry[0].changes[0].value;
      text = value.message?.text || '';
      msgId = value.message?.id || msgId;
      clientName = value.contacts?.[0]?.profile?.name || 'Instagram User';
      phone = value.sender?.id || '9888877777';
    } else {
      clientName = payload.clientName || clientName;
      phone = payload.phone || phone;
      text = payload.text || '';
      msgId = payload.id || msgId;
      date = payload.date || date;
      branchId = parseInt(payload.branchId, 10) || 1;
    }

    if (!text) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const savedMsg = await parseAndSaveWebhook(db, {
      id: msgId,
      sender: 'client',
      text,
      channel: 'instagram',
      clientName,
      phone,
      branchId,
      date
    });

    res.status(200).json({ success: true, message: savedMsg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/webhooks/voice', async (req, res) => {
  try {
    const payload = req.body;
    await db.run('INSERT INTO webhook_logs (payload) VALUES (?)', [JSON.stringify(payload, null, 2)]);

    let clientName = 'Voice Caller';
    let phone = '9888877777';
    let text = '';
    let msgId = 'call_' + Math.random().toString(36).substring(2, 10);
    let date = new Date().toISOString().split('T')[0];
    let branchId = 1;

    if (payload.object === 'voice_ivr_session' && payload.entry?.[0]) {
      const session = payload.entry[0];
      phone = session.from || '9888877777';
      text = session.transcription || '';
      clientName = session.entities?.customer_name || 'Voice Guest';
      msgId = session.session_id || msgId;
    } else {
      clientName = payload.clientName || clientName;
      phone = payload.phone || phone;
      text = payload.text || '';
      msgId = payload.id || msgId;
      date = payload.date || date;
      branchId = parseInt(payload.branchId, 10) || 1;
    }

    if (!text) {
      return res.status(400).json({ error: 'Transcription text is required.' });
    }

    const savedMsg = await parseAndSaveWebhook(db, {
      id: msgId,
      sender: 'client',
      text,
      channel: 'voice',
      clientName,
      phone,
      branchId,
      date
    });

    res.status(200).json({ success: true, message: savedMsg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- WEBHOOK LOGS ENDPOINTS ---
app.get('/api/webhook-logs', async (req, res) => {
  try {
    const logs = await db.all('SELECT * FROM webhook_logs ORDER BY id DESC LIMIT 20');
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/webhook-logs', async (req, res) => {
  const { payload } = req.body;
  if (!payload) {
    return res.status(400).json({ error: 'Payload is required.' });
  }

  try {
    await db.run('INSERT INTO webhook_logs (payload) VALUES (?)', [payload]);
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- WIPE LOGS ENDPOINT ---
app.post('/api/wipe-logs', async (req, res) => {
  try {
    await db.run('DELETE FROM wa_messages');
    await db.run('DELETE FROM webhook_logs');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- GEMINI AI CHAT ENDPOINT ---
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { phone, message, channel = 'whatsapp', branchId = 1, clientName = 'Guest' } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'phone and message are required.' });
    }

    // Save the client message to DB first
    const clientMsgId = 'wa-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const today = new Date().toISOString().split('T')[0];

    await db.run(
      `INSERT OR IGNORE INTO wa_messages (id, sender, text, time, channel, status, clientName, phone, branchId, date)
       VALUES (?, 'client', ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [clientMsgId, message, timestamp, channel, clientName, phone, branchId, today]
    );

    // Call chatbot flow (handles Gemini OR State Machine fallback)
    const flowResult = await handleChatbotFlow(db, {
      phone,
      text: message,
      channel,
      clientName,
      id: clientMsgId
    });

    res.json({
      success: true,
      message: flowResult.replyText,
      isComplete: flowResult.isComplete,
      bookingData: flowResult.bookingData,
      appointment: flowResult.appointment,
      clientMsgId,
      botMsgId: 'bot-' + Date.now()
    });
  } catch (e) {
    console.error('AI chat endpoint error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai/reset', async (req, res) => {
  const { phone, channel = 'whatsapp' } = req.body;
  if (phone) {
    resetConversation(phone, channel);
    await db.run(
      "UPDATE wa_messages SET status = 'pending' WHERE phone = ? AND channel = ? AND sender = 'client'",
      [phone, channel]
    );
  }
  res.json({ success: true, activeSessions: getActiveSessionCount() });
});

app.get('/api/ai/status', async (req, res) => {
  const apiKeySetting = await db.get("SELECT value FROM settings WHERE key = 'gemini_api_key'");
  const hasKey = !!(apiKeySetting?.value && apiKeySetting.value.length > 10 && apiKeySetting.value !== 'YOUR_GEMINI_API_KEY');
  res.json({ configured: hasKey, activeSessions: getActiveSessionCount() });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running in dev mode on http://localhost:${PORT}`);
});
