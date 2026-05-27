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
  // Load state from localStorage or fallback to mockData
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_selectedBranchId');
      return saved ? parseInt(saved, 10) : 1;
    } catch (e) {
      console.error(e);
      return 1;
    }
  });

  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_appointments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return mockAppointments;
  });

  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_inventory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return mockInventory;
  });

  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return mockCustomers;
  });

  const [staff, setStaff] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_staff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return mockStaff;
  });

  const [notificationsLog, setNotificationsLog] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_notificationsLog');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return mockNotifications;
  });

  const [services] = useState(mockServices);
  const [branches] = useState(mockBranches);
  const [membershipPlans] = useState(mockMembershipPlans);

  // --- INTEGRATIONS / WEBHOOK SIMULATOR STATE ---
  const [waMessages, setWaMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_waMessages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { sender: 'client', text: 'Hello SalonSync! Can I book a Hair Color with Ravi today at 4 PM?', time: '15:45' }
    ];
  });

  const [webhookLogs, setWebhookLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_webhookLogs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [parsedData, setParsedData] = useState(() => {
    try {
      const saved = localStorage.getItem('salon_parsedData');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error(e);
      return null;
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

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('salon_selectedBranchId', selectedBranchId);
  }, [selectedBranchId]);

  useEffect(() => {
    localStorage.setItem('salon_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('salon_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('salon_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('salon_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('salon_notificationsLog', JSON.stringify(notificationsLog));
  }, [notificationsLog]);

  useEffect(() => {
    localStorage.setItem('salon_waMessages', JSON.stringify(waMessages));
  }, [waMessages]);

  useEffect(() => {
    localStorage.setItem('salon_webhookLogs', JSON.stringify(webhookLogs));
  }, [webhookLogs]);

  useEffect(() => {
    if (parsedData) {
      localStorage.setItem('salon_parsedData', JSON.stringify(parsedData));
    } else {
      localStorage.removeItem('salon_parsedData');
    }
  }, [parsedData]);

  useEffect(() => {
    localStorage.setItem('salon_isLiveStreaming', isLiveStreaming.toString());
  }, [isLiveStreaming]);

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
  const addNotification = (customerName, phone, message, type = 'WhatsApp') => {
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      customerName,
      phone,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'Delivered',
      unread: true
    };
    setNotificationsLog(prev => [newNotif, ...prev].slice(0, 50));

    // Also trigger toast notification!
    if (type === 'WhatsApp') {
      addToast(`💬 WhatsApp booking request from ${customerName}`, 'whatsapp', '/integrations');
    } else if (type === 'SMS' && customerName.includes('Inventory')) {
      addToast(`⚠️ Stock Warning: ${message}`, 'warning', '/inventory');
    } else {
      addToast(`🔔 Alert: ${message}`, 'info');
    }
  };

  const markNotificationsAsRead = () => {
    setNotificationsLog(prev => prev.map(notif => ({ ...notif, unread: false })));
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

      // Assemble chat texts
      const templates = [
        `Hey SalonSync, I'm ${fullName}. I would like to book a ${randomService.name} with ${randomStaff.name} today at ${randomTime}.`,
        `Hello! Can you book a ${randomService.name} for me today at ${randomTime}? I prefer stylist ${randomStaff.name}. Name: ${fullName}, Ph: ${cleanPhone}`,
        `Hi, is ${randomStaff.name} free at ${randomTime}? I want to schedule a ${randomService.name}. Customer: ${fullName}.`,
        `Book appointment: ${randomService.name} with stylist ${randomStaff.name} for today ${randomTime}. Client phone: ${cleanPhone}. Thanks, ${fullName}.`
      ];
      const selectedText = templates[Math.floor(Math.random() * templates.length)];
      
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      // Push message to chat
      setWaMessages(prev => [...prev, { sender: 'client', text: selectedText, time: timestamp }]);

      // Push raw payload
      const mockPayload = {
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
      setWebhookLogs(prev => [JSON.stringify(mockPayload, null, 2), ...prev].slice(0, 5));

      // Parse NLP parameters
      setParsedData({
        clientName: fullName,
        phone: cleanPhone,
        stylist: randomStaff,
        service: randomService,
        time: randomTime,
        date: '2026-05-26',
        branchId: randomStaff.branchId
      });

      // Add webhook notifications
      addNotification(
        fullName,
        cleanPhone,
        `[Real-time API Webhook] Received WhatsApp booking request from ${fullName} for ${randomService.name} at ${randomTime}.`,
        'WhatsApp'
      );

    } catch (e) {
      console.error("Error fetching random user for simulator:", e);
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
      date: '2026-05-26',
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
  }, [isLiveStreaming, selectedBranchId]);

  // Add a new customer
  const addCustomer = (customerData) => {
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

    // Send customer welcome notification
    addNotification(
      newCustomer.name,
      newCustomer.phone,
      `Welcome to SalonSync, ${newCustomer.name}! Your customer profile is registered. Visit count: 0. Loyalty points: 0.`,
      'WhatsApp'
    );

    return newCustomer;
  };

  // Assign a membership plan to a customer
  const assignMembership = (customerId, planId) => {
    setCustomers(prev => prev.map(cust => {
      if (cust.id === customerId) {
        return { ...cust, membershipId: planId };
      }
      return cust;
    }));

    const customer = customers.find(c => c.id === customerId);
    const plan = membershipPlans.find(p => p.id === planId);
    if (customer && plan) {
      addNotification(
        customer.name,
        customer.phone,
        `Congratulations ${customer.name}! You are now subscribed to the "${plan.name}" membership. Enjoy your ${plan.discountPct}% discount!`,
        'WhatsApp'
      );
    }
  };

  // Add a new staff member
  const addStaff = (staffData) => {
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
  };

  // Add a new appointment
  const addAppointment = (apptData) => {
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

    // If appointment is booked directly as completed, update customer visits and loyalty points
    if (newAppt.status === 'completed') {
      triggerCustomerUpdate(newAppt.customerId, newAppt.amount);
    }

    // Lookup customer phone
    const customer = customers.find(c => c.id === newAppt.customerId);
    const phone = customer ? customer.phone : '9111111111';

    // Outgoing booking notification
    addNotification(
      newAppt.customerName,
      phone,
      `Hi ${newAppt.customerName}, your appointment for ${newAppt.serviceName} with stylist ${newAppt.staffName} on ${newAppt.date} at ${newAppt.time} is successfully booked! Booking source: ${newAppt.source.toUpperCase()}.`,
      newAppt.source === 'whatsapp' ? 'WhatsApp' : 'SMS'
    );

    return newAppt;
  };

  // Internal helper to update customer visits and award loyalty points
  const triggerCustomerUpdate = (customerId, billingAmount) => {
    setCustomers(prevCustomers => {
      return prevCustomers.map(cust => {
        if (cust.id === customerId) {
          // Rule: award loyalty points equal to 10% of total spent
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
  const updateAppointmentStatus = (id, newStatus) => {
    let completedAppt = null;
    let updatedAppt = null;

    setAppointments(prev => prev.map(appt => {
      if (appt.id === id) {
        updatedAppt = { ...appt, status: newStatus };
        // If transitioning to completed, we capture it to award loyalty points
        if (appt.status !== 'completed' && newStatus === 'completed') {
          completedAppt = appt;
        }
        return updatedAppt;
      }
      return appt;
    }));

    if (completedAppt) {
      triggerCustomerUpdate(completedAppt.customerId, completedAppt.amount);
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
        addNotification(updatedAppt.customerName, phone, message, 'WhatsApp');
      }
    }
  };

  // Update inventory item quantity
  const updateInventoryQuantity = (id, newQuantity) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, quantity: Math.max(0, newQuantity) };
        
        // Low stock notification trigger
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
  };

  // Add new inventory item
  const addInventoryItem = (itemData) => {
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
  };

  // Update inventory item details
  const updateInventoryItem = (id, updatedData) => {
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
  };

  // Redeem customer loyalty points (updates points state)
  const redeemCustomerPoints = (customerId, pointsToRedeem) => {
    setCustomers(prev => prev.map(cust => {
      if (cust.id === customerId) {
        return {
          ...cust,
          loyaltyPoints: Math.max(0, cust.loyaltyPoints - pointsToRedeem)
        };
      }
      return cust;
    }));
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
      parsedData,
      setParsedData,
      isLiveStreaming,
      setIsLiveStreaming,
      isFetchingMsg,
      fetchRandomClientBooking,
      parseMessageNLP,
      toasts,
      removeToast,
      markNotificationsAsRead
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
