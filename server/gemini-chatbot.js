/**
 * SalonSync AI Chatbot — Powered by Google Gemini 2.0 Flash
 * Uses REST API directly (no npm package needed)
 */

// Salon Data
const SALON_SERVICES = [
  { id: 1, name: "Haircut (Men)", price: 300, duration: 30, category: "Hair" },
  { id: 2, name: "Haircut (Women)", price: 600, duration: 60, category: "Hair" },
  { id: 3, name: "Hair Color", price: 1500, duration: 90, category: "Color" },
  { id: 4, name: "Facial", price: 800, duration: 60, category: "Skin" },
  { id: 5, name: "Manicure", price: 500, duration: 45, category: "Nails" },
  { id: 6, name: "Pedicure", price: 600, duration: 45, category: "Nails" },
  { id: 7, name: "Beard Trim", price: 150, duration: 20, category: "Hair" },
  { id: 8, name: "Waxing (Full Arms)", price: 400, duration: 30, category: "Skin" },
  { id: 9, name: "Hair Spa", price: 1200, duration: 75, category: "Hair" },
  { id: 10, name: "Bridal Makeup", price: 8000, duration: 180, category: "Makeup" }
];

const SALON_STAFF = [
  { id: 1, name: "Ravi Kumar", role: "Senior Stylist", branchId: 1 },
  { id: 2, name: "Priya Sharma", role: "Hair Colorist", branchId: 1 },
  { id: 3, name: "Vikram Malhotra", role: "Nail Artist", branchId: 1 },
  { id: 4, name: "Nisha Sen", role: "Skin Therapist", branchId: 1 },
  { id: 5, name: "Amit Trivedi", role: "Junior Stylist", branchId: 1 },
  { id: 6, name: "Anjali Reddy", role: "Makeup Artist", branchId: 2 },
  { id: 7, name: "Mohammed Irfan", role: "Stylist", branchId: 2 },
  { id: 8, name: "Rajesh Kulkarni", role: "Senior Stylist", branchId: 2 },
  { id: 9, name: "Divya Joshi", role: "Nail Care Expert", branchId: 2 },
  { id: 11, name: "Sunita Patel", role: "Nail Technician", branchId: 3 },
  { id: 12, name: "Deepak Nair", role: "Senior Stylist", branchId: 3 }
];

const BRANCHES = [
  { id: 1, name: "SalonSync Banjara Hills" },
  { id: 2, name: "SalonSync Jubilee Hills" },
  { id: 3, name: "SalonSync Gachibowli" }
];

// In-memory conversation history per phone+channel
const conversationHistory = new Map();

function buildSystemPrompt(branchId = 1) {
  const branchStaff = SALON_STAFF.filter(s => s.branchId === branchId);
  const branch = BRANCHES.find(b => b.id === branchId) || BRANCHES[0];
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `You are SalonSync's friendly AI booking assistant for ${branch.name}, Hyderabad. Today is ${today}.

AVAILABLE SERVICES:
${SALON_SERVICES.map(s => `• ${s.name} — ₹${s.price} (${s.duration} min) [ID:${s.id}]`).join('\n')}

AVAILABLE STYLISTS AT ${branch.name.toUpperCase()}:
${branchStaff.map(s => `• ${s.name} — ${s.role} [ID:${s.id}]`).join('\n')}

TIME SLOTS AVAILABLE: 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00, 18:30, 19:00, 19:30

YOUR TASK: Guide the customer through booking. Collect: (1) Service, (2) Stylist preference, (3) Time slot, (4) Customer name.

RULES:
- Be warm, brief, use emojis 🌸✨💅💇
- Suggest 2-3 options at a time, not all of them
- Keep each response under 100 words
- Once you have ALL FOUR (service + stylist + time + name), output this JSON block at the end:
  <BOOKING>{"service_id":N,"service_name":"...","service_price":N,"staff_id":N,"staff_name":"...","time":"HH:MM","client_name":"..."}</BOOKING>
- ONLY output <BOOKING> when you have confirmed ALL details
- If user says restart/reset/hello/hi — greet them fresh and start over`;
}

export async function getAIResponse({ apiKey, phone, userMessage, channel = 'whatsapp', branchId = 1 }) {
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return {
      success: false,
      message: '⚠️ Gemini API key not set. Please add your API key in Integration Settings → AI Configuration tab.',
      isComplete: false,
      bookingData: null
    };
  }

  const sessionKey = `${phone}::${channel}`;
  const isReset = /^(hi|hello|restart|reset|start over|hey)$/i.test(userMessage.trim());

  if (isReset || !conversationHistory.has(sessionKey)) {
    conversationHistory.set(sessionKey, []);
  }

  const history = conversationHistory.get(sessionKey);

  // Add user message to history
  history.push({ role: 'user', parts: [{ text: userMessage }] });

  const systemPrompt = buildSystemPrompt(branchId);

  const requestBody = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: history,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 400,
      topP: 0.95
    }
  };

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `HTTP ${response.status}`;
      
      if (response.status === 400 && errMsg.includes('API key')) {
        return {
          success: false,
          message: '❌ Invalid Gemini API key. Please update it in Integration Settings.',
          isComplete: false,
          bookingData: null
        };
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that. Please try again.';

    // Add assistant reply to history
    history.push({ role: 'model', parts: [{ text: rawText }] });
    conversationHistory.set(sessionKey, history);

    // Parse BOOKING block if present
    let bookingData = null;
    let isComplete = false;
    let cleanMessage = rawText;

    const bookingMatch = rawText.match(/<BOOKING>([\s\S]*?)<\/BOOKING>/);
    if (bookingMatch) {
      try {
        let jsonText = bookingMatch[1].trim();
        // Remove code block markers if present
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```(?:json)?\s*/i, '');
        }
        if (jsonText.endsWith('```')) {
          jsonText = jsonText.replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(jsonText.trim());
        
        // Normalize properties in case model outputs variations
        const resolved_client_name = parsed.client_name || parsed.customer_name || parsed.clientName || parsed.customerName;
        const resolved_service_name = parsed.service_name || parsed.serviceName;
        const resolved_staff_name = parsed.staff_name || parsed.staffName || parsed.stylist_name || parsed.stylistName;
        const resolved_time = parsed.time || parsed.time_slot || parsed.timeSlot;

        if (resolved_service_name && resolved_staff_name && resolved_time && resolved_client_name) {
          parsed.client_name = resolved_client_name;
          parsed.service_name = resolved_service_name;
          parsed.staff_name = resolved_staff_name;
          parsed.time = resolved_time;

          // Resolve IDs from names if not provided
          if (!parsed.service_id && parsed.service_name) {
            const svc = SALON_SERVICES.find(s =>
              s.name.toLowerCase().includes(parsed.service_name.toLowerCase()) ||
              parsed.service_name.toLowerCase().includes(s.name.toLowerCase())
            );
            if (svc) { parsed.service_id = svc.id; parsed.service_price = svc.price; }
          }
          if (!parsed.staff_id && parsed.staff_name) {
            const stf = SALON_STAFF.find(s =>
              s.name.toLowerCase().includes(parsed.staff_name.toLowerCase()) ||
              parsed.staff_name.toLowerCase().includes(s.name.toLowerCase())
            );
            if (stf) parsed.staff_id = stf.id;
          }

          bookingData = parsed;
          isComplete = true;
          conversationHistory.delete(sessionKey); // Clear after booking
        }
      } catch (e) {
        console.error('Booking JSON parse error:', e.message);
      }
      cleanMessage = rawText.replace(/<BOOKING>[\s\S]*?<\/BOOKING>/g, '').trim();
    }

    return {
      success: true,
      message: cleanMessage,
      isComplete,
      bookingData
    };

  } catch (err) {
    console.error('Gemini API error:', err.message);
    // Remove the failed user message from history
    history.pop();
    conversationHistory.set(sessionKey, history);

    return {
      success: false,
      message: `⚠️ AI service error: ${err.message}. Please try again.`,
      isComplete: false,
      bookingData: null
    };
  }
}

export function resetConversation(phone, channel = 'whatsapp') {
  conversationHistory.delete(`${phone}::${channel}`);
}

export function getActiveSessionCount() {
  return conversationHistory.size;
}

export { SALON_SERVICES, SALON_STAFF, BRANCHES };
