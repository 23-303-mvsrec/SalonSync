import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Globe, 
  MessageSquare, 
  Phone, 
  Send, 
  Cpu, 
  Code, 
  Terminal, 
  CheckCircle,
  FileText,
  Mail,
  User,
  Scissors,
  Clock,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Settings,
  AlertCircle,
  Trash2,
  Radio,
  Activity
} from 'lucide-react';

const Instagram = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Integrations = () => {
  const { 
    selectedBranchId, 
    services, 
    staff, 
    customers, 
    addAppointment,
    notificationsLog,
    addNotification,
    branches,
    waMessages,
    setWaMessages,
    webhookLogs,
    setWebhookLogs,
    parsedData,
    setParsedData,
    isLiveStreaming,
    setIsLiveStreaming,
    isFetchingMsg
  } = useApp();

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  // --- TAB STATE MANAGEMENT ---
  const [activeLedgerTab, setActiveLedgerTab] = useState('payload'); // payload | audit | developer
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // --- FILTER & SELECTION ---
  const [selectedMsgId, setSelectedMsgId] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');

  // --- WHATSAPP SIMULATOR STATE ---
  const [waInput, setWaInput] = useState('');

  // Set the first pending message as selected on mount or when messages update
  useEffect(() => {
    const pendingMsg = waMessages.find(m => m.sender === 'client' && m.status === 'pending');
    if (pendingMsg && !selectedMsgId) {
      setSelectedMsgId(pendingMsg.id);
    } else if (waMessages.length > 0 && !selectedMsgId) {
      setSelectedMsgId(waMessages[waMessages.length - 1].id);
    }
  }, [waMessages, selectedMsgId]);

  // Sync selected message details to parsedData for AI panel
  const selectedMsg = waMessages.find(m => m.id === selectedMsgId);

  useEffect(() => {
    if (selectedMsg && selectedMsg.sender === 'client' && selectedMsg.status === 'pending') {
      setParsedData({
        messageId: selectedMsg.id,
        clientName: selectedMsg.clientName || 'WhatsApp Guest',
        phone: selectedMsg.phone || '9876543210',
        stylist: selectedMsg.stylist || staff[0],
        service: selectedMsg.service || services[0],
        time: selectedMsg.timeSlot || selectedMsg.time,
        date: selectedMsg.date || '2026-05-26',
        branchId: selectedMsg.branchId || selectedBranchId,
        channel: selectedMsg.channel || 'whatsapp'
      });
    } else {
      setParsedData(null);
    }
  }, [selectedMsgId, waMessages, setParsedData, selectedBranchId, services, staff]);

  // Filter messages by channel
  const filteredMessages = waMessages
    .filter(m => m.sender === 'client')
    .filter(m => channelFilter === 'all' || m.channel === channelFilter)
    .sort((a, b) => b.id.localeCompare(a.id)); // Newest first

  // --- CUSTOM SIMULATOR TRIGGERS ---
  const triggerChannelSimulation = (channel) => {
    const firstNames = ["Rahul", "Priya", "Vikram", "Sneha", "Karan", "Neha", "Amit", "Ananya", "Rohan", "Tanvi"];
    const lastNames = ["Sharma", "Verma", "Gupta", "Nair", "Reddy", "Joshi", "Kumar", "Iyer", "Patel", "Singh"];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    
    const randomPhone = "9" + Math.floor(100000000 + Math.random() * 900000000);
    const randomService = services[Math.floor(Math.random() * services.length)];
    const branchStaff = staff.filter(s => s.branchId === selectedBranchId);
    const randomStaff = branchStaff.length > 0 ? branchStaff[Math.floor(Math.random() * branchStaff.length)] : staff[0];
    
    const hours = Math.floor(Math.random() * 11) + 9;
    const mins = Math.random() > 0.5 ? '00' : '30';
    const randomTime = `${hours.toString().padStart(2, '0')}:${mins}`;
    
    let text = '';
    let mockPayload = {};
    let logType = 'WhatsApp';

    if (channel === 'whatsapp') {
      text = `Hi, I'd like to book a ${randomService.name} with ${randomStaff.name} today at ${randomTime}. Name: ${fullName}, Phone: ${randomPhone}`;
      logType = 'WhatsApp';
      mockPayload = {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '16505553333', phone_number_id: '99999999' },
              contacts: [{ profile: { name: fullName }, wa_id: randomPhone }],
              messages: [{
                from: randomPhone,
                id: 'wamid.' + Math.random().toString(36).substring(2, 15),
                timestamp: Math.floor(Date.now() / 1000),
                text: { body: text },
                type: 'text'
              }]
            },
            field: 'messages'
          }]
        }]
      };
    } else if (channel === 'instagram') {
      text = `[Instagram DM] Hey! Is ${randomStaff.name} free for ${randomService.name} today at ${randomTime}? Name: ${fullName}, Contact: ${randomPhone}`;
      logType = 'Instagram';
      mockPayload = {
        object: 'instagram_business_account',
        entry: [{
          id: 'INSTAGRAM_BUSINESS_ACCOUNT_ID',
          changes: [{
            value: {
              messaging_product: 'instagram',
              metadata: { page_id: '1234567890' },
              sender: { id: randomPhone },
              message: {
                id: 'igmid.' + Math.random().toString(36).substring(2, 15),
                timestamp: Math.floor(Date.now() / 1000),
                text: text
              }
            },
            field: 'messages'
          }]
        }]
      };
    } else if (channel === 'voice') {
      text = `[Voice Call IVR Transcription] "Hello, I want to book a ${randomService.name} with stylist ${randomStaff.name} today at ${randomTime}. My name is ${fullName} and my phone number is ${randomPhone}."`;
      logType = 'Voice Call';
      mockPayload = {
        object: 'voice_ivr_session',
        entry: [{
          session_id: 'call_' + Math.random().toString(36).substring(2, 10),
          direction: 'inbound',
          from: randomPhone,
          transcription: text,
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

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const msgId = 'msg-' + Date.now();
    const newMsg = {
      id: msgId,
      sender: 'client',
      text,
      time: timestamp,
      channel,
      status: 'pending',
      clientName: fullName,
      phone: randomPhone,
      service: randomService,
      stylist: randomStaff,
      date: '2026-05-26',
      timeSlot: randomTime,
      branchId: selectedBranchId
    };

    setWaMessages(prev => [...prev, newMsg]);
    setWebhookLogs(prev => [JSON.stringify(mockPayload, null, 2), ...prev].slice(0, 5));
    setParsedData({
      messageId: msgId,
      clientName: fullName,
      phone: randomPhone,
      stylist: randomStaff,
      service: randomService,
      time: randomTime,
      date: '2026-05-26',
      branchId: selectedBranchId,
      channel
    });

    addNotification(
      fullName,
      randomPhone,
      `[Real-time API Webhook] Received ${logType} booking request from ${fullName} for ${randomService.name} at ${randomTime}.`,
      logType
    );
    
    setSelectedMsgId(msgId);
  };

  const handleSendWaMessage = (text) => {
    if (!text.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const msgId = 'msg-' + Date.now();

    // Perform a basic client-side NLP parse
    const matchedService = services.find(s => text.toLowerCase().includes(s.name.toLowerCase())) || services[0];
    const branchStaff = staff.filter(s => s.branchId === selectedBranchId);
    const matchedStaff = branchStaff.find(s => text.toLowerCase().includes(s.name.toLowerCase())) || branchStaff[0] || staff[0];

    const newMsg = {
      id: msgId,
      sender: 'client',
      text,
      time: timestamp,
      channel: 'whatsapp',
      status: 'pending',
      clientName: 'Walk-in Client',
      phone: '9888877777',
      service: matchedService,
      stylist: matchedStaff,
      date: '2026-05-26',
      timeSlot: '14:30',
      branchId: selectedBranchId
    };

    setWaMessages(prev => [...prev, newMsg]);
    setWaInput('');

    // Trigger webhook JSON logs
    const mockPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: '16505553333', phone_number_id: '99999999' },
            contacts: [{ profile: { name: 'Simulated Client' }, wa_id: '919888877777' }],
            messages: [{
              from: '919888877777',
              id: 'wamid.' + Math.random().toString(36).substring(2, 15),
              timestamp: Math.floor(Date.now() / 1000),
              text: { body: text },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    };
    setWebhookLogs(prev => [JSON.stringify(mockPayload, null, 2), ...prev].slice(0, 5));
    setSelectedMsgId(msgId);
  };

  const handleAutoBookConfirm = () => {
    if (!parsedData) return;

    // Check if slot is already booked for this stylist
    const isSlotBooked = appointments.some(a =>
      a.staffId === (parsedData.stylist?.id || 0) &&
      a.date === parsedData.date &&
      a.time === parsedData.time &&
      a.status !== 'cancelled'
    );

    if (isSlotBooked) {
      const confirmBooking = window.confirm(
        `Stylist ${parsedData.stylist?.name || 'Stylist'} is already booked at this time (${parsedData.time}) on this date (${parsedData.date}). Do you still want to confirm this booking and allow a double-booking?`
      );
      if (!confirmBooking) {
        return;
      }
    }

    // Save appointment
    addAppointment({
      customerId: customers.find(c => c.phone === parsedData.phone)?.id || 0,
      customerName: parsedData.clientName,
      staffId: parsedData.stylist?.id || 0,
      staffName: parsedData.stylist?.name || 'Stylist',
      serviceId: parsedData.service?.id || 0,
      serviceName: parsedData.service?.name || 'Service',
      branchId: parsedData.branchId,
      date: parsedData.date,
      time: parsedData.time,
      status: 'confirmed',
      source: parsedData.channel || 'whatsapp',
      amount: parsedData.service?.price || 0
    });

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Update the message status in waMessages
    setWaMessages(prev => prev.map(m => {
      if (m.id === parsedData.messageId) {
        return { ...m, status: 'approved' };
      }
      return m;
    }));

    // Append auto confirmation response to chat
    setWaMessages(prev => [
      ...prev,
      { 
        id: 'system-' + Date.now(),
        sender: 'system', 
        text: `✅ Auto-Booked confirmation dispatched via ${parsedData.channel?.toUpperCase() || 'WHATSAPP'}!\n\nDetails:\nClient: ${parsedData.clientName}\nService: ${parsedData.service?.name || 'Service'}\nStylist: ${parsedData.stylist?.name || 'Stylist'}\nTime: ${parsedData.time}\nBranch: ${branches.find(b => b.id === parsedData.branchId)?.name || 'SalonSync'}`, 
        time: timestamp,
        channel: parsedData.channel || 'whatsapp',
        status: 'dispatched'
      }
    ]);

    setParsedData(null);
  };

  const handleCopyScript = () => {
    const scriptTag = `<script src="https://cdn.salonsync.io/widget.js" data-branch="${selectedBranchId}"></script>\n<div id="salonsync-booking-widget"></div>`;
    navigator.clipboard.writeText(scriptTag);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyUrl = () => {
    const mockUrl = `https://api.salonsync.io/v1/webhooks/whatsapp/branch-${selectedBranchId}`;
    navigator.clipboard.writeText(mockUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const clearAllLogs = () => {
    setWaMessages([]);
    setWebhookLogs([]);
    setParsedData(null);
  };

  // Channel icons mapper
  const getChannelIcon = (chan) => {
    switch (chan) {
      case 'whatsapp':
        return <MessageSquare className="h-4.5 w-4.5 text-emerald-600" />;
      case 'instagram':
        return <Instagram className="h-4.5 w-4.5 text-pink-600" />;
      case 'voice':
        return <Phone className="h-4.5 w-4.5 text-amber-500" />;
      case 'web':
        return <Globe className="h-4.5 w-4.5 text-purple-650" />;
      default:
        return <Cpu className="h-4.5 w-4.5 text-slate-500" />;
    }
  };

  const totalIncomingSimulated = waMessages.filter(m => m.sender === 'client').length;
  const pendingIncomingCount = waMessages.filter(m => m.sender === 'client' && m.status === 'pending').length;

  return (
    <div className="p-8 space-y-8 max-w-[1650px] mx-auto select-none animate-slide-in">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex flex-wrap items-center gap-3">
            <span>Omnichannel Communications Hub</span>
            <span className="text-xs bg-purple-100 text-purple-700 font-extrabold px-3 py-1 rounded-full border border-purple-200">
              Active Branch: {activeBranch.name}
            </span>
          </h1>
          <p className="text-sm text-slate-455 mt-1 font-medium">
            Centralized omnipresent channel monitoring, AI Natural Language processing (NLP) parser, and Developer webhook endpoints.
          </p>
        </div>

        {/* Live Channel Sync Indicators */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-150">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200/60 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[10px] font-black uppercase text-slate-600">WhatsApp</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200/60 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            <Instagram className="h-3.5 w-3.5 text-pink-600" />
            <span className="text-[10px] font-black uppercase text-slate-600">Instagram</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200/60 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Phone className="h-3.5 w-3.5 text-amber-555" />
            <span className="text-[10px] font-black uppercase text-slate-600">Voice IVR</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200/60 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <Globe className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-[10px] font-black uppercase text-slate-600">Web Embed</span>
          </div>
        </div>
      </div>

      {/* 2. CHANNELS STATUS AND STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Streaming Agent</p>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-1.5">
              {isLiveStreaming ? 'Online & Active' : 'Offline'}
              {isLiveStreaming && <Radio className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />}
            </h3>
            <p className="text-[10px] text-slate-450 font-semibold">{totalIncomingSimulated} total messages processed</p>
          </div>
          <button 
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`cursor-pointer px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 border ${
              isLiveStreaming 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-255 hover:bg-emerald-100' 
                : 'bg-slate-50 text-slate-600 border-slate-255 hover:bg-slate-100'
            }`}
          >
            {isLiveStreaming ? 'Pause Agent' : 'Resume Agent'}
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending NLP Reviews</p>
          <h3 className="text-2xl font-black text-slate-850 mt-1 flex items-center gap-2">
            <span>{pendingIncomingCount}</span>
            {pendingIncomingCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </h3>
          <p className="text-[10px] text-slate-455 font-semibold">Requires admin check & booking approval</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outgoing Alert Success</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1">
            <span>100%</span>
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          </h3>
          <p className="text-[10px] text-slate-455 font-semibold">{notificationsLog.length} dispatched reminders successfully logged</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clear Simulation logs</p>
            <h3 className="text-xs font-bold text-slate-700">Wipe webhook history</h3>
            <p className="text-[9.5px] text-slate-405 font-medium">Resets database & chat list</p>
          </div>
          <button 
            onClick={clearAllLogs}
            className="cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2.5 rounded-xl transition-all"
            title="Wipe Logs"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* 3. MAIN OMNICHANNEL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Unified Live Event Stream (5/12 width) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[740px]">
          
          {/* Feed Filter Header */}
          <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest flex items-center space-x-1.5">
                <Activity className="h-4 w-4 text-purple-600 animate-pulse" />
                <span>Unified Live Message Stream</span>
              </span>
              <span className="text-[9.5px] font-black text-slate-400">
                {filteredMessages.length} Messages
              </span>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-1">
              {['all', 'whatsapp', 'instagram', 'voice'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setChannelFilter(filter)}
                  className={`cursor-pointer px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all border ${
                    channelFilter === filter
                      ? 'bg-purple-600 text-white border-purple-650'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Event Stream Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-slate-50/50">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-24 text-slate-400 flex flex-col items-center justify-center space-y-2">
                <AlertCircle className="h-10 w-10 text-slate-350" />
                <p className="text-xs font-bold">No incoming messages matching this channel filter.</p>
                <p className="text-[10px] text-slate-400">Trigger simulated events below to test.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMsgId === msg.id;
                const isPending = msg.status === 'pending';
                const isApproved = msg.status === 'approved';

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMsgId(msg.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 hover:shadow-sm ${
                      isSelected
                        ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-100'
                        : isPending 
                        ? 'bg-white border-slate-100 hover:border-slate-250'
                        : 'bg-white/80 border-slate-100 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Channel Icon Badge */}
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      msg.channel === 'whatsapp' ? 'bg-emerald-50 border-emerald-100' :
                      msg.channel === 'instagram' ? 'bg-pink-50 border-pink-100' :
                      msg.channel === 'voice' ? 'bg-amber-50 border-amber-100' :
                      'bg-purple-50 border-purple-100'
                    }`}>
                      {getChannelIcon(msg.channel)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1 text-left min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="font-extrabold text-slate-800 text-xs truncate">
                          {msg.clientName || 'Walk-in Guest'}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-bold shrink-0">{msg.time}</span>
                      </div>
                      
                      <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed">
                        {msg.text}
                      </p>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[9px] text-slate-400 font-bold font-mono">
                          {msg.phone || 'Unknown Phone'}
                        </span>
                        
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : isPending
                            ? 'bg-amber-55 text-amber-700 border border-amber-200 animate-pulse'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {isApproved ? 'Auto-Booked' : isPending ? 'Awaiting Approval' : 'Dispatched'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isFetchingMsg && (
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3 justify-center animate-pulse">
                <span className="h-2 w-2 bg-purple-500 rounded-full animate-ping"></span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  API Webhook receiving inbound packet...
                </span>
              </div>
            )}
          </div>

          {/* SIMULATOR TRIGER ACTIONS & INPUTS */}
          <div className="p-4 bg-white border-t border-slate-150 shrink-0 space-y-4">
            
            {/* Quick simulated triggers */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Quick Simulated Inbound Event Triggers
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => triggerChannelSimulation('whatsapp')}
                  className="cursor-pointer bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-755 border border-slate-200 hover:border-emerald-250 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-555" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => triggerChannelSimulation('instagram')}
                  className="cursor-pointer bg-white hover:bg-pink-50 text-slate-700 hover:text-pink-755 border border-slate-200 hover:border-pink-250 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Instagram className="h-3.5 w-3.5 text-pink-555" />
                  <span>Instagram</span>
                </button>

                <button
                  onClick={() => triggerChannelSimulation('voice')}
                  className="cursor-pointer bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-755 border border-slate-200 hover:border-amber-250 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Phone className="h-3.5 w-3.5 text-amber-555" />
                  <span>Voice Call</span>
                </button>
              </div>
            </div>

            {/* Custom message typing footer */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type customized text to test WhatsApp parser..."
                value={waInput}
                onChange={(e) => setWaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendWaMessage(waInput)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-purple-200 placeholder-slate-400"
              />
              <button
                onClick={() => handleSendWaMessage(waInput)}
                className="cursor-pointer bg-purple-650 hover:bg-purple-755 text-white p-3 rounded-xl shadow-md transition-all shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: AI Extraction Console & Developer Tools (7/12 width) */}
        <div className="lg:col-span-7 space-y-8 flex flex-col h-[740px]">
          
          {/* TOP BOX: AI Parser Console (Takes half height) */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between flex-1 relative overflow-hidden min-h-[350px]">
            <div className="absolute top-0 right-0 h-24 w-24 bg-purple-100/30 rounded-full blur-2xl"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center space-x-2 text-purple-700">
                <Sparkles className="h-5 w-5 text-purple-655 animate-pulse" />
                <h4 className="font-extrabold text-xs text-purple-900 uppercase tracking-widest">
                  AI Entity Extraction Console (NLP Engine)
                </h4>
              </div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase">
                Active Branch: {activeBranch.name}
              </span>
            </div>

            {/* AI Console Content */}
            {parsedData ? (
              <div className="flex-1 flex flex-col justify-between pt-4 min-h-0">
                
                {/* Visual Grid of Extracted Entities */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-left">
                  
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Profile</p>
                    <p className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                      <User className="h-4 w-4 text-slate-455 shrink-0" />
                      <span className="truncate">{parsedData.clientName}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact Phone</p>
                    <p className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                      <Phone className="h-4 w-4 text-slate-455 shrink-0" />
                      <span>{parsedData.phone}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Source Channel</p>
                    <p className="font-extrabold text-slate-800 flex items-center space-x-1.5 capitalize">
                      {getChannelIcon(parsedData.channel)}
                      <span>{parsedData.channel}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Extracted Service</p>
                    <p className="font-extrabold text-purple-700 flex items-center space-x-1.5">
                      <Scissors className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="truncate">{parsedData.service?.name || 'Service'}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Stylist Requested</p>
                    <p className="font-extrabold text-slate-850 flex items-center space-x-1.5">
                      <User className="h-4 w-4 text-slate-455 shrink-0" />
                      <span className="truncate">{parsedData.stylist?.name || 'Stylist'}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Extracted Hour Slot</p>
                    <p className="font-extrabold text-slate-850 flex items-center space-x-1.5">
                      <Clock className="h-4 w-4 text-slate-455 shrink-0" />
                      <span>{parsedData.time} ({parsedData.date})</span>
                    </p>
                  </div>

                </div>

                {/* Raw Transcript block */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-150 text-left">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Raw Inbound Text Transcript</p>
                  <p className="text-xs text-slate-650 font-semibold italic">
                    "{selectedMsg?.text}"
                  </p>
                </div>

                {/* Approve/Confirm Buttons */}
                <div className="flex space-x-3 pt-3.5">
                  <button
                    onClick={handleAutoBookConfirm}
                    className="cursor-pointer flex-1 bg-purple-600 hover:bg-purple-755 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-900/10 flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4.5 w-4.5" />
                    <span>Approve & Commit Auto-Booking</span>
                  </button>
                  <button
                    onClick={() => setSelectedMsgId('')}
                    className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
                  >
                    Dismiss
                  </button>
                </div>

              </div>
            ) : selectedMsg && selectedMsg.status === 'approved' ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 py-8">
                <CheckCircle className="h-16 w-16 text-emerald-605 bg-emerald-50 rounded-full p-2.5 border border-emerald-100 shadow-sm animate-bounce" style={{ animationDuration: '2.5s' }} />
                <div className="space-y-1 max-w-sm">
                  <h4 className="font-extrabold text-slate-850 text-sm">Booking Already Approved & Dispatched</h4>
                  <p className="text-xs text-slate-450 font-semibold leading-relaxed">
                    This reservation from {selectedMsg.clientName} has been successfully added to the appointments book.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs text-left max-w-md w-full space-y-1 font-semibold text-slate-600 shadow-inner">
                  <p>👤 Client: <span className="font-extrabold text-slate-850">{selectedMsg.clientName}</span></p>
                  <p>💇 Service: <span className="font-extrabold text-purple-750">{selectedMsg.service?.name || 'Service'}</span></p>
                  <p>📅 Schedule: <span className="font-extrabold text-slate-850">{selectedMsg.timeSlot || selectedMsg.time}</span></p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-12 text-slate-400">
                <Cpu className="h-14 w-14 text-slate-350 animate-pulse" />
                <h4 className="font-extrabold text-slate-800 text-sm">AI Parser Standby</h4>
                <p className="text-xs text-slate-455 font-semibold max-w-[280px]">
                  Select any pending incoming message card from the live feed to extract entities and verify slots.
                </p>
              </div>
            )}
          </div>

          {/* BOTTOM BOX: Developer Ledger / JSON Console (Takes other half height) */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[350px]">
            
            {/* Tab selector */}
            <div className="bg-slate-50 border-b border-slate-150 p-4 shrink-0 flex items-center justify-between">
              <div className="flex bg-slate-200/60 p-1 rounded-2xl space-x-1">
                <button
                  onClick={() => setActiveLedgerTab('payload')}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                    activeLedgerTab === 'payload' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                  }`}
                >
                  <Terminal className="h-4 w-4 text-emerald-500" />
                  <span>Real-time Webhook Payload</span>
                </button>
                
                <button
                  onClick={() => setActiveLedgerTab('audit')}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                    activeLedgerTab === 'audit' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                  }`}
                >
                  <FileText className="h-4 w-4 text-blue-650" />
                  <span>Dispatched Notifications</span>
                </button>
                
                <button
                  onClick={() => setActiveLedgerTab('developer')}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                    activeLedgerTab === 'developer' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                  }`}
                >
                  <Code className="h-4 w-4 text-purple-605" />
                  <span>API Integration Snippets</span>
                </button>
              </div>

              <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest hidden sm:inline">
                Dev Console
              </span>
            </div>

            {/* Content areas */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/20 p-5">
              
              {/* TAB 1: Monospace payload stream */}
              {activeLedgerTab === 'payload' && (
                <div className="space-y-4 text-left h-full flex flex-col min-h-0">
                  <div className="flex justify-between items-center text-slate-500 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5">
                      <Activity className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Live JSON Webhook Packet Stream</span>
                    </span>
                    <span className="text-[8px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded uppercase leading-none">
                      POST 200 OK
                    </span>
                  </div>
                  
                  <div className="bg-slate-900 rounded-2xl p-4 flex-1 overflow-y-auto font-mono text-[9px] text-emerald-400 space-y-3 flex flex-col select-text shadow-inner">
                    {webhookLogs.length === 0 ? (
                      <div className="text-slate-500 italic flex-1 flex items-center justify-center text-center text-[10px] leading-relaxed">
                        No inbound JSON payloads streaming yet.<br />Trigger a query using the Omnichannel channel triggers.
                      </div>
                    ) : (
                      webhookLogs.map((log, idx) => (
                        <pre key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed shadow-sm">
                          {log}
                        </pre>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Outgoing ledger */}
              {activeLedgerTab === 'audit' && (
                <div className="divide-y divide-slate-100 h-full flex flex-col min-h-0 text-left">
                  <div className="pb-3 flex justify-between items-center shrink-0">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Outgoing Alert Dispatch Log</p>
                    <span className="text-[9px] bg-slate-150 text-slate-655 font-bold px-2.5 py-0.5 rounded-full">
                      Last {notificationsLog.length} dispatches
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
                    {notificationsLog.length === 0 ? (
                      <div className="text-center py-16 text-slate-400 italic text-xs font-semibold">
                        No notifications recorded yet.
                      </div>
                    ) : (
                      notificationsLog.map((log) => (
                        <div key={log.id} className="py-4 space-y-2 animate-slide-in">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-xs">{log.customerName}</h4>
                              <p className="text-[10px] text-slate-400 font-semibold">{log.phone}</p>
                            </div>
                            
                            <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 ${
                              log.type === 'WhatsApp' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : log.type === 'Instagram'
                                ? 'bg-pink-50 text-pink-700 border border-pink-100'
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {log.type}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-semibold italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                            "{log.message}"
                          </p>

                          <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{log.timestamp}</span>
                            </span>
                            <span className="text-emerald-600 font-black">✓ Transmitted</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Developer configuration copy */}
              {activeLedgerTab === 'developer' && (
                <div className="space-y-5 text-left">
                  {/* Endpoint url */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Terminal className="h-4.5 w-4.5 text-slate-650 animate-pulse" />
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Dynamic Webhook URL</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Supply this destination URL to WhatsApp / Instagram developer portal integrations to receive raw JSON events in real-time.
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <code className="text-[9.5px] font-mono font-bold text-slate-600 break-all pr-2 select-text">
                        https://api.salonsync.io/v1/webhooks/whatsapp/branch-{selectedBranchId}
                      </code>
                      <button 
                        onClick={handleCopyUrl}
                        className="cursor-pointer text-slate-500 hover:text-purple-650 p-1.5 hover:bg-slate-200/50 rounded-lg transition-colors shrink-0"
                      >
                        {copiedUrl ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* SDK script block */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Code className="h-4.5 w-4.5 text-slate-600" />
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Embed Client Portal Script</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Insert this HTML block before the closing `&lt;/body&gt;` tag of your website.
                    </p>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between relative shadow-inner">
                      <pre className="text-[9.5px] font-mono text-slate-350 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text flex-1">
{`<script 
  src="https://cdn.salonsync.io/widget.js" 
  data-branch="${selectedBranchId}">
</script>
<div id="salonsync-booking-widget"></div>`}
                      </pre>
                      <button 
                        onClick={handleCopyScript}
                        className="cursor-pointer text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors shrink-0 ml-2"
                      >
                        {copiedScript ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Integrations;
