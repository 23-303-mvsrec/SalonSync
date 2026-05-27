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
  Trash2
} from 'lucide-react';

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
    isFetchingMsg,
    parseMessageNLP
  } = useApp();

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const activeBranchStaff = staff.filter(s => s.branchId === selectedBranchId);

  // --- TAB STATE MANAGEMENT ---
  const [activeInboxTab, setActiveInboxTab] = useState('whatsapp'); // whatsapp | website
  const [activeLedgerTab, setActiveLedgerTab] = useState('audit'); // audit | developer
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // --- WHATSAPP SIMULATOR STATE ---
  const [waInput, setWaInput] = useState('');

  // Pre-made simulation templates
  const sampleMessages = [
    "Book Men haircut with Ravi Kumar at 11:30",
    "I need a beard trim with Mohammed Irfan today at 2 PM",
    "Can you schedule a Bridal Makeup with Anjali Reddy at 9 AM?",
    "Hair Spa with Deepak Nair at 3 PM today please"
  ];

  const handleSendWaMessage = (text) => {
    if (!text.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Add client message
    const newMsgs = [...waMessages, { sender: 'client', text, time: timestamp }];
    setWaMessages(newMsgs);
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
              id: 'wamid.HBgLOTExMTExMTE1NTEVAgASGBQzQTBE...',
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

    // Process NLP
    setTimeout(() => {
      const parsed = parseMessageNLP(text);
      setParsedData(parsed);
    }, 450);
  };

  const handleAutoBookConfirm = () => {
    if (!parsedData) return;

    // Save appointment
    addAppointment({
      customerId: customers.find(c => c.phone === parsedData.phone)?.id || 0,
      customerName: parsedData.clientName,
      staffId: parsedData.stylist.id,
      staffName: parsedData.stylist.name,
      serviceId: parsedData.service.id,
      serviceName: parsedData.service.name,
      branchId: parsedData.branchId,
      date: parsedData.date,
      time: parsedData.time,
      status: 'confirmed',
      source: 'whatsapp',
      amount: parsedData.service.price
    });

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Append auto confirmation response to chat
    setWaMessages(prev => [
      ...prev,
      { 
        sender: 'system', 
        text: `✅ Appointment Confirmed & Booked!\n\nDetails:\nClient: ${parsedData.clientName}\nService: ${parsedData.service.name}\nStylist: ${parsedData.stylist.name}\nTime: ${parsedData.time}\nBranch: ${branches.find(b => b.id === parsedData.branchId)?.name || 'SalonSync'}`, 
        time: timestamp 
      }
    ]);

    setParsedData(null);
  };

  // --- WEBSITE WIDGET SIMULATOR STATE ---
  const [webCategory, setWebCategory] = useState('Hair');
  const [webServiceId, setWebServiceId] = useState('');
  const [webStaffId, setWebStaffId] = useState('');
  const [webName, setWebName] = useState('');
  const [webPhone, setWebPhone] = useState('');
  const [webTime, setWebTime] = useState('10:00');
  const [webSuccess, setWebSuccess] = useState(false);

  const webServicesFiltered = services.filter(s => s.category.toLowerCase() === webCategory.toLowerCase());

  useEffect(() => {
    if (webServicesFiltered.length > 0) {
      setWebServiceId(webServicesFiltered[0].id.toString());
    }
  }, [webCategory]);

  useEffect(() => {
    if (activeBranchStaff.length > 0) {
      setWebStaffId(activeBranchStaff[0].id.toString());
    }
  }, [selectedBranchId]);

  const handleWebSubmit = (e) => {
    e.preventDefault();
    if (!webName || !webPhone || !webServiceId || !webStaffId) {
      alert('Please fill out all fields on the booking widget.');
      return;
    }

    const selectedService = services.find(s => s.id === parseInt(webServiceId, 10));
    const selectedStaff = staff.find(s => s.id === parseInt(webStaffId, 10));

    if (!selectedService || !selectedStaff) return;

    addAppointment({
      customerId: customers.find(c => c.phone === webPhone.trim())?.id || 0,
      customerName: webName,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      branchId: selectedBranchId,
      date: '2026-05-26',
      time: webTime,
      status: 'pending',
      source: 'website',
      amount: selectedService.price
    });

    setWebSuccess(true);
    setTimeout(() => {
      setWebSuccess(false);
      setWebName('');
      setWebPhone('');
    }, 2500);
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

  // Stats Counters
  const totalIncomingSimulated = waMessages.filter(m => m.sender === 'client').length;
  const totalDeliveredDispatched = notificationsLog.length;
  const activeChannelCount = 3; // WhatsApp, Web Widget, Auto-SMS

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto select-none animate-slide-in">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Omnichannel Communications & APIs</span>
            <span className="text-xs bg-purple-100 text-purple-700 font-extrabold px-2.5 py-1 rounded-full border border-purple-200">
              Active Branch: {activeBranch.name}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your AI auto-booking assistant, customer facing web widgets, and check delivery status logs.
          </p>
        </div>
      </div>

      {/* 2. CHANNEL TELEMETRY OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: WhatsApp Concierge */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">AI WhatsApp Assistant</p>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{isLiveStreaming ? 'Online & Listening' : 'Paused'}</h3>
            <p className="text-[11px] text-slate-400 font-semibold">{totalIncomingSimulated} simulated queries logged</p>
          </div>
          <button 
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`cursor-pointer px-4 py-2 text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-200 border ${
              isLiveStreaming 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isLiveStreaming ? 'Disable AI' : 'Enable AI'}
          </button>
        </div>

        {/* Card 2: Web Integration */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Web Portal Booking Embed</p>
            </div>
            <h3 className="text-2xl font-black text-slate-800">Embed Active</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Integrates direct customer reservation flows</p>
          </div>
          <button 
            onClick={() => setActiveInboxTab('website')}
            className="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-2xl transition-all"
          >
            Preview Widget
          </button>
        </div>

        {/* Card 3: Messaging Ledger */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">SMS & WhatsApp Alerts</p>
            </div>
            <h3 className="text-2xl font-black text-slate-800">100% Dispatched</h3>
            <p className="text-[11px] text-slate-400 font-semibold">{totalDeliveredDispatched} notifications successfully triggered</p>
          </div>
          <button 
            onClick={() => setActiveLedgerTab('audit')}
            className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-2xl transition-all"
          >
            View Logs
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL LEFT (Col-span-7): Omnichannel Inbox */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[740px]">
          {/* Panel Selector Tabs */}
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between shrink-0">
            <div className="flex bg-slate-200/60 p-1 rounded-2xl space-x-1">
              <button
                onClick={() => setActiveInboxTab('whatsapp')}
                className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
                  activeInboxTab === 'whatsapp' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                }`}
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span>AI WhatsApp Concierge</span>
              </button>
              <button
                onClick={() => setActiveInboxTab('website')}
                className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
                  activeInboxTab === 'website' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                }`}
              >
                <Globe className="h-4 w-4 text-purple-600" />
                <span>Web Booking Preview</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest hidden sm:inline">
              Live Simulator Workspace
            </span>
          </div>

          {/* TAB 1: WhatsApp Chat View */}
          {activeInboxTab === 'whatsapp' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              
              {/* WhatsApp Messages Sandbox */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {waMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.sender === 'client' ? 'justify-start' : 'justify-end'} animate-slide-in`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'client' 
                        ? 'bg-white text-slate-700 rounded-tl-none border border-slate-200 border-l-4 border-l-emerald-500' 
                        : msg.sender === 'system'
                        ? 'bg-violet-50 text-violet-850 border border-violet-100 rounded-2xl font-medium'
                        : 'bg-emerald-600 text-white rounded-tr-none'
                    }`}>
                      <p className="font-semibold whitespace-pre-line">{msg.text}</p>
                      <span className={`text-[8px] text-right block mt-1 ${msg.sender === 'client' ? 'text-slate-400' : msg.sender === 'system' ? 'text-violet-400' : 'text-emerald-100'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {isFetchingMsg && (
                  <div className="flex justify-start animate-slide-in">
                    <div className="bg-white text-slate-400 rounded-2xl rounded-tl-none border border-slate-100 p-3.5 text-xs shadow-sm flex items-center space-x-2">
                      <span className="font-extrabold text-[9px] uppercase tracking-wider text-slate-400">Incoming Message</span>
                      <span className="flex space-x-1 pt-0.5">
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Structured Booking Proposal Box */}
                {parsedData && (
                  <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden animate-slide-in">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-violet-100/40 rounded-full blur-xl"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-violet-700">
                        <Sparkles className="h-4.5 w-4.5 animate-pulse text-purple-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-violet-850">Smart Assistant Booking Auto-Detect</span>
                      </div>
                      <span className="text-[8px] font-bold text-violet-650 bg-violet-100 px-2 py-0.5 rounded-md">
                        Confidence High
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Customer Profile</p>
                        <p className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{parsedData.clientName}</span>
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Contact Phone</p>
                        <p className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{parsedData.phone}</span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Service Category</p>
                        <p className="font-extrabold text-purple-700 flex items-center space-x-1.5">
                          <Scissors className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                          <span>{parsedData.service.name}</span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Stylist Assigned</p>
                        <p className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{parsedData.stylist.name}</span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Time Slot</p>
                        <p className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{parsedData.time} ({parsedData.date})</span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Destination Branch</p>
                        <p className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                          <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{activeBranch.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={handleAutoBookConfirm}
                        className="cursor-pointer flex-1 bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-purple-900/10 uppercase tracking-wider flex items-center justify-center space-x-2"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve & Book Now</span>
                      </button>
                      <button
                        onClick={() => setParsedData(null)}
                        className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-colors uppercase tracking-wider"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation triggers tray */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest flex items-center space-x-1">
                    <span>Quick Simulator Triggers</span>
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold">Click to mock incoming message</p>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[88px] overflow-y-auto pr-1">
                  {sampleMessages.map((msg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendWaMessage(msg)}
                      className="cursor-pointer bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200/80 hover:border-purple-200 text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input footer */}
              <div className="p-4 bg-slate-100/50 border-t border-slate-200 shrink-0 flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Simulate typing customized user message..."
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendWaMessage(waInput)}
                  className="flex-1 bg-white border border-slate-250 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-purple-200 placeholder-slate-400"
                />
                <button
                  onClick={() => handleSendWaMessage(waInput)}
                  className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl shadow-md transition-colors shrink-0"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Website Booking Simulator View */}
          {activeInboxTab === 'website' && (
            <div className="flex-1 p-6 bg-slate-50 flex flex-col items-center justify-center">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden flex flex-col">
                <div className="bg-purple-700 text-white p-4 text-center shrink-0">
                  <h4 className="font-black text-sm tracking-tight">Mock Booking Portal Widget</h4>
                  <p className="text-[10px] text-purple-200 font-semibold mt-0.5">Embed Preview (Active)</p>
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                  {webSuccess ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-slide-in">
                      <CheckCircle className="h-14 w-14 text-emerald-600 bg-emerald-50 rounded-full p-2" />
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">Appointment Scheduled!</h4>
                        <p className="text-xs text-slate-400 mt-1 font-semibold max-w-[260px] mx-auto">
                          Submitted successfully. You can track this pending booking inside the Appointments registry.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleWebSubmit} className="space-y-4 text-left">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block mb-1">Service Type</label>
                          <select
                            value={webCategory}
                            onChange={(e) => setWebCategory(e.target.value)}
                            className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                          >
                            <option value="Hair">Hair Care</option>
                            <option value="Color">Coloring</option>
                            <option value="Skin">Skincare</option>
                            <option value="Nails">Nails</option>
                            <option value="Makeup">Makeup</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block mb-1">Select Service</label>
                          <select
                            value={webServiceId}
                            onChange={(e) => setWebServiceId(e.target.value)}
                            className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                          >
                            {webServicesFiltered.map(s => (
                              <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block mb-1">Preferred Professional</label>
                          <select
                            value={webStaffId}
                            onChange={(e) => setWebStaffId(e.target.value)}
                            className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                          >
                            {activeBranchStaff.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block mb-1">Preferred Hour</label>
                          <select
                            value={webTime}
                            onChange={(e) => setWebTime(e.target.value)}
                            className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                          >
                            <option value="09:00">09:00 AM</option>
                            <option value="10:30">10:30 AM</option>
                            <option value="11:30">11:30 AM</option>
                            <option value="14:00">02:00 PM</option>
                            <option value="16:00">04:00 PM</option>
                            <option value="18:30">06:30 PM</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block">Your Information</label>
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={webName}
                          onChange={(e) => setWebName(e.target.value)}
                          className="w-full bg-white border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-750 outline-none placeholder-slate-400"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="10-digit Phone Number"
                          value={webPhone}
                          onChange={(e) => setWebPhone(e.target.value)}
                          className="w-full bg-white border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-750 outline-none placeholder-slate-400 mt-2"
                        />
                      </div>

                      <button
                        type="submit"
                        className="cursor-pointer w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors mt-2"
                      >
                        Confirm Booking
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANEL RIGHT (Col-span-5): Ledger & Developer Tools */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[740px]">
          {/* Tab Selector Header */}
          <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 flex items-center justify-between">
            <div className="flex bg-slate-200/60 p-1 rounded-2xl space-x-1">
              <button
                onClick={() => setActiveLedgerTab('audit')}
                className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
                  activeLedgerTab === 'audit' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                }`}
              >
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Dispatch Logs</span>
              </button>
              <button
                onClick={() => setActiveLedgerTab('developer')}
                className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
                  activeLedgerTab === 'developer' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                }`}
              >
                <Code className="h-4 w-4 text-purple-600" />
                <span>Developer Console</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest hidden sm:inline">
              Audit Center
            </span>
          </div>

          {/* TAB 1: Dispatch Message Audit Log */}
          {activeLedgerTab === 'audit' && (
            <div className="flex-1 p-5 overflow-y-auto divide-y divide-slate-100 min-h-0 bg-white">
              <div className="pb-3 flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-455 uppercase tracking-wider">Outgoing Notification Log</p>
                <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                  Showing latest {notificationsLog.length} runs
                </span>
              </div>
              {notificationsLog.length === 0 ? (
                <div className="text-center py-20 text-slate-400 italic text-xs font-semibold">
                  No notifications recorded yet.
                </div>
              ) : (
                notificationsLog.map((log) => (
                  <div key={log.id} className="py-4 space-y-2 animate-slide-in text-left">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs">{log.customerName}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{log.phone}</p>
                      </div>
                      
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                        log.type === 'WhatsApp' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {log.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-semibold italic bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      "{log.message}"
                    </p>

                    <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{log.timestamp}</span>
                      </span>
                      <span className="text-emerald-600 font-black">✓ Delivered</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Developer Settings & Embed script code */}
          {activeLedgerTab === 'developer' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50 min-h-0 text-left">
              
              {/* API Webhook Details */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Terminal className="h-4.5 w-4.5 text-slate-600" />
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Webhook Endpoint URL</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Provide this address to WhatsApp Business API Platform to receive instant alerts of customer queries.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <code className="text-[10px] font-mono font-bold text-slate-600 break-all pr-2">
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

              {/* Web widget code copy */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Code className="h-4.5 w-4.5 text-slate-600" />
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Embed Client Portal Script</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Embed this HTML snippet inside your official website to load the SalonSync interactive scheduler box widget.
                </p>
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start justify-between relative">
                  <pre className="text-[9px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text flex-1">
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

              {/* JSON Stream payload output */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-500 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                    <Terminal className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Real-time Payload Stream</span>
                  </span>
                  <span className="text-[8px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded uppercase leading-none">
                    POST 200 OK
                  </span>
                </div>
                
                <div className="bg-slate-900 rounded-2xl p-4 min-h-[160px] font-mono text-[9px] text-emerald-400 space-y-3 flex flex-col select-text">
                  {webhookLogs.length === 0 ? (
                    <div className="text-slate-500 italic flex-1 flex items-center justify-center text-center text-[10px] leading-relaxed">
                      No incoming payloads streaming yet.<br />Trigger a query using the WhatsApp Concierge simulator.
                    </div>
                  ) : (
                    webhookLogs.map((log, idx) => (
                      <pre key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
                        {log}
                      </pre>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Integrations;
