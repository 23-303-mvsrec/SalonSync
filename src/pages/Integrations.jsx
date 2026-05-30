import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
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
  Activity,
  ShieldCheck,
  Database,
  RefreshCw,
  Layers,
  ArrowRight,
  Settings2,
  Bell,
  Sliders,
  Sparkle,
  ChevronDown,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Volume2,
  Wifi,
  Zap,
  Star,
  Hash
} from 'lucide-react';

const InstagramIcon = (props) => (
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

// ============================================================
// VOICE IVR CALL SIMULATOR COMPONENT
// ============================================================
const IVRCallScreen = ({ services, staff, simProfileName, addAppointment, currentDate, selectedBranchId }) => {
  const [callState, setCallState] = useState('idle'); // idle | ringing | active | ended
  const [ivrStep, setIvrStep] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [booking, setBooking] = useState({ category: null, service: null, stylist: null, time: null });
  const durationRef = useRef(null);
  const chatEndRef = useRef(null);

  const IVR_STEPS = [
    {
      id: 0, type: 'ivr',
      text: 'Welcome to SalonSync Luxury Booking Line! \ud83c\udf38 For English, press 1. For Hindi, press 2.',
      options: [{ key: '1', label: 'English', next: 1 }, { key: '2', label: '\u0939\u093f\u0902\u0926\u0940', next: 1 }]
    },
    {
      id: 1, type: 'ivr',
      text: 'Please select a treatment category:\n\n1. Hair Care\n2. Coloring Services\n3. Skincare & Facials\n4. Nail Art\n5. Bridal Makeup',
      options: [
        { key: '1', label: 'Hair Care', data: { category: 'Hair' } },
        { key: '2', label: 'Coloring', data: { category: 'Color' } },
        { key: '3', label: 'Skincare', data: { category: 'Skin' } },
        { key: '4', label: 'Nail Art', data: { category: 'Nails' } },
        { key: '5', label: 'Makeup', data: { category: 'Makeup' } }
      ]
    },
    {
      id: 2, type: 'service', text: 'Great! Fetching available services...'
    },
    {
      id: 3, type: 'stylist', text: 'Excellent! Connecting to our stylist directory...'
    },
    {
      id: 4, type: 'time',
      text: 'Select a time slot for today:\n\n1. 10:00 AM\n2. 11:30 AM\n3. 01:00 PM\n4. 02:30 PM\n5. 04:00 PM\n6. 06:30 PM',
      options: [
        { key: '1', label: '10:00 AM', data: { time: '10:00' } },
        { key: '2', label: '11:30 AM', data: { time: '11:30' } },
        { key: '3', label: '01:00 PM', data: { time: '13:00' } },
        { key: '4', label: '02:30 PM', data: { time: '14:30' } },
        { key: '5', label: '04:00 PM', data: { time: '16:00' } },
        { key: '6', label: '06:30 PM', data: { time: '18:30' } }
      ]
    }
  ];

  const addTranscript = (msg) => {
    setTranscript(prev => [...prev, { id: Date.now(), ...msg }]);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const startCall = () => {
    setCallState('ringing');
    setTranscript([]);
    setBooking({ category: null, service: null, stylist: null, time: null });
    setIvrStep(0);

    setTimeout(() => {
      setCallState('active');
      setCallDuration(0);
      durationRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);

      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);

      addTranscript({ sender: 'ivr', text: IVR_STEPS[0].text });
    }, 2000);
  };

  const endCall = () => {
    clearInterval(durationRef.current);
    setCallState('ended');
    addTranscript({ sender: 'system', text: '\ud83d\udd34 Call disconnected. Thank you for calling SalonSync!' });
    setTimeout(() => {
      setCallState('idle');
      setIvrStep(0);
      setCallDuration(0);
    }, 3000);
  };

  const handleKeyPress = async (key, label) => {
    addTranscript({ sender: 'user', text: `\u260e\ufe0f Pressed: ${key} — ${label}` });
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 1500);

    if (ivrStep === 0) {
      // Language selection → go to category
      setTimeout(() => {
        setIvrStep(1);
        addTranscript({ sender: 'ivr', text: IVR_STEPS[1].text });
      }, 800);
    } else if (ivrStep === 1) {
      // Category selected
      const opt = IVR_STEPS[1].options.find(o => o.key === key);
      const cat = opt?.data?.category || 'Hair';
      const filtered = services.filter(s => s.category.toLowerCase() === cat.toLowerCase());
      setBooking(prev => ({ ...prev, category: cat, _services: filtered }));

      const serviceText = `You selected ${cat} Care. Please choose a service:\n\n` +
        filtered.slice(0, 5).map((s, i) => `${i + 1}. ${s.name} (₹${s.price})`).join('\n') +
        `\n\nPress the corresponding number.`;

      setTimeout(() => {
        setIvrStep(2);
        addTranscript({ sender: 'ivr', text: serviceText });
      }, 800);
    } else if (ivrStep === 2) {
      // Service selected
      const idx = parseInt(key, 10) - 1;
      const availableServices = booking._services || services.filter(s => s.category.toLowerCase() === (booking.category || 'hair').toLowerCase());
      const selectedService = availableServices[idx] || availableServices[0];

      const branchStaff = staff.filter(s => s.branchId === (selectedBranchId || 1));
      setBooking(prev => ({ ...prev, service: selectedService, _staff: branchStaff }));

      const stylistText = `${selectedService.name} selected! Choose your preferred stylist:\n\n` +
        branchStaff.slice(0, 5).map((s, i) => `${i + 1}. ${s.name} (${s.role})`).join('\n') +
        `\n\nPress the corresponding number.`;

      setTimeout(() => {
        setIvrStep(3);
        addTranscript({ sender: 'ivr', text: stylistText });
      }, 800);
    } else if (ivrStep === 3) {
      // Stylist selected
      const idx = parseInt(key, 10) - 1;
      const availableStaff = booking._staff || staff.filter(s => s.branchId === (selectedBranchId || 1));
      const selectedStylist = availableStaff[idx] || availableStaff[0];
      setBooking(prev => ({ ...prev, stylist: selectedStylist }));

      setTimeout(() => {
        setIvrStep(4);
        addTranscript({ sender: 'ivr', text: IVR_STEPS[4].text });
      }, 800);
    } else if (ivrStep === 4) {
      // Time selected → CONFIRM BOOKING
      const opt = IVR_STEPS[4].options.find(o => o.key === key);
      const selectedTime = opt?.data?.time || '14:30';
      const finalBooking = { ...booking, time: selectedTime };
      setBooking(finalBooking);

      const confirmText = `\ud83c\udf89 Booking Confirmed!\n\nService: ${finalBooking.service?.name || 'Haircut'}\nStylist: ${finalBooking.stylist?.name || 'Ravi Kumar'}\nTime: ${opt?.label || selectedTime} today\nBooking ID: #${Date.now().toString().slice(-6)}\n\nAn SMS confirmation will be sent. Thank you for choosing SalonSync!`;

      setTimeout(async () => {
        addTranscript({ sender: 'ivr', text: confirmText });
        setIvrStep(5);

        // Actually save the appointment!
        try {
          await addAppointment({
            customerId: 0,
            customerName: simProfileName || 'IVR Customer',
            staffId: finalBooking.stylist?.id || 1,
            staffName: finalBooking.stylist?.name || 'Stylist',
            serviceId: finalBooking.service?.id || 1,
            serviceName: finalBooking.service?.name || 'Haircut',
            branchId: selectedBranchId || 1,
            date: currentDate,
            time: selectedTime,
            status: 'confirmed',
            source: 'voice',
            amount: finalBooking.service?.price || 300
          });
        } catch (e) {
          console.error('IVR booking save error:', e);
        }

        // Also log to wa_messages for the inbox
        try {
          await fetch('/api/webhooks/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientName: simProfileName || 'IVR Customer',
              phone: '9000000000',
              text: `IVR Call Booking: ${finalBooking.service?.name} with ${finalBooking.stylist?.name} at ${selectedTime}`,
              channel: 'voice',
              branchId: selectedBranchId || 1,
              date: currentDate
            })
          });
        } catch (e) { /* swallow */ }

        setTimeout(() => endCall(), 3000);
      }, 800);
    }
  };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const currentStepOptions = () => {
    if (ivrStep === 0) return IVR_STEPS[0].options;
    if (ivrStep === 1) return IVR_STEPS[1].options;
    if (ivrStep === 2) {
      const filtered = booking._services || services.filter(s => s.category.toLowerCase() === (booking.category || 'hair').toLowerCase());
      return filtered.slice(0, 5).map((s, i) => ({ key: String(i + 1), label: s.name }));
    }
    if (ivrStep === 3) {
      const bStaff = booking._staff || staff.filter(s => s.branchId === (selectedBranchId || 1));
      return bStaff.slice(0, 5).map((s, i) => ({ key: String(i + 1), label: s.name }));
    }
    if (ivrStep === 4) return IVR_STEPS[4].options;
    return [];
  };

  // IDLE STATE
  if (callState === 'idle') {
    return (
      <div className="flex-1 rounded-[32px] bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center space-y-6 px-6">
        <div className="space-y-3 text-center">
          <div className="h-20 w-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto">
            <Phone className="h-9 w-9 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-black text-sm">Twilio IVR Simulator</h3>
            <p className="text-slate-400 text-[10px] font-semibold mt-1 leading-relaxed">
              Simulate a real voice call booking via Interactive Voice Response system
            </p>
          </div>
        </div>

        <div className="w-full space-y-2 text-left">
          {[
            { icon: <Mic className="h-3 w-3 text-amber-400" />, text: 'Real-time IVR speech simulation' },
            { icon: <Hash className="h-3 w-3 text-amber-400" />, text: 'DTMF keypad navigation' },
            { icon: <Zap className="h-3 w-3 text-amber-400" />, text: 'Auto-books to SQLite DB' },
            { icon: <Activity className="h-3 w-3 text-amber-400" />, text: 'Appears in Omnichannel Inbox' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
              {item.icon}
              <span className="text-slate-300 text-[10px] font-semibold">{item.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={startCall}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold py-4 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <PhoneCall className="h-4 w-4" />
          <span>Initiate IVR Call Demo</span>
        </button>
      </div>
    );
  }

  // RINGING STATE
  if (callState === 'ringing') {
    return (
      <div className="flex-1 rounded-[32px] bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping scale-150"></div>
          <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping scale-125" style={{ animationDelay: '0.3s' }}></div>
          <div className="h-24 w-24 rounded-full bg-amber-500 flex items-center justify-center relative shadow-2xl shadow-amber-500/30">
            <Phone className="h-10 w-10 text-white" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-white font-black text-base">SalonSync Booking Line</p>
          <p className="text-amber-300 text-xs font-bold animate-pulse">Connecting IVR system...</p>
          <p className="text-slate-500 text-[10px]">1800-SALONSYNC</p>
        </div>
      </div>
    );
  }

  // ACTIVE / ENDED CALL
  return (
    <div className="flex-1 rounded-[32px] bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Call Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm px-4 pt-10 pb-4 flex items-center justify-between shrink-0">
        <div>
          <p className="text-white font-black text-xs">SalonSync IVR Line</p>
          <p className={`text-[9px] font-bold ${callState === 'ended' ? 'text-rose-400' : 'text-amber-300'}`}>
            {callState === 'ended' ? 'Call Ended' : `\u25cf Calling... ${formatDuration(callDuration)}`}
          </p>
        </div>

        {/* Audio wave animation */}
        <div className="flex items-end gap-0.5 h-6">
          {[3, 6, 4, 8, 5, 7, 3, 6].map((h, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full transition-all ${callState === 'active' ? 'bg-amber-400' : 'bg-slate-600'}`}
              style={{
                height: callState === 'active' ? `${h + Math.random() * 4}px` : '2px',
                animation: callState === 'active' ? `pulse ${0.3 + i * 0.05}s ease-in-out infinite alternate` : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* IVR Transcript */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {transcript.map((msg, idx) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-[9.5px] leading-relaxed whitespace-pre-wrap shadow-sm font-semibold ${msg.sender === 'user'
              ? 'bg-amber-500 text-white rounded-tr-sm'
              : msg.sender === 'system'
                ? 'bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-xl text-center w-full'
                : 'bg-slate-700 text-slate-200 border border-slate-600 rounded-tl-sm'
              }`}>
              {msg.sender === 'ivr' && <span className="text-amber-400 font-black text-[8px] block mb-0.5 uppercase tracking-wider">\ud83d\udd0a IVR System</span>}
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* IVR Action Buttons / Keypad */}
      {callState === 'active' && ivrStep < 5 && (
        <div className="px-3 pb-3 space-y-2 shrink-0">
          <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider text-center">Press to respond</p>
          <div className="grid grid-cols-2 gap-1.5">
            {currentStepOptions().map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleKeyPress(opt.key, opt.label)}
                className="bg-slate-700 hover:bg-amber-500 text-white text-[9px] font-extrabold py-2 px-2 rounded-xl transition-all cursor-pointer border border-slate-600 hover:border-amber-400 text-left flex items-center gap-1.5 shadow-sm"
              >
                <span className="h-4 w-4 bg-slate-600 rounded-full flex items-center justify-center text-[8px] font-black shrink-0">{opt.key}</span>
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={endCall}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-1"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

const Integrations = () => {
  const {
    selectedBranchId,
    services,
    staff,
    customers,
    appointments,
    addAppointment,
    addCustomer,
    notificationsLog,
    branches,
    waMessages,
    setWaMessages,
    webhookLogs,
    setWebhookLogs,
    isLiveStreaming,
    setIsLiveStreaming,
    updateWaMessageStatus,
    wipeLogs,
    currentDate,
    settings,
    updateSettings,
    fetchDatabaseState
  } = useApp();

  const navigate = useNavigate();
  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  // --- CORE VIEW STATE ---
  // inbox (Omnichannel Inbox & AI Hub) | credentials (Webhook Setup & Keys)
  const [activeTab, setActiveTab] = useState('inbox');
  const [activeLedgerTab, setActiveLedgerTab] = useState('payload');

  // --- FILTER & SEARCH ---
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedMsgId, setSelectedMsgId] = useState('');

  // --- PERSISTED SETTINGS FORM STATE ---
  const [formValues, setFormValues] = useState({
    whatsapp_phone_number_id: '',
    whatsapp_business_id: '',
    whatsapp_access_token: '',
    whatsapp_verify_token: 'salonsync_verify_token',
    instagram_page_id: '',
    instagram_access_token: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_number: '',
    twilio_ivr_greeting: 'Welcome to SalonSync luxury booking desk. Please speak your name, preferred stylist, and timing.',
    discord_webhook_url: '',
    widget_theme_color: '#6d28d9',
    widget_show_stylist: 'true',
    gemini_api_key: ''
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [discordTesting, setDiscordTesting] = useState(false);
  const [discordTestStatus, setDiscordTestStatus] = useState(null);

  // --- SIMULATION TRIGGERS ---
  const [simChannel, setSimChannel] = useState('whatsapp');
  const [simProfileName, setSimProfileName] = useState('Arjun Singh');
  const [simProfilePhone, setSimProfilePhone] = useState('9222222222');
  const [customSimText, setCustomSimText] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [aiStatus, setAiStatus] = useState({ configured: false, checked: false });
  const [lastBookingConfirmed, setLastBookingConfirmed] = useState(null); // { service, stylist, time, client }

  // Check AI status on mount
  useEffect(() => {
    fetch('/api/ai/status')
      .then(r => r.json())
      .then(data => setAiStatus({ configured: data.configured, checked: true }))
      .catch(() => setAiStatus({ configured: false, checked: true }));
  }, [formValues.gemini_api_key]);


  // Sync settings database values to React Form
  useEffect(() => {
    if (settings) {
      setFormValues(prev => ({
        ...prev,
        ...settings
      }));
    }
  }, [settings]);

  // LIVE POLLING: auto-refresh messages every 3 seconds when on inbox tab
  useEffect(() => {
    if (activeTab !== 'inbox') return;
    const poll = setInterval(async () => {
      try {
        const msgs = await fetch('/api/wa-messages').then(r => r.json());
        setWaMessages(msgs);
      } catch (e) { /* silent */ }
    }, 3000);
    return () => clearInterval(poll);
  }, [activeTab]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    const success = await updateSettings(formValues);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleTestDiscord = async () => {
    setDiscordTesting(true);
    setDiscordTestStatus(null);
    try {
      const res = await fetch('/api/settings/test-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discord_webhook_url: formValues.discord_webhook_url })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscordTestStatus({ success: true, msg: "Test embed successfully dispatched to Discord!" });
      } else {
        setDiscordTestStatus({ success: false, msg: data.error || "Failed to dispatch test." });
      }
    } catch (e) {
      setDiscordTestStatus({ success: false, msg: "Failed to connect to backend server." });
    } finally {
      setDiscordTesting(false);
    }
  };

  // --- COPYING HELPERS ---
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const handleCopyScript = () => {
    const scriptTag = `<script src="http://localhost:5173/widget.js" data-branch="${selectedBranchId}"></script>\n<div id="salonsync-booking-widget"></div>`;
    navigator.clipboard.writeText(scriptTag);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyDraft = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // --- UNIFIED MESSAGE STACK FILTERING ---
  // Filter: only show client messages that have meaningful content (not nav commands)
  const filteredMessages = waMessages
    .filter(m => m.sender === 'client')
    .filter(m => channelFilter === 'all' || m.channel === channelFilter)
    .filter(m => {
      const text = (m.text || '').trim().toLowerCase();
      if (!text) return false;
      // Hide pure single-digit numbers (IVR/chatbot navigation inputs) and pure control commands
      const isNavOnly = /^[1-9]$/.test(text) ||
        text === 'restart booking session' ||
        text === 'restart';
      return !isNavOnly;
    })
    .sort((a, b) => b.id.localeCompare(a.id));

  // Active selected message details
  const selectedMsg = waMessages.find(m => m.id === selectedMsgId);

  // Parse details for the center console
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    if (selectedMsg && selectedMsg.sender === 'client') {
      setParsedData({
        messageId: selectedMsg.id,
        clientName: selectedMsg.clientName || 'Guest Client',
        phone: selectedMsg.phone || '9888877777',
        stylist: selectedMsg.stylist,
        service: selectedMsg.service,
        time: selectedMsg.timeSlot || '12:00',
        date: selectedMsg.date || currentDate,
        branchId: selectedMsg.branchId || 1,
        channel: selectedMsg.channel || 'whatsapp',
        status: selectedMsg.status
      });
    } else {
      setParsedData(null);
    }
  }, [selectedMsgId, waMessages, currentDate]);

  const ragCustomer = parsedData ? customers.find(c => c.phone === parsedData.phone || c.name.toLowerCase() === parsedData.clientName.toLowerCase()) : null;
  const ragService = parsedData ? (services.find(s => s.id === parsedData.service?.id) || parsedData.service) : null;
  const ragStaff = parsedData ? (staff.find(s => s.id === parsedData.stylist?.id) || parsedData.stylist) : null;

  const getClientRAGNotes = (name) => {
    const hash = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const notes = [
      "Prefers premium organic shampoo. Enjoys side parting styling. Typically orders green tea during visits. Sensitive skin, use hypoallergenic products.",
      "Prefers mild blow dry. Likes classic taper sideburns. Always requests chamomile tea. Hard-wax preferred for skin treatments.",
      "Enjoys hair wash with cold water. Requests magazine or iPad during color process. Prefers black coffee. Sensitive scalp, avoid harsh bleach.",
      "Requests Ravi Kumar for hair styling, Vikram for nail treatments. Enjoys peppermint tea. Prefers minimal styling product (matte finish)."
    ];
    return notes[hash % notes.length];
  };

  const getRAGDraftReply = (data) => {
    if (!data) return "";
    const name = data.clientName || "there";
    const service = data.service?.name || "service";
    const staff = data.stylist?.name || "stylist";
    const time = data.time || "scheduled time";
    const channel = data.channel || "whatsapp";

    if (channel === 'whatsapp') {
      return `Hi ${name}! 🌸 We have processed your request for a ${service} with ${staff} today at ${time}. Your booking is officially registered and confirmed at our Banjara Hills center. Looking forward to seeing you! - SalonSync Admin`;
    } else if (channel === 'instagram') {
      return `Hi ${name}! Thanks for reaching out via Instagram DM. 💅 Your ${service} with ${staff} is scheduled for today at ${time}. Everything is confirmed. See you soon! ✨`;
    } else {
      return `[SMS/Voice Confirmation] Hello ${name}, your booking request for ${service} with stylist ${staff} today at ${time} has been accepted. Looking forward to serving you!`;
    }
  };

  // --- CONFIRM & AUTO-BOOK METHOD (Salon Manager action) ---
  const handleAutoBookConfirm = async () => {
    if (!parsedData) return;

    // Double booking check
    const isSlotBooked = appointments.some(a =>
      a.staffId === (parsedData.stylist?.id || 0) &&
      a.date === parsedData.date &&
      a.time === parsedData.time &&
      a.status !== 'cancelled'
    );

    if (isSlotBooked) {
      const confirmDouble = window.confirm(
        `Stylist ${parsedData.stylist?.name || 'Stylist'} has another appointment scheduled at ${parsedData.time} on ${parsedData.date}. Do you want to proceed and double-book?`
      );
      if (!confirmDouble) return;
    }

    // Save appointment
    let customerId = customers.find(c => c.phone === parsedData.phone)?.id || 0;
    if (customerId === 0 && parsedData.phone) {
      try {
        const newCust = await addCustomer({
          name: parsedData.clientName,
          phone: parsedData.phone,
          preferredBranch: parsedData.branchId || selectedBranchId
        });
        if (newCust) {
          customerId = newCust.id;
        }
      } catch (err) {
        console.error("Failed to automatically register customer:", err);
      }
    }

    await addAppointment({
      customerId,
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

    // Update webhook message status to approved
    await updateWaMessageStatus(parsedData.messageId, 'approved');

    // Add confirmation system message back to DB log
    const botMsgId = 'bot-' + Date.now();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const replyText = `🎉 **Booking Confirmed!**\n\nYour appointment for ${parsedData.service?.name} with ${parsedData.stylist?.name} on ${parsedData.date} at ${parsedData.time} has been approved and registered.`;

    await fetch('/api/wa-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: botMsgId,
        sender: 'system',
        text: replyText,
        time: timestamp,
        channel: parsedData.channel,
        status: 'dispatched',
        clientName: parsedData.clientName,
        phone: parsedData.phone,
        service: parsedData.service,
        stylist: parsedData.stylist,
        date: parsedData.date,
        timeSlot: parsedData.time,
        branchId: parsedData.branchId
      })
    });

    // Reload messages
    const msgs = await fetch('/api/wa-messages').then(r => r.json());
    setWaMessages(msgs);

    // Deep link action parameters (direct user back to calendar if clicked)
    const params = new URLSearchParams();
    if (parsedData.stylist?.id) params.set('staffId', parsedData.stylist.id);
    if (parsedData.date) params.set('date', parsedData.date);
    if (parsedData.time) params.set('time', parsedData.time);

    // Select the approved message again to show success state
    setSelectedMsgId(parsedData.messageId);
  };

  // --- GEMINI AI SIMULATOR ---

  const refreshMessages = async () => {
    try {
      const msgs = await fetch('/api/wa-messages').then(r => r.json());
      setWaMessages(msgs);
      return msgs;
    } catch (e) { return null; }
  };

  const handleSendSimulatedMessage = async (textToSend) => {
    if (!textToSend?.trim() || simulating) return;
    setSimulating(true);
    setCustomSimText('');

    try {
      // Use the Gemini AI endpoint — it handles everything server-side
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: simProfilePhone,
          message: textToSend.trim(),
          channel: simChannel === 'voice' ? 'whatsapp' : simChannel,
          branchId: selectedBranchId,
          clientName: simProfileName
        })
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('AI chat error:', data);
      }

      // If booking was confirmed by AI, update local appointments state too
      if (data.isComplete && data.appointment) {
        setLastBookingConfirmed(data.bookingData);
        // Refresh appointments and messages in context
        try {
          await fetchDatabaseState();
        } catch (e) { }
      }

      // Refresh messages from DB (server already wrote both client + bot messages)
      const msgs = await refreshMessages();
      if (msgs) {
        const clientMsgs = msgs.filter(m => m.sender === 'client' && m.phone === simProfilePhone)
          .sort((a, b) => b.id.localeCompare(a.id));
        if (clientMsgs.length > 0) setSelectedMsgId(clientMsgs[0].id);
      }

      // Also refresh after 1s to pick up any async updates
      setTimeout(refreshMessages, 1000);

    } catch (err) {
      console.error('Simulator error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleRestartSession = async () => {
    try {
      await fetch('/api/ai/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: simProfilePhone, channel: simChannel })
      });
      setLastBookingConfirmed(null);
      // Refresh AI status
      const s = await fetch('/api/ai/status').then(r => r.json());
      setAiStatus({ configured: s.configured, checked: true });
    } catch (e) { }
    // Trigger a greeting
    await handleSendSimulatedMessage('hello');
  };

  const simChannel_forFilter = simChannel === 'voice' ? 'voice' : simChannel; // explicit
  const simChatHistory = waMessages
    .filter(m => m.phone === simProfilePhone)
    .filter(m => {
      // For voice channel, show voice messages; otherwise show whatsapp/instagram by channel
      if (simChannel === 'voice') return m.channel === 'voice';
      return m.channel === simChannel;
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  let quickReplies = [];
  const lastMsg = simChatHistory[simChatHistory.length - 1];
  if (lastMsg && lastMsg.sender === 'system') {
    const lines = lastMsg.text.split('\n');
    lines.forEach(line => {
      const match = line.match(/^\d+\.\s+(.+)$/);
      if (match) {
        quickReplies.push(match[1]);
      }
    });
  }


  const getChannelIcon = (chan) => {
    switch (chan) {
      case 'whatsapp':
        return <MessageSquare className="h-4.5 w-4.5 text-emerald-500" />;
      case 'instagram':
        return <InstagramIcon className="h-4.5 w-4.5 text-pink-500" />;
      case 'voice':
        return <Phone className="h-4.5 w-4.5 text-amber-500" />;
      case 'web':
        return <Globe className="h-4.5 w-4.5 text-indigo-500" />;
      default:
        return <Cpu className="h-4.5 w-4.5 text-slate-500" />;
    }
  };

  const clearAllLogs = async () => {
    await wipeLogs();
    setParsedData(null);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1650px] mx-auto select-none animate-slide-in text-left">

      {/* 1. HEADER CONTROL BANNER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-purple-100 flex items-center justify-center">
              <Layers className="h-4.5 w-4.5 text-purple-700" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Omnichannel Booking Management Hub</h1>
          </div>
          <p className="text-xs text-slate-450 font-semibold leading-relaxed">
            Consolidate client reservations from WhatsApp, Instagram, Twilio Voice calls, and Web Booking portals. Review AI parsed entities and confirm appointments instantly.
          </p>
        </div>

        {/* Telemetry Status dot */}
        <div className="flex items-center space-x-4 bg-slate-50 border border-slate-150 px-4 py-2.5 rounded-2xl shrink-0">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">Omnichannel Feed: Listening</span>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <span className="text-[10px] font-black text-purple-700 bg-purple-55 px-2.5 py-0.5 rounded-md border border-purple-100 uppercase">
            Active Center: {activeBranch.name}
          </span>
        </div>
      </div>

      {/* 2. TAB MENU */}
      <div className="flex border-b border-slate-200 gap-4">
        {[
          { id: 'inbox', label: '📥 Omnichannel Inbox & AI Hub', desc: 'Manage incoming messages stack' },
          { id: 'credentials', label: '⚙️ Gateway Connection settings', desc: 'Webhook verification & API credentials' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer pb-4 px-2 text-left border-b-2 transition-all space-y-1 relative ${activeTab === tab.id
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <div className="font-extrabold text-sm flex items-center gap-1.5">
              <span>{tab.label}</span>
              {tab.id === 'inbox' && filteredMessages.filter(m => m.status === 'pending').length > 0 && (
                <span className="bg-amber-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full leading-none">
                  {filteredMessages.filter(m => m.status === 'pending').length}
                </span>
              )}
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase leading-none tracking-wide">{tab.desc}</p>
          </button>
        ))}
      </div>

      {/* 3. WORKSPACE PORTALS */}
      <div>

        {/* A. OMNICHANNEL INBOX & AI HUB */}
        {activeTab === 'inbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* LEFT COLUMN: Inbound Messages stack Feed (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">

              {/* Stack Feed Filters */}
              <div className="bg-slate-50 border-b border-slate-150 p-4 shrink-0 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest flex items-center space-x-1.5">
                    <Activity className="h-4 w-4 text-purple-600 animate-pulse" />
                    <span>Inbound Messaging Queue</span>
                  </span>
                  <span className="text-[9.5px] font-black text-slate-400">
                    {filteredMessages.length} Messages
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'all', label: 'All Channels' },
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: 'instagram', label: 'Instagram' },
                    { id: 'voice', label: 'Voice IVR' }
                  ].map(chan => (
                    <button
                      key={chan.id}
                      onClick={() => setChannelFilter(chan.id)}
                      className={`cursor-pointer px-2.5 py-1.5 text-[9.5px] font-extrabold uppercase tracking-wider rounded-lg transition-all border ${channelFilter === chan.id
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {chan.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Card Stack List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-slate-50/50">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-28 text-slate-400 flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="h-10 w-10 text-slate-300" />
                    <p className="text-xs font-bold">No incoming webhook packets yet.</p>
                    <p className="text-[10px] text-slate-450">Use the Demo simulation Panel on the right to inject client text bookings.</p>
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
                        className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-3 hover:shadow-sm ${isSelected
                          ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-100'
                          : isPending
                            ? 'bg-white border-slate-100 hover:border-slate-200'
                            : 'bg-white/80 border-slate-100 opacity-80 hover:opacity-100'
                          }`}
                      >
                        {/* Channel Badge Icon */}
                        <div className={`p-2.5 rounded-xl border shrink-0 ${msg.channel === 'whatsapp' ? 'bg-emerald-50 border-emerald-100' :
                          msg.channel === 'instagram' ? 'bg-pink-50 border-pink-100' :
                            msg.channel === 'voice' ? 'bg-amber-50 border-amber-100' :
                              'bg-purple-50 border-purple-100'
                          }`}>
                          {getChannelIcon(msg.channel)}
                        </div>

                        {/* Card snippet content */}
                        <div className="flex-1 space-y-1 text-left min-w-0">
                          <div className="flex justify-between items-center gap-2">
                            <h4 className="font-extrabold text-slate-800 text-xs truncate">
                              {msg.clientName || 'Guest User'}
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

                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : isPending
                                ? 'bg-amber-55 text-amber-705 border border-amber-200 animate-pulse'
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                              {isApproved ? 'Auto-Booked' : isPending ? 'Reviewing' : 'Dispatched'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* CENTER COLUMN: AI Entity Parser Console (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-[700px] relative overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-purple-500/5 rounded-full blur-2xl"></div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div className="flex items-center space-x-2 text-purple-700">
                  <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                  <h4 className="font-extrabold text-xs text-purple-900 uppercase tracking-widest">
                    AI Entity Resolution Console
                  </h4>
                </div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  Channel Parser: SQLite matches
                </span>
              </div>

              {parsedData ? (
                <div className="flex-1 flex flex-col justify-between pt-4 min-h-0">

                  {/* Original Inbound Bubble */}
                  <div className="space-y-1.5 text-left mb-4 shrink-0">
                    <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Raw message from Client</span>
                    <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl font-semibold text-xs text-slate-700 italic leading-relaxed">
                      "{selectedMsg?.text}"
                    </div>
                  </div>

                  {/* Resolved Entities Grid cards */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
                    <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block text-left">Parsed SQLite Entity Matches</span>

                    <div className="grid grid-cols-2 gap-3 text-xs">

                      <div className="bg-slate-55 p-3 rounded-xl border border-slate-150 text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Profile</span>
                        <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                          <User className="h-4 w-4 text-slate-455 shrink-0" />
                          <span className="truncate">{parsedData.clientName}</span>
                        </p>
                      </div>

                      <div className="bg-slate-55 p-3 rounded-xl border border-slate-150 text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact phone</span>
                        <p className="font-extrabold text-slate-850 flex items-center gap-1.5 font-mono">
                          <Phone className="h-4 w-4 text-slate-455 shrink-0" />
                          <span>{parsedData.phone}</span>
                        </p>
                      </div>

                      <div className="bg-slate-55 p-3 rounded-xl border border-purple-200 text-left">
                        <span className="text-[9px] font-bold text-purple-500 uppercase tracking-wider block mb-1">Extracted Service</span>
                        <p className="font-extrabold text-purple-700 flex items-center gap-1.5">
                          <Scissors className="h-4 w-4 text-purple-400 shrink-0" />
                          <span className="truncate">{parsedData.service?.name || 'Haircut (Men)'}</span>
                        </p>
                      </div>

                      <div className="bg-slate-55 p-3 rounded-xl border border-slate-150 text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Stylist</span>
                        <p className="font-extrabold text-slate-850 flex items-center gap-1.5">
                          <User className="h-4 w-4 text-slate-455 shrink-0" />
                          <span className="truncate">{parsedData.stylist?.name || 'Ravi Kumar'}</span>
                        </p>
                      </div>

                      <div className="col-span-2 bg-slate-55 p-3 rounded-xl border border-slate-150 text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Requested Timing slot</span>
                        <p className="font-extrabold text-slate-850 flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-slate-455 shrink-0" />
                          <span>{parsedData.time} on {parsedData.date}</span>
                        </p>
                      </div>
                    </div>

                    {/* Conflict & availability panel */}
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 text-xs text-left grid grid-cols-3 gap-2 font-semibold text-slate-600 mt-2">
                      <div className="flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="truncate">Stylist Available</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="truncate">Center Matches</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="truncate">Conflict Risk: None</span>
                      </div>
                    </div>

                    {/* RAG KNOWLEDGE BASE & AI AGENT ASSISTANT */}
                    <div className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-100 rounded-2xl p-4.5 space-y-4 mt-4 text-left shadow-sm">
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2.5">
                        <div className="flex items-center space-x-2 text-purple-700">
                          <Cpu className="h-4.5 w-4.5 text-purple-600 animate-pulse" />
                          <span className="font-extrabold text-[11px] uppercase tracking-wider">AI Agent RAG Knowledge Search</span>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide">
                          <Radio className="h-2.5 w-2.5 text-emerald-500 animate-pulse" /> Vector DB Connected
                        </span>
                      </div>

                      {/* RAG Context Retrieval Results */}
                      <div className="space-y-3">
                        {/* 1. Customer Context */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Retrieved Customer File Context</span>
                          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100 text-[10.5px] leading-relaxed text-slate-600 font-semibold space-y-1">
                            <p className="font-extrabold text-slate-800 flex justify-between">
                              <span>Dossier match: {ragCustomer ? `${ragCustomer.name} (${ragCustomer.loyaltyPoints} pts)` : 'Guest Profile (New client)'}</span>
                              <span className="text-purple-600">{ragCustomer?.membershipId ? 'VIP Gold pass' : ''}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 leading-snug">
                              <strong>AI RAG Retrieval: </strong>
                              {getClientRAGNotes(parsedData.clientName)}
                            </p>
                          </div>
                        </div>

                        {/* 2. Service Pricing Context */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Retrieved Service Rules & Pricing</span>
                          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100 text-[10.5px] leading-relaxed text-slate-600 font-semibold grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8.5px] text-slate-400 uppercase block">RAG Base Rate</span>
                              <span className="font-extrabold text-slate-800">₹{ragService?.price || 300} (Standard rate)</span>
                            </div>
                            <div>
                              <span className="text-[8.5px] text-slate-400 uppercase block">RAG Validated Duration</span>
                              <span className="font-extrabold text-slate-800">{ragService?.duration || 30} mins</span>
                            </div>
                            <div className="col-span-2 text-[9.5px] text-slate-500 border-t border-slate-50 pt-1 leading-snug">
                              <strong>Business Rules:</strong> Standard 18% GST applies. Eligible for 10% loyalty points accrual.
                            </div>
                          </div>
                        </div>

                        {/* 3. Stylist Dossier Context */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Retrieved Stylist Dossier</span>
                          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100 text-[10.5px] leading-relaxed text-slate-600 font-semibold">
                            <p className="font-extrabold text-slate-800">
                              {ragStaff ? `${ragStaff.name} (${ragStaff.role})` : 'Stylist details'}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                              <strong>AI Agent Insights:</strong> Ravi Kumar maintains a 4.9★ rating with 120+ reviews. Specializes in custom classic fades and men's texturing. Branch commission: {ragStaff?.commissionPct || 20}%.
                            </p>
                          </div>
                        </div>

                        {/* 4. AI Suggested Reply draft */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">AI Suggested Response Draft</span>
                          <div className="relative bg-slate-800 text-slate-100 p-3 rounded-xl font-mono text-[10.5px] leading-relaxed text-left border border-slate-700 select-all group/draft">
                            <p className="pr-6 whitespace-pre-wrap">{getRAGDraftReply(parsedData)}</p>
                            <button
                              onClick={() => handleCopyDraft(getRAGDraftReply(parsedData))}
                              className="absolute right-2.5 top-2.5 p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-600"
                              title="Copy draft message"
                            >
                              {copiedDraft ? <Check className="h-3.5 w-3.5 text-emerald-450" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Actions Confirmation button */}
                  {parsedData.status === 'pending' ? (
                    <div className="flex space-x-2 pt-3.5 border-t border-slate-100 mt-4 shrink-0">
                      <button
                        onClick={handleAutoBookConfirm}
                        className="cursor-pointer flex-1 bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3.5 rounded-xl text-[10px] uppercase tracking-wide transition-all shadow-md flex items-center justify-center space-x-1.5 min-h-[44px]"
                      >
                        <CheckCircle className="h-4.5 w-4.5" />
                        <span className="truncate">Confirm & Auto-Book</span>
                      </button>
                      <button
                        onClick={() => setSelectedMsgId('')}
                        className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-650 font-extrabold px-4 py-3.5 rounded-xl text-[10px] uppercase tracking-wide transition-colors shrink-0 min-h-[44px]"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-6 border-t border-slate-100 mt-4 shrink-0">
                      <CheckCircle className="h-12 w-12 text-emerald-650 bg-emerald-50 rounded-full p-2.5 border border-emerald-100 shadow-sm animate-bounce" style={{ animationDuration: '2.5s' }} />
                      <div className="space-y-1 max-w-sm">
                        <h4 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider">Booking successfully Committed</h4>
                        <p className="text-[11px] text-slate-450 font-semibold leading-relaxed">
                          This webhook reservation has been validated and added to the Appointments database.
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/appointments')}
                        className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-6 py-2.5 rounded-xl text-[10.5px] uppercase tracking-wider transition-all shadow-sm flex items-center space-x-1"
                      >
                        <span>View in Appointments Book</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-12 text-slate-400">
                  <Cpu className="h-12 w-12 text-slate-300 animate-pulse" />
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">NLP Standby</h4>
                  <p className="text-xs text-slate-455 font-semibold max-w-[340px] leading-relaxed">
                    Select any message from the inbound stack queue to review resolved booking details and trigger SQLite auto-commits.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Conversational AI Smartphone Simulator (3 cols) */}
            <div className="lg:col-span-3 flex flex-col items-center">

              {/* Channel Tab Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 mb-4 w-[320px]">
                {[
                  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="h-3.5 w-3.5" />, color: 'emerald' },
                  { id: 'instagram', label: 'Instagram', icon: <InstagramIcon className="h-3.5 w-3.5" />, color: 'pink' },
                  { id: 'voice', label: 'Voice IVR', icon: <Phone className="h-3.5 w-3.5" />, color: 'amber' }
                ].map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setSimChannel(ch.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${simChannel === ch.id
                      ? ch.id === 'whatsapp' ? 'bg-emerald-500 text-white shadow-sm'
                        : ch.id === 'instagram' ? 'bg-pink-500 text-white shadow-sm'
                          : 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {ch.icon}
                    <span className="hidden sm:block">{ch.label}</span>
                  </button>
                ))}
              </div>

              {/* Phone Frame */}
              <div className="w-[320px] h-[620px] bg-slate-900 rounded-[45px] p-3 shadow-2xl relative border-[6px] border-slate-800 flex flex-col overflow-hidden ring-4 ring-slate-100/10">
                {/* Phone Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-3xl w-40 mx-auto z-20 flex justify-center items-end pb-1.5">
                  <div className="h-1.5 w-12 bg-slate-900 rounded-full"></div>
                </div>

                {/* STATUS BAR */}
                <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-6 pt-1.5">
                  <span className="text-[8px] text-slate-400 font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="flex items-center gap-1">
                    <Wifi className="h-2.5 w-2.5 text-slate-400" />
                    <span className="text-[8px] text-slate-400 font-bold">5G</span>
                  </div>
                </div>

                {/* ===== WHATSAPP / INSTAGRAM SCREEN ===== */}
                {(simChannel === 'whatsapp' || simChannel === 'instagram') && (
                  <div className="flex-1 rounded-[32px] overflow-hidden flex flex-col relative" style={{ background: simChannel === 'instagram' ? '#fafafa' : '#e5ddd5' }}>
                    {/* Header */}
                    <div className={`text-white p-3 pt-8 flex items-center space-x-3 shrink-0 shadow-md z-10 relative ${simChannel === 'instagram' ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500' : 'bg-[#075e54]'
                      }`}>
                      <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0 font-extrabold text-xs border border-white/30">
                        SS
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs truncate">SalonSync {simChannel === 'instagram' ? 'DM Bot' : 'Bot'}</h4>
                        <p className="text-[8px] text-white/70 font-semibold tracking-wide">✅ Active Business Account</p>
                      </div>
                      <button
                        onClick={() => handleSendSimulatedMessage('Restart Booking Session')}
                        className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
                        title="Restart Session"
                      >
                        <RefreshCw className="h-3 w-3 text-white" />
                      </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col">
                      {simChatHistory.length === 0 ? (
                        <div className="m-auto text-center space-y-2">
                          <div className={`p-3 rounded-2xl text-xs font-bold shadow-sm inline-block mx-auto max-w-[85%] border ${simChannel === 'instagram' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-[#dcf8c6] text-[#075e54] border-green-200'
                            }`}>
                            {simChannel === 'instagram' ? '📸 Send a DM to book via Instagram!' : '💬 Send a message to test the AI bot!'}
                          </div>
                        </div>
                      ) : (
                        simChatHistory.map((msg, idx) => (
                          <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-2.5 text-xs shadow-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'client'
                              ? simChannel === 'instagram'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-sm'
                                : 'bg-[#dcf8c6] text-slate-800 rounded-tr-sm border border-[#c4ebaa]'
                              : 'bg-white text-slate-700 rounded-tl-sm border border-slate-200 font-semibold'
                              }`}>
                              {msg.text}
                              <div className={`text-[8px] mt-1 font-bold ${msg.sender === 'client' ? (simChannel === 'instagram' ? 'text-white/60 text-right' : 'text-emerald-700 text-right') : 'text-slate-400 text-left'
                                }`}>
                                {msg.time} {msg.sender === 'client' && '✓✓'}
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {quickReplies.length > 0 && (
                        <div className="flex flex-col gap-1.5 pt-1 items-end shrink-0 animate-slide-in">
                          {quickReplies.map((qr, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendSimulatedMessage(qr)}
                              className={`font-extrabold text-[9.5px] px-3 py-2 rounded-full border shadow-sm transition-all cursor-pointer text-left w-full max-w-[85%] ${simChannel === 'instagram'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                            >
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="bg-white/80 backdrop-blur-sm p-2 flex items-center space-x-1.5 shrink-0 border-t border-slate-200">
                      <div className="flex-1 bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200 flex items-center">
                        <input
                          type="text"
                          value={customSimText}
                          onChange={(e) => setCustomSimText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customSimText.trim()) handleSendSimulatedMessage(customSimText);
                          }}
                          placeholder="Type a message..."
                          className="w-full text-[10px] outline-none bg-transparent"
                        />
                      </div>
                      <button
                        onClick={() => { if (customSimText.trim()) handleSendSimulatedMessage(customSimText); }}
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${customSimText.trim()
                          ? simChannel === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md'
                          : 'bg-slate-200 text-slate-400'
                          }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ===== VOICE IVR CALL SCREEN ===== */}
                {simChannel === 'voice' && (
                  <IVRCallScreen
                    services={services}
                    staff={staff}
                    simProfileName={simProfileName}
                    addAppointment={addAppointment}
                    currentDate={currentDate}
                    selectedBranchId={selectedBranchId}
                  />
                )}
              </div>

              {/* Profile Context below phone */}
              <div className="mt-3 w-[320px]">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 flex justify-between items-center text-xs shadow-sm">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-slate-400">Testing Profile</span>
                    <select
                      value={simProfilePhone}
                      onChange={(e) => {
                        const p = [
                          { name: 'Arjun Singh', phone: '9222222222' },
                          { name: 'Kavya Rao', phone: '9333333333' },
                          { name: 'Sneha Gupta', phone: '9555555555' },
                          { name: 'Meera Joshi', phone: '9111111111' }
                        ].find(x => x.phone === e.target.value);
                        setSimProfileName(p.name);
                        setSimProfilePhone(p.phone);
                      }}
                      className="font-extrabold text-slate-700 bg-transparent outline-none cursor-pointer block"
                    >
                      <option value="9222222222">Arjun Singh</option>
                      <option value="9333333333">Kavya Rao</option>
                      <option value="9555555555">Sneha Gupta</option>
                      <option value="9111111111">Meera Joshi</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Channel:</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${simChannel === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : simChannel === 'instagram' ? 'bg-pink-100 text-pink-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {simChannel === 'whatsapp' ? 'WhatsApp' : simChannel === 'instagram' ? 'Instagram' : 'Voice IVR'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* B. GATEWAY CONNECTION SETTINGS */}
        {activeTab === 'credentials' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Settings Forms Column (8 cols) */}
            <form onSubmit={handleSaveConfig} className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 text-xs font-semibold text-slate-655 text-left flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 h-44 w-44 bg-purple-500/5 rounded-full blur-3xl"></div>

              <div className="space-y-6">

                {/* WhatsApp Cloud API */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <MessageSquare className="h-4.5 w-4.5 text-emerald-500" />
                    <span>WhatsApp Cloud API credentials</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block">Phone Number ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 1099238475992"
                        value={formValues.whatsapp_phone_number_id}
                        onChange={(e) => setFormValues({ ...formValues, whatsapp_phone_number_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block">WhatsApp Business ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 9938475992834"
                        value={formValues.whatsapp_business_id}
                        onChange={(e) => setFormValues({ ...formValues, whatsapp_business_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block">Verify Token (Match in Facebook Developer Webhooks)</label>
                      <input
                        type="text"
                        value={formValues.whatsapp_verify_token}
                        onChange={(e) => setFormValues({ ...formValues, whatsapp_verify_token: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-600 font-mono text-[10.5px]"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block">Permanent System User Access Token</label>
                      <textarea
                        placeholder="Paste your EAAG... access token"
                        value={formValues.whatsapp_access_token}
                        onChange={(e) => setFormValues({ ...formValues, whatsapp_access_token: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none h-16 resize-none focus:ring-1 focus:ring-purple-600 font-mono text-[9.5px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Instagram Messaging API */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <InstagramIcon className="h-4.5 w-4.5 text-pink-500" />
                    <span>Instagram Messaging settings</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block">Facebook page ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 102394859"
                        value={formValues.instagram_page_id}
                        onChange={(e) => setFormValues({ ...formValues, instagram_page_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block">Verify Token</label>
                      <input
                        type="text"
                        value={formValues.whatsapp_verify_token}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-mono text-[10.5px] text-slate-400"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block">Facebook App Page Access Token</label>
                      <textarea
                        placeholder="Paste Facebook App Page token..."
                        value={formValues.instagram_access_token}
                        onChange={(e) => setFormValues({ ...formValues, instagram_access_token: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none h-16 resize-none focus:ring-1 focus:ring-purple-600 font-mono text-[9.5px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Twilio Voice IVR */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Phone className="h-4.5 w-4.5 text-amber-500" />
                    <span>Twilio Interactive Voice Response (IVR) settings</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block">Twilio Account SID</label>
                      <input
                        type="text"
                        placeholder="AC..."
                        value={formValues.twilio_account_sid}
                        onChange={(e) => setFormValues({ ...formValues, twilio_account_sid: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-600 font-mono text-[11px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block">Twilio Auth Token</label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••••••••••••••••••"
                        value={formValues.twilio_auth_token}
                        onChange={(e) => setFormValues({ ...formValues, twilio_auth_token: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-600 font-mono"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase block">IVR Welcome Greeting Prompt</label>
                      <textarea
                        value={formValues.twilio_ivr_greeting}
                        onChange={(e) => setFormValues({ ...formValues, twilio_ivr_greeting: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none h-16 resize-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Sidelined Collapsible Discord Notifications */}
                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
                  <details className="group">
                    <summary className="cursor-pointer p-4 select-none flex justify-between items-center text-slate-700 font-extrabold text-xs">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4.5 w-4.5 text-purple-700" />
                        <span>Admin notifications Alert Settings (Discord Webhook - Optional)</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="p-4 border-t border-slate-200 space-y-4 animate-slide-in bg-white text-left">
                      <p className="text-[11px] leading-relaxed text-slate-500 font-semibold">
                        Enter webhook destination to route notifications and new appointments automatically to Discord channels.
                      </p>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-500 uppercase block">Discord Webhook Destination URL</label>
                        <input
                          type="text"
                          placeholder="https://discord.com/api/webhooks/..."
                          value={formValues.discord_webhook_url}
                          onChange={(e) => setFormValues({ ...formValues, discord_webhook_url: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-600 font-mono text-[10.5px]"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handleTestDiscord}
                          disabled={discordTesting || !formValues.discord_webhook_url.startsWith('http')}
                          className="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold px-5 py-2 rounded-xl text-[10px] uppercase tracking-wider border border-purple-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {discordTesting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                          <span>Trigger test notification</span>
                        </button>
                      </div>
                      {discordTestStatus && (
                        <div className={`p-3 rounded-xl border text-[11px] font-bold ${discordTestStatus.success ? 'bg-emerald-50 border-emerald-150 text-emerald-800' : 'bg-rose-50 border-rose-150 text-rose-800'
                          }`}>
                          {discordTestStatus.msg}
                        </div>
                      )}
                    </div>
                  </details>
                </div>

              </div>

              {/* Save settings CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-slate-400 font-bold">Local port: 5000</span>
                <button
                  type="submit"
                  className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
                >
                  {saveSuccess ? 'Configuration Saved ✓' : 'Save Credentials Configuration'}
                </button>
              </div>
            </form>

            {/* Tunnel Connection Guides Column (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 text-left text-xs font-semibold text-slate-600 flex flex-col justify-between">

              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <span className="text-[10.5px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Code className="h-4.5 w-4.5" />
                    <span>Real-World Webhook Tunneling</span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">ngrok</span>
                </div>

                <p className="leading-relaxed text-slate-500">
                  To connect actual mobile phones, map your local server port 5000 using ngrok:
                </p>

                <div className="space-y-2">
                  <span className="text-[9.5px] font-extrabold text-slate-400 block uppercase">1. Run in terminal</span>
                  <div className="flex justify-between items-center bg-slate-900 text-emerald-400 p-3 rounded-xl border border-slate-950 font-mono text-[9.5px] select-all">
                    <span>ngrok http 5000</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[9.5px] font-extrabold text-slate-400 block uppercase">2. Configure Meta Dashboard Webhooks</span>
                  <p className="leading-relaxed leading-normal text-slate-500 text-[11px]">
                    Go to Developers.facebook.com ➔ Webhooks ➔ Select WhatsApp Business Account ➔ Subscribe to **messages** field.
                  </p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1 font-mono text-[9.5px]">
                    <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Callback URL</span>
                    <code className="text-slate-655 text-slate-800 break-all block">
                      https://[ngrok-url]/api/webhooks/whatsapp
                    </code>

                    <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1 mt-2">Verify Token</span>
                    <code className="text-slate-655 text-slate-800 block">
                      {formValues.whatsapp_verify_token}
                    </code>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50/50 border border-purple-200 p-4 rounded-xl space-y-2 mt-4">
                <span className="text-[10px] font-black text-purple-850 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-purple-700 animate-pulse" />
                  <span>Callback verified</span>
                </span>
                <p className="text-[10.5px] text-slate-500 leading-normal font-semibold">
                  Handshake verified. The local server processes incoming texts, extracts category details, and syncs them straight to the Omnichannel Inbox tab.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* 4. WEB PORTAL WIDGET SCRIPT */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10.5px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-1">
            <Code className="h-4 w-4" />
            <span>Website Booking Widget Script Embed</span>
          </span>
          <button
            onClick={handleCopyScript}
            className="cursor-pointer text-[10px] font-black text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-xl transition-all flex items-center gap-1"
          >
            {copiedScript ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy SDK Script Tag</span>
          </button>
        </div>
        <p className="text-xs font-semibold text-slate-500 text-left leading-relaxed">
          Copy and paste this HTML snippet into any brand brand webpage or website to embed the fully interactive SalonSync booking calendar:
        </p>
        <pre className="text-[9.5px] font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 overflow-x-auto select-all leading-normal whitespace-pre text-left">
          {`<script src="http://localhost:5173/widget.js" data-branch="${selectedBranchId}"></script>
<div id="salonsync-booking-widget"></div>`}
        </pre>
      </div>

      {/* 5. DEVELOPER LOGS LEDGER (Monospace Terminal block) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[320px]">

        {/* Tab selector */}
        <div className="bg-slate-50 border-b border-slate-150 p-4 shrink-0 flex items-center justify-between">
          <div className="flex bg-slate-200/60 p-1 rounded-2xl space-x-1">
            <button
              onClick={() => setActiveLedgerTab('payload')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${activeLedgerTab === 'payload'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                }`}
            >
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span>Real-Time Webhook Logs Ledger</span>
            </button>

            <button
              onClick={() => setActiveLedgerTab('audit')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${activeLedgerTab === 'audit'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                }`}
            >
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Outbound SMS & Notifications ledger</span>
            </button>
          </div>

          <button
            onClick={clearAllLogs}
            className="cursor-pointer text-[10px] font-extrabold text-rose-650 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-all"
          >
            Clear Database Logs Ledger
          </button>
        </div>

        {/* Content areas */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/20 p-5">

          {/* TAB 1: Monospace payload stream */}
          {activeLedgerTab === 'payload' && (
            <div className="space-y-4 text-left h-full flex flex-col min-h-0">
              <div className="flex justify-between items-center text-slate-505 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5">
                  <Database className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Real-time webhook POST requests logged in database</span>
                </span>
                <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-150 font-black px-2 py-0.5 rounded uppercase leading-none font-mono">
                  POST 200 OK
                </span>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 flex-1 overflow-y-auto font-mono text-[9.5px] text-emerald-400 space-y-3 flex flex-col select-text shadow-inner">
                {webhookLogs.length === 0 ? (
                  <div className="text-slate-500 italic flex-1 flex items-center justify-center text-center text-[10px] leading-relaxed">
                    No webhook payloads logged in database yet.<br />Initiate mock customer chat in the simulator panel on the right to log details.
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
                <p className="text-[10px] font-black text-slate-505 uppercase tracking-wider">Dispatched outbound alerts & SMS ledger</p>
                <span className="text-[9px] bg-slate-150 text-slate-655 font-bold px-2.5 py-0.5 rounded-full">
                  Last {notificationsLog.length} dispatches
                </span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
                {notificationsLog.length === 0 ? (
                  <div className="text-center py-16 text-slate-405 italic text-xs font-semibold">
                    No outbound alert dispatches logged yet.
                  </div>
                ) : (
                  notificationsLog.map((log) => (
                    <div key={log.id} className="py-4 space-y-2 animate-slide-in">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs">{log.customerName}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">{log.phone}</p>
                        </div>

                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 ${log.type === 'WhatsApp'
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
                        <span className="text-emerald-600 font-black">✓ Sent & Logged</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Integrations;
