import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  branches as mockBranches,
  services as mockServices,
  staff as mockStaff,
  customers as mockCustomers,
  appointments as mockAppointments,
  inventory as mockInventory
} from '../data/mockData';

const AppContext = createContext();

const mockMembershipPlans = [
  { id: 1, name: 'Hair VIP Pass', price: 1499, discountPct: 15, category: 'Hair', description: '15% off all hair styling, haircuts, colors, and spas.' },
  { id: 2, name: 'Nail Deluxe Enthusiast', price: 999, discountPct: 20, category: 'Nails', description: '20% off all manicure and pedicure services.' },
  { id: 3, name: 'Royal Grooming Package', price: 2999, discountPct: 10, category: 'All', description: '10% off any service across categories, plus priority booking.' }
];

const mockNotifications = [
  { id: 'notif-1', customerName: 'Kavya Rao', phone: '9333333333', message: 'Hi Kavya Rao, you have checked in for Bridal Makeup. Your service has started.', type: 'WhatsApp', timestamp: '20:45', status: 'Delivered', unread: true },
  { id: 'notif-2', customerName: 'Loreal Shampoo Alert', phone: 'System', message: 'Low Stock Alert: Loreal Shampoo 1L (3 remaining, minimum: 5)', type: 'SMS', timestamp: '19:30', status: 'Sent', unread: true },
  { id: 'notif-3', customerName: 'Meera Joshi', phone: '9111111111', message: 'Hi Meera Joshi, your appointment for Haircut (Women) has been marked completed. Thank you!', type: 'WhatsApp', timestamp: '11:00', status: 'Delivered', unread: true }
];

export const AppProvider = ({ children }) => {
  // Global States loaded from Server or fallback mockData
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_selectedBranchId');
      return saved ? parseInt(saved, 10) : 1;
    } catch (e) {
      console.error(e);
      return 1;
    }
  });

  const [appointments, setAppointments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [notificationsLog, setNotificationsLog] = useState([]);
  const [waMessages, setWaMessages] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [settings, setSettings] = useState({ discord_webhook_url: '' });
  const [currentDate, setCurrentDate] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_currentDate');
      if (saved) return saved;
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  });
  
  const [isLiveStreaming, setIsLiveStreaming] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_isLiveStreaming');
      return saved ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const [isFetchingMsg, setIsFetchingMsg] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Cross-module navigation state
  const [pendingPOSPrefill, setPendingPOSPrefill] = useState(null); // { customerName, phone, serviceId, serviceName, staffId, staffName }
  const [highlightCustomerId, setHighlightCustomerId] = useState(null); // highlight a customer in Customers page

  const services = mockServices;
  const branches = mockBranches;
  const membershipPlans = mockMembershipPlans;

  const fetchDatabaseState = async () => {
    try {
      const [appts, inv, custs, stf, msgs, notifs, logs, setts] = await Promise.all([
        fetch('/api/appointments').then(r => r.json()),
        fetch('/api/inventory').then(r => r.json()),
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/staff').then(r => r.json()),
        fetch('/api/wa-messages').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
        fetch('/api/webhook-logs').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);

      setAppointments(appts);
      setInventory(inv);
      setCustomers(custs);
      setStaff(stf);
      setWaMessages(msgs);
      setNotificationsLog(notifs);
      setWebhookLogs(logs.map(l => l.payload));
      setSettings(setts);
    } catch (e) {
      console.error("Failed to connect to backend server. Retaining current/fallback states.", e);
      // Seed mock values only if currently empty
      setAppointments(prev => prev.length === 0 ? mockAppointments : prev);
      setInventory(prev => prev.length === 0 ? mockInventory : prev);
      setCustomers(prev => prev.length === 0 ? mockCustomers : prev);
      setStaff(prev => prev.length === 0 ? mockStaff : prev);
      setNotificationsLog(prev => prev.length === 0 ? mockNotifications : prev);
      setWaMessages(prev => prev.length === 0 ? [
        { 
          id: 'msg-seed-1',
          sender: 'client', 
          text: 'Can I schedule a Men Haircut with Ravi Kumar today at 3:30 PM? - Arjun Singh', 
          time: '11:15',
          channel: 'whatsapp',
          status: 'approved',
          clientName: 'Arjun Singh',
          phone: '9222222222',
          service: { id: 1, name: "Men's Haircut", price: 350 },
          stylist: { id: 1, name: 'Ravi Kumar' }
        }
      ] : prev);
    }
  };

  // --- FETCH INITIAL STATE ON MOUNT & POLL ---
  useEffect(() => {
    fetchDatabaseState();
    const interval = setInterval(fetchDatabaseState, 3000);
    return () => clearInterval(interval);
  }, [selectedBranchId]);

  // Sync selected branch ID and live streaming switch locally
  useEffect(() => {
    localStorage.setItem('salon_selectedBranchId', selectedBranchId);
  }, [selectedBranchId]);

  useEffect(() => {
    localStorage.setItem('salon_isLiveStreaming', isLiveStreaming.toString());
  }, [isLiveStreaming]);

  useEffect(() => {
    localStorage.setItem('salon_currentDate', currentDate);
  }, [currentDate]);

  // Toast functions
  const addToast = (message, type = 'info', actionPath = null) => {
    const id = Date.now() + '-' + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, message, type, actionPath }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Add notification log helper
  const addNotification = async (customerName, phone, message, type = 'WhatsApp') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const notifData = {
      customerName,
      phone,
      message,
      type,
      timestamp,
      status: 'Delivered',
      unread: true
    };

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifData)
      });
      if (!response.ok) throw new Error("Failed to save notification");
      const newNotif = await response.json();
      setNotificationsLog(prev => [newNotif, ...prev].slice(0, 50));
    } catch (e) {
      console.error(e);
      const localNotif = {
        id: 'notif-' + Date.now(),
        ...notifData
      };
      setNotificationsLog(prev => [localNotif, ...prev].slice(0, 50));
    }

    // Trigger toast notification!
    if (type === 'WhatsApp') {
      addToast(`Booking request from ${customerName}`, 'whatsapp', '/integrations');
    } else if (type === 'Instagram') {
      addToast(`Booking request from ${customerName}`, 'instagram', '/integrations');
    } else if (type === 'Voice Call') {
      addToast(`Booking request from ${customerName}`, 'voice', '/integrations');
    } else if (type === 'SMS' && customerName.includes('Inventory')) {
      addToast(`${message}`, 'warning', '/inventory');
    } else {
      addToast(`${message}`, 'info');
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      setNotificationsLog(prev => prev.map(notif => ({ ...notif, unread: false })));
      await fetch('/api/notifications/read', { method: 'PUT' });
    } catch (e) {
      console.error("Failed to mark notifications as read:", e);
    }
  };

  // Webhook log helper
  const saveWebhookLog = async (payload) => {
    try {
      await fetch('/api/webhook-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload })
      });
      setWebhookLogs(prev => [payload, ...prev].slice(0, 5));
    } catch (e) {
      console.error(e);
      setWebhookLogs(prev => [payload, ...prev].slice(0, 5));
    }
  };

  // Add simulated inbound message helper
  const addWaMessage = async (msg) => {
    try {
      const response = await fetch('/api/wa-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      if (!response.ok) throw new Error("Failed to add message");
      const savedMsg = await response.json();
      setWaMessages(prev => [...prev, savedMsg]);
    } catch (e) {
      console.error(e);
      setWaMessages(prev => [...prev, msg]);
    }
  };

  // Update wa message status helper
  const updateWaMessageStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/wa-messages/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Failed to update message status");
      const updated = await response.json();
      setWaMessages(prev => prev.map(m => m.id === id ? updated : m));
    } catch (e) {
      console.error(e);
      setWaMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    }
  };

  // Wipe messages & logs
  const wipeLogs = async () => {
    try {
      await fetch('/api/wipe-logs', { method: 'POST' });
      setWaMessages([]);
      setWebhookLogs([]);
    } catch (e) {
      console.error(e);
      setWaMessages([]);
      setWebhookLogs([]);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (!response.ok) throw new Error("Failed to save settings");
      setSettings(prev => ({ ...prev, ...newSettings }));
      return true;
    } catch (e) {
      console.error("Failed to update settings:", e);
      setSettings(prev => ({ ...prev, ...newSettings }));
      return false;
    }
  };

  // Fetch random customer from randomuser.me API to simulate incoming WhatsApp bookings in real-time
  const fetchRandomClientBooking = async () => {
    setIsFetchingMsg(true);
    try {
      const response = await fetch('https://randomuser.me/api/');
      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      const user = data.results[0];
      const fullName = `${user.name.first} ${user.name.last}`;
      const cleanPhone = user.phone.replace(/\D/g, '').slice(-10) || '9876543210';
      
      // Select random service & staff
      if (!services || services.length === 0) return;
      const randomService = services[Math.floor(Math.random() * services.length)];
      
      const activeBranchStaff = staff.filter(s => s.branchId === selectedBranchId);
      const staffListToUse = activeBranchStaff.length > 0 ? activeBranchStaff : staff;
      if (staffListToUse.length === 0) return;
      const randomStaff = staffListToUse[Math.floor(Math.random() * staffListToUse.length)];
      
      const hours = Math.floor(Math.random() * 11) + 9;
      const mins = Math.random() > 0.5 ? '00' : '30';
      const randomTime = `${hours.toString().padStart(2, '0')}:${mins}`;

      // Pick random channel: whatsapp, instagram, voice
      const channels = ['whatsapp', 'instagram', 'voice'];
      const selectedChannel = channels[Math.floor(Math.random() * channels.length)];

      let selectedText = '';
      let mockPayload = {};

      if (selectedChannel === 'whatsapp') {
        const templates = [
          `Hey SalonSync, I'm ${fullName}. I would like to book a ${randomService.name} with ${randomStaff.name} today at ${randomTime}.`,
          `Hello! Can you book a ${randomService.name} for me today at ${randomTime}? I prefer stylist ${randomStaff.name}. Name: ${fullName}, Ph: ${cleanPhone}`,
          `Hi, is ${randomStaff.name} free at ${randomTime}? I want to schedule a ${randomService.name}. Customer: ${fullName}.`
        ];
        selectedText = templates[Math.floor(Math.random() * templates.length)];
        mockPayload = {
          object: 'whatsapp_business_account',
          entry: [{
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '16505553333', phone_number_id: '99999999' },
                contacts: [{ profile: { name: fullName }, wa_id: cleanPhone }],
                messages: [{
                  from: cleanPhone,
                  id: 'wamid.' + Math.random().toString(36).substring(2, 15),
                  timestamp: Math.floor(Date.now() / 1000),
                  text: { body: selectedText },
                  type: 'text'
                }]
              },
              field: 'messages'
            }]
          }]
        };
      } else if (selectedChannel === 'instagram') {
        selectedText = `[Instagram DM] Hello! Is there any slot available for ${randomService.name} with ${randomStaff.name} today at ${randomTime}? My name is ${fullName} (Ph: ${cleanPhone})`;
        mockPayload = {
          object: 'instagram_business_account',
          entry: [{
            id: 'INSTAGRAM_BUSINESS_ACCOUNT_ID',
            changes: [{
              value: {
                messaging_product: 'instagram',
                metadata: { page_id: '1234567890' },
                sender: { id: cleanPhone },
                message: {
                  id: 'igmid.' + Math.random().toString(36).substring(2, 15),
                  timestamp: Math.floor(Date.now() / 1000),
                  text: selectedText
                }
              },
              field: 'messages'
            }]
          }]
        };
      } else {
        selectedText = `[Voice Call IVR Transcription] "Hello, I want to book a ${randomService.name} with ${randomStaff.name} today at ${randomTime}. My name is ${fullName} and my phone is ${cleanPhone}."`;
        mockPayload = {
          object: 'voice_ivr_session',
          entry: [{
            session_id: 'call_' + Math.random().toString(36).substring(2, 10),
            direction: 'inbound',
            from: cleanPhone,
            transcription: selectedText,
            timestamp: Math.floor(Date.now() / 1000),
            entities: {
              customer_name: fullName,
              service_name: randomService.name,
              stylist_name: randomStaff.name,
              requested_time: randomTime
            }
          }]
        };
      }

      // Dispatch HTTP POST request to the local webhook gateway endpoint
      const webRes = await fetch(`/api/webhooks/${selectedChannel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mockPayload,
          // Fallbacks for testing direct POST fields
          clientName: fullName,
          phone: cleanPhone,
          text: selectedText,
          branchId: selectedBranchId,
          date: currentDate
        })
      });
      if (!webRes.ok) throw new Error("Webhook API failed");
      const webData = await webRes.json();
      
      // Update local states by querying fresh SQLite tables
      const [msgs, logs, notifs] = await Promise.all([
        fetch('/api/wa-messages').then(r => r.json()),
        fetch('/api/webhook-logs').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json())
      ]);

      setWaMessages(msgs);
      setWebhookLogs(logs.map(l => l.payload));
      setNotificationsLog(notifs);

      // Save parsed data state
      const savedMsg = webData.message;
      if (savedMsg) {
        setParsedData({
          messageId: savedMsg.id,
          clientName: savedMsg.clientName,
          phone: savedMsg.phone,
          stylist: savedMsg.stylist,
          service: savedMsg.service,
          time: savedMsg.timeSlot,
          date: savedMsg.date,
          branchId: savedMsg.branchId,
          channel: savedMsg.channel
        });
      }
    } catch (e) {
      console.error("Error running real webhook query:", e);
    } finally {
      setIsFetchingMsg(false);
    }
  };

  const parseMessageNLP = (text) => {
    const textLower = text.toLowerCase();
    
    // Find matching stylist
    let matchedStaff = staff.find(s => textLower.includes(s.name.toLowerCase()) || textLower.includes(s.name.split(' ')[0].toLowerCase()));
    
    // Find matching service
    let matchedService = services.find(s => textLower.includes(s.name.toLowerCase()) || textLower.includes(s.category.toLowerCase()));
    if (!matchedService && textLower.includes('haircut')) {
      matchedService = services.find(s => s.name.includes('Haircut'));
    } else if (!matchedService && textLower.includes('trim')) {
      matchedService = services.find(s => s.name.includes('Trim'));
    } else if (!matchedService && textLower.includes('spa')) {
      matchedService = services.find(s => s.name.includes('Spa'));
    }

    if (!matchedService) matchedService = services[0];
    const activeBranchStaff = staff.filter(s => s.branchId === selectedBranchId);
    if (!matchedStaff) matchedStaff = activeBranchStaff[0] || staff[0];

    // Find time
    let matchedTime = '12:00';
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
    const match = textLower.match(timeRegex);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2] ? match[2] : '00';
      const ampm = match[3] ? match[3].toLowerCase() : '';
      
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      if (hours >= 1 && hours <= 8 && ampm === '') hours += 12; 
      
      matchedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    // Determine client name (mocking based on message)
    let clientName = 'WhatsApp Guest';
    let clientPhone = '9888877777';
    if (textLower.includes('haircut')) {
      clientName = 'Arjun Singh';
      clientPhone = '9222222222';
    } else if (textLower.includes('makeup')) {
      clientName = 'Kavya Rao';
      clientPhone = '9333333333';
    } else if (textLower.includes('spa')) {
      clientName = 'Sneha Gupta';
      clientPhone = '9555555555';
    }

    return {
      clientName,
      phone: clientPhone,
      stylist: matchedStaff,
      service: matchedService,
      time: matchedTime,
      date: currentDate,
      branchId: matchedStaff.branchId
    };
  };

  const fetchRef = React.useRef(fetchRandomClientBooking);
  useEffect(() => {
    fetchRef.current = fetchRandomClientBooking;
  });

  // Setup Background Polling Timer globally
  useEffect(() => {
    if (!isLiveStreaming) return;
    
    const initialTimer = setTimeout(() => {
      fetchRef.current();
    }, 5000);

    const interval = setInterval(() => {
      fetchRef.current();
    }, 25000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isLiveStreaming, selectedBranchId, staff]);

  // Add a new customer
  const addCustomer = async (customerData) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      if (!response.ok) throw new Error("Failed to add customer");
      const newCustomer = await response.json();
      
      setCustomers(prev => {
        // Prevent duplicate local additions if already fetched
        if (prev.some(c => c.phone === newCustomer.phone)) return prev;
        return [...prev, newCustomer];
      });

      // Send customer welcome notification
      await addNotification(
        newCustomer.name,
        newCustomer.phone,
        `Welcome to SalonSync, ${newCustomer.name}! Your customer profile is registered. Visit count: 0. Loyalty points: 0.`,
        'WhatsApp'
      );

      return newCustomer;
    } catch (e) {
      console.error("Backend addCustomer failed, using fallback:", e);
      const newCustomer = {
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || '',
        loyaltyPoints: customerData.loyaltyPoints || 0,
        totalVisits: customerData.totalVisits || 0,
        preferredBranch: customerData.preferredBranch || selectedBranchId,
        membershipId: customerData.membershipId || null
      };
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    }
  };

  // Assign a membership plan to a customer
  const assignMembership = async (customerId, planId) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/membership`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId: planId })
      });
      if (!response.ok) throw new Error("Failed to assign membership");
      const updatedCustomer = await response.json();

      setCustomers(prev => prev.map(cust => cust.id === customerId ? updatedCustomer : cust));

      const plan = membershipPlans.find(p => p.id === planId);
      if (updatedCustomer && plan) {
        await addNotification(
          updatedCustomer.name,
          updatedCustomer.phone,
          `Congratulations ${updatedCustomer.name}! You are now subscribed to the "${plan.name}" membership. Enjoy your ${plan.discountPct}% discount!`,
          'WhatsApp'
        );
      }
    } catch (e) {
      console.error(e);
      setCustomers(prev => prev.map(cust => {
        if (cust.id === customerId) {
          return { ...cust, membershipId: planId };
        }
        return cust;
      }));
    }
  };

  // Add a new staff member
  const addStaff = async (staffData) => {
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
      });
      if (!response.ok) throw new Error("Failed to add staff");
      const newMember = await response.json();
      setStaff(prev => [...prev, newMember]);
      return newMember;
    } catch (e) {
      console.error(e);
      const newMember = {
        id: staff.length > 0 ? Math.max(...staff.map(s => s.id)) + 1 : 1,
        name: staffData.name,
        role: staffData.role,
        branchId: staffData.branchId || selectedBranchId,
        commissionPct: parseInt(staffData.commissionPct, 10) || 10,
        phone: staffData.phone || ''
      };
      setStaff(prev => [...prev, newMember]);
      return newMember;
    }
  };

  // Add a new appointment
  const addAppointment = async (apptData) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apptData)
      });
      if (!response.ok) throw new Error("Failed to add appointment");
      const newAppt = await response.json();

      setAppointments(prev => [...prev, newAppt]);

      // If appointment is booked directly as completed, update customer visits and loyalty points locally
      if (newAppt.status === 'completed') {
        const custRes = await fetch('/api/customers').then(r => r.json());
        setCustomers(custRes);
      }

      // Lookup customer phone
      const customer = customers.find(c => c.id === newAppt.customerId);
      const phone = customer ? customer.phone : '9111111111';

      // Outgoing booking notification
      await addNotification(
        newAppt.customerName,
        phone,
        `Hi ${newAppt.customerName}, your appointment for ${newAppt.serviceName} with stylist ${newAppt.staffName} on ${newAppt.date} at ${newAppt.time} is successfully booked! Booking source: ${newAppt.source.toUpperCase()}.`,
        newAppt.source === 'whatsapp' ? 'WhatsApp' : 'SMS'
      );

      return newAppt;
    } catch (e) {
      console.error("Backend addAppointment failed, using fallback:", e);
      const apptId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
      const newAppt = {
        id: apptId,
        customerId: parseInt(apptData.customerId, 10),
        customerName: apptData.customerName,
        staffId: parseInt(apptData.staffId, 10),
        staffName: apptData.staffName,
        serviceId: parseInt(apptData.serviceId, 10),
        serviceName: apptData.serviceName,
        branchId: parseInt(apptData.branchId || selectedBranchId, 10),
        date: apptData.date,
        time: apptData.time,
        status: apptData.status || 'pending',
        source: apptData.source || 'walkin',
        amount: parseFloat(apptData.amount)
      };

      setAppointments(prev => [...prev, newAppt]);

      if (newAppt.status === 'completed') {
        triggerCustomerUpdate(newAppt.customerId, newAppt.amount);
      }

      return newAppt;
    }
  };

  // Internal helper to update customer visits and award loyalty points (local fallback only)
  const triggerCustomerUpdate = (customerId, billingAmount) => {
    setCustomers(prevCustomers => {
      return prevCustomers.map(cust => {
        if (cust.id === customerId) {
          const earnedPoints = Math.round(billingAmount * 0.1);
          return {
            ...cust,
            totalVisits: cust.totalVisits + 1,
            loyaltyPoints: cust.loyaltyPoints + earnedPoints
          };
        }
        return cust;
      });
    });
  };

  // Update appointment status (e.g. mark completed, cancel, confirm)
  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("Failed to update appointment status");
      const updatedAppt = await response.json();

      setAppointments(prev => prev.map(appt => appt.id === id ? updatedAppt : appt));

      // Fetch updated customer status if completed
      const oldAppt = appointments.find(a => a.id === id);
      if (oldAppt && oldAppt.status !== 'completed' && newStatus === 'completed') {
        const custRes = await fetch('/api/customers').then(r => r.json());
        setCustomers(custRes);
      }

      if (updatedAppt) {
        const customer = customers.find(c => c.id === updatedAppt.customerId);
        const phone = customer ? customer.phone : '9111111111';
        
        let message = '';
        if (newStatus === 'confirmed') {
          message = `Hi ${updatedAppt.customerName}, your booking for ${updatedAppt.serviceName} on ${updatedAppt.date} at ${updatedAppt.time} has been CONFIRMED.`;
        } else if (newStatus === 'inprogress') {
          message = `Hi ${updatedAppt.customerName}, you have checked in for ${updatedAppt.serviceName}. Stylist: ${updatedAppt.staffName}. Service is In Progress.`;
        } else if (newStatus === 'completed') {
          message = `Thank you for visiting SalonSync, ${updatedAppt.customerName}! Your service for ${updatedAppt.serviceName} is completed. Paid: ₹${updatedAppt.amount}. See you again!`;
        }

        if (message) {
          await addNotification(updatedAppt.customerName, phone, message, 'WhatsApp');
        }
      }
    } catch (e) {
      console.error("Backend updateAppointmentStatus failed, using fallback:", e);
      let completedAppt = null;
      setAppointments(prev => prev.map(appt => {
        if (appt.id === id) {
          const updated = { ...appt, status: newStatus };
          if (appt.status !== 'completed' && newStatus === 'completed') {
            completedAppt = appt;
          }
          return updated;
        }
        return appt;
      }));

      if (completedAppt) {
        triggerCustomerUpdate(completedAppt.customerId, completedAppt.amount);
      }
    }
  };

  // Update appointment details (e.g. status, amount, staff, date, time)
  const updateAppointmentDetails = async (id, updatedDetails) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDetails)
      });
      if (!response.ok) throw new Error("Failed to update appointment details");
      const updatedAppt = await response.json();

      setAppointments(prev => prev.map(appt => appt.id === id ? updatedAppt : appt));

      // Fetch updated customer status if completed
      const oldAppt = appointments.find(a => a.id === id);
      if (oldAppt && oldAppt.status !== 'completed' && updatedDetails.status === 'completed') {
        const custRes = await fetch('/api/customers').then(r => r.json());
        setCustomers(custRes);
      }

      if (updatedAppt && updatedDetails.status === 'completed') {
        const customer = customers.find(c => c.id === updatedAppt.customerId);
        const phone = customer ? customer.phone : '9111111111';
        const message = `Thank you for visiting SalonSync, ${updatedAppt.customerName}! Your service for ${updatedAppt.serviceName} is completed. Paid: ₹${updatedAppt.amount}. See you again!`;
        await addNotification(updatedAppt.customerName, phone, message, 'WhatsApp');
      }
      return updatedAppt;
    } catch (e) {
      console.error("Backend updateAppointmentDetails failed, using fallback:", e);
      let completedAppt = null;
      setAppointments(prev => prev.map(appt => {
        if (appt.id === id) {
          const updated = {
            ...appt,
            status: updatedDetails.status !== undefined ? updatedDetails.status : appt.status,
            amount: updatedDetails.amount !== undefined ? parseFloat(updatedDetails.amount) : appt.amount,
            staffId: updatedDetails.staffId !== undefined ? parseInt(updatedDetails.staffId, 10) : appt.staffId,
            staffName: updatedDetails.staffName !== undefined ? updatedDetails.staffName : appt.staffName,
            date: updatedDetails.date !== undefined ? updatedDetails.date : appt.date,
            time: updatedDetails.time !== undefined ? updatedDetails.time : appt.time,
            customerId: updatedDetails.customerId !== undefined ? parseInt(updatedDetails.customerId, 10) : appt.customerId,
            customerName: updatedDetails.customerName !== undefined ? updatedDetails.customerName : appt.customerName,
            serviceId: updatedDetails.serviceId !== undefined ? parseInt(updatedDetails.serviceId, 10) : appt.serviceId,
            serviceName: updatedDetails.serviceName !== undefined ? updatedDetails.serviceName : appt.serviceName
          };
          if (appt.status !== 'completed' && updatedDetails.status === 'completed') {
            completedAppt = updated;
          }
          return updated;
        }
        return appt;
      }));

      if (completedAppt) {
        triggerCustomerUpdate(completedAppt.customerId, completedAppt.amount);
      }
    }
  };


  // Update inventory item quantity
  const updateInventoryQuantity = async (id, newQuantity) => {
    try {
      const response = await fetch(`/api/inventory/${id}/quantity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (!response.ok) throw new Error("Failed to update inventory quantity");
      const updatedItem = await response.json();

      setInventory(prev => prev.map(item => item.id === id ? updatedItem : item));
      
      // Low stock notification trigger
      if (updatedItem.quantity < updatedItem.minStock) {
        await addNotification(
          'System Inventory Alert',
          'Staff Roster',
          `Low Stock Warning: "${updatedItem.name}" has only ${updatedItem.quantity} ${updatedItem.unit} remaining (min threshold: ${updatedItem.minStock}). Please restock!`,
          'SMS'
        );
      }
    } catch (e) {
      console.error("Backend updateInventoryQuantity failed, using fallback:", e);
      setInventory(prev => prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, quantity: Math.max(0, newQuantity) };
          if (updatedItem.quantity < updatedItem.minStock) {
            addNotification(
              'System Inventory Alert',
              'Staff Roster',
              `Low Stock Warning: "${updatedItem.name}" has only ${updatedItem.quantity} ${updatedItem.unit} remaining (min threshold: ${updatedItem.minStock}). Please restock!`,
              'SMS'
            );
          }
          return updatedItem;
        }
        return item;
      }));
    }
  };

  // Add new inventory item
  const addInventoryItem = async (itemData) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (!response.ok) throw new Error("Failed to add inventory item");
      const newItem = await response.json();
      setInventory(prev => [...prev, newItem]);
      return newItem;
    } catch (e) {
      console.error(e);
      const newItem = {
        id: inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
        name: itemData.name,
        category: itemData.category || 'Supplies',
        branchId: parseInt(itemData.branchId || selectedBranchId, 10),
        quantity: parseInt(itemData.quantity, 10) || 0,
        minStock: parseInt(itemData.minStock, 10) || 5,
        unit: itemData.unit || 'pieces',
        price: parseFloat(itemData.price) || 0
      };
      setInventory(prev => [...prev, newItem]);
      return newItem;
    }
  };

  // Update inventory item details
  const updateInventoryItem = async (id, updatedData) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) throw new Error("Failed to update inventory item");
      const updatedItem = await response.json();
      setInventory(prev => prev.map(item => item.id === id ? updatedItem : item));
    } catch (e) {
      console.error(e);
      setInventory(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            name: updatedData.name,
            category: updatedData.category || 'Supplies',
            quantity: parseInt(updatedData.quantity, 10) || 0,
            minStock: parseInt(updatedData.minStock, 10) || 5,
            unit: updatedData.unit || 'pieces',
            price: parseFloat(updatedData.price) || 0
          };
        }
        return item;
      }));
    }
  };

  // Redeem customer loyalty points
  const redeemCustomerPoints = async (customerId, pointsToRedeem) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsToRedeem })
      });
      if (!response.ok) throw new Error("Failed to redeem customer points");
      const updatedCustomer = await response.json();
      setCustomers(prev => prev.map(cust => cust.id === customerId ? updatedCustomer : cust));
    } catch (e) {
      console.error(e);
      setCustomers(prev => prev.map(cust => {
        if (cust.id === customerId) {
          return {
            ...cust,
            loyaltyPoints: Math.max(0, cust.loyaltyPoints - pointsToRedeem)
          };
        }
        return cust;
      }));
    }
  };

  return (
    <AppContext.Provider value={{
      branches,
      services,
      staff,
      customers,
      appointments,
      inventory,
      selectedBranchId,
      setSelectedBranchId,
      addCustomer,
      addStaff,
      addAppointment,
      updateAppointmentStatus,
      updateAppointmentDetails,
      updateInventoryQuantity,
      addInventoryItem,
      updateInventoryItem,
      redeemCustomerPoints,
      membershipPlans,
      notificationsLog,
      addNotification,
      assignMembership,
      waMessages,
      setWaMessages,
      webhookLogs,
      setWebhookLogs,
      currentDate,
      setCurrentDate,
      parsedData,
      setParsedData,
      isLiveStreaming,
      setIsLiveStreaming,
      isFetchingMsg,
      fetchRandomClientBooking,
      parseMessageNLP,
      toasts,
      removeToast,
      markNotificationsAsRead,
      saveWebhookLog,
      addWaMessage,
      updateWaMessageStatus,
      wipeLogs,
      updateSettings,
      settings,
      pendingPOSPrefill,
      setPendingPOSPrefill,
      highlightCustomerId,
      setHighlightCustomerId,
      fetchDatabaseState
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
