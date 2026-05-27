import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scissors,
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Lock,
  ShieldCheck,
  Star,
  Award,
  X,
  Send,
  MessageSquare
} from 'lucide-react';

const Portal = () => {
  const {
    services,
    staff,
    branches,
    addAppointment,
    customers,
    selectedBranchId,
    setSelectedBranchId,
    parseMessageNLP
  } = useApp();

  const navigate = useNavigate();
  const bookingRef = useRef(null);
  const chatEndRef = useRef(null);

  // Core Booking Form States
  const [branchId, setBranchId] = useState(selectedBranchId || 1);
  const [category, setCategory] = useState('Hair');
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [time, setTime] = useState('10:00');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  // AI Chatbot States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatStep, setChatStep] = useState('chat'); // chat | ask_name | ask_phone | success
  const [chatIsTyping, setChatIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: "Hi! I am your SalonSync AI Assistant. 🌸 I can schedule appointments directly in chat! Try typing: 'Book a Hair Spa with Deepak Nair at 3 PM today'."
    }
  ]);
  const [chatProposal, setChatProposal] = useState(null);

  // Filter services by category
  const servicesFiltered = services.filter(s => s.category.toLowerCase() === category.toLowerCase());

  // Filter staff by selected branch
  const staffFiltered = staff.filter(s => s.branchId === parseInt(branchId, 10));

  // Initialize dropdown selections
  useEffect(() => {
    if (servicesFiltered.length > 0) {
      setServiceId(servicesFiltered[0].id.toString());
    }
  }, [category]);

  useEffect(() => {
    if (staffFiltered.length > 0) {
      setStaffId(staffFiltered[0].id.toString());
    } else if (staff.length > 0) {
      setStaffId(staff[0].id.toString());
    }
  }, [branchId]);

  const handleScrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCustomerBookingSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !serviceId || !staffId) {
      alert('Please fill in all booking parameters.');
      return;
    }

    const selectedService = services.find(s => s.id === parseInt(serviceId, 10));
    const selectedStaff = staff.find(s => s.id === parseInt(staffId, 10));

    if (!selectedService || !selectedStaff) return;

    // Check if slot is already booked for this stylist
    const isSlotBooked = appointments.some(a =>
      a.staffId === selectedStaff.id &&
      a.date === '2026-05-26' &&
      a.time === time &&
      a.status !== 'cancelled'
    );

    if (isSlotBooked) {
      alert(`We are sorry, but ${selectedStaff.name} is already booked at ${time} on 2026-05-26. Please select another time or stylist.`);
      return;
    }

    // Award loyalty points & register profile internally if new customer
    const existingCust = customers.find(c => c.phone === phone.trim());

    addAppointment({
      customerId: existingCust ? existingCust.id : 0,
      customerName: name,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      branchId: parseInt(branchId, 10),
      date: '2026-05-26', // locked to active session date
      time: time,
      status: 'pending',
      source: 'website', // identifies it as a customer web reservation
      amount: selectedService.price
    });

    setSuccess(true);

    // Reset form after submission
    setTimeout(() => {
      setSuccess(false);
      setName('');
      setPhone('');
      setEmail('');
    }, 4000);
  };

  // AI Chatbot Auto-Scroll
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatIsTyping, isChatOpen]);

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatIsTyping(true);

    setTimeout(() => {
      setChatIsTyping(false);

      if (chatStep === 'chat') {
        const parsed = parseMessageNLP(userText);
        if (parsed && parsed.service && parsed.stylist) {
          setChatProposal(parsed);
          setChatStep('ask_name');
          const matchedBranchName = branches.find(b => b.id === parsed.branchId)?.name || 'SalonSync';
          setChatMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `✨ Slot found in database!\n\n🌸 **Treatment**: ${parsed.service.name} (₹${parsed.service.price})\n💇 **Stylist**: ${parsed.stylist.name}\n⏰ **Time**: ${parsed.time}\n📍 **Branch**: ${matchedBranchName}\n\nTo lock this slot, please type your **Full Name** below.`
            }
          ]);
        } else {
          setChatMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: "Hmm, I couldn't quite identify the stylist or service name in your message. Could you try specifying them? For example: 'Book a Hair Spa with Deepak Nair' or 'I need a Haircut'."
            }
          ]);
        }
      } else if (chatStep === 'ask_name') {
        setChatProposal(prev => ({ ...prev, clientName: userText }));
        setChatStep('ask_phone');
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `Thanks, ${userText}! Lastly, please enter your **10-digit Phone Number** to confirm the reservation.`
          }
        ]);
      } else if (chatStep === 'ask_phone') {
        const cleanPhone = userText.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
          setChatMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: "⚠️ Please type a valid 10-digit phone number so we can register your profile."
            }
          ]);
          return;
        }

        const finalProposal = { ...chatProposal, phone: cleanPhone };
        setChatProposal(finalProposal);

        // Check if slot is already booked
        const isSlotBooked = appointments.some(a =>
          a.staffId === finalProposal.stylist.id &&
          a.date === '2026-05-26' &&
          a.time === finalProposal.time &&
          a.status !== 'cancelled'
        );

        if (isSlotBooked) {
          setChatMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `⚠️ I'm sorry, but ${finalProposal.stylist.name} is already booked at ${finalProposal.time}. Please try a different slot or select another stylist.`
            }
          ]);
          setChatStep('chat');
          setChatProposal(null);
          return;
        }

        const existingCust = customers.find(c => c.phone === cleanPhone);

        addAppointment({
          customerId: existingCust ? existingCust.id : 0,
          customerName: finalProposal.clientName,
          staffId: finalProposal.stylist.id,
          staffName: finalProposal.stylist.name,
          serviceId: finalProposal.service.id,
          serviceName: finalProposal.service.name,
          branchId: finalProposal.branchId,
          date: '2026-05-26',
          time: finalProposal.time,
          status: 'pending',
          source: 'website',
          amount: finalProposal.service.price
        });

        setChatStep('success');
        const matchedBranchName = branches.find(b => b.id === finalProposal.branchId)?.name || 'SalonSync';
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `🎉 **Success! Your booking is confirmed!**\n\nWe look forward to seeing you, ${finalProposal.clientName}, at our **${matchedBranchName}** branch on **2026-05-26** at **${finalProposal.time}** for **${finalProposal.service.name}**.`
          }
        ]);
      }
    }, 1000);
  };

  const handleResetChat = () => {
    setChatStep('chat');
    setChatProposal(null);
    setChatMessages([
      {
        sender: 'bot',
        text: "Hi! I am your SalonSync AI Assistant. 🌸 I can schedule appointments directly in chat! Try typing: 'Book a Hair Spa with Deepak Nair at 3 PM today'."
      }
    ]);
  };

  // Find active service details for summary panel
  const activeServiceObj = services.find(s => s.id === parseInt(serviceId, 10)) || servicesFiltered[0];


  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans selection:bg-purple-650 selection:text-white">

      {/* 1. VISUALLY STUNNING HEADER */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-650 flex items-center justify-center shadow-lg shadow-purple-650/20">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white">Salon<span className="text-purple-500">Sync</span></span>
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest leading-none">LUXURY CARE</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-350">
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#locations" className="hover:text-white transition-colors">Centers</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            <button
              onClick={handleScrollToBooking}
              className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-600/10 cursor-pointer"
            >
              Book Reservation
            </button>
          </nav>

          <Link
            to="/"
            className="flex items-center space-x-1.5 text-xs font-black text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 px-4 py-2.5 rounded-2xl transition-all"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Staff Portal</span>
          </Link>
        </div>
      </header>

      {/* 2. CREATIVE HERO BANNER */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-purple-950/50 border border-purple-800/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
              <Sparkles className="h-3 w-3 animate-spin" />
              <span>Premium Grooming Experience</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Elevate Your Look.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Sync Your Beauty.</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed font-semibold">
              Experience the peak of professional hair care, facial styling, and nail art at Hyderabad's premier luxury salon.
              Our unified real-time scheduling app links you instantly to top-tier stylists across Banjara Hills, Jubilee Hills, and Gachibowli.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleScrollToBooking}
                className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-650/10 flex items-center justify-center space-x-2"
              >
                <span>Book Appointment Online</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#services"
                className="border border-slate-700 hover:border-slate-500 text-slate-350 hover:text-white font-extrabold px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center"
              >
                Explore Services
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/80">
              <div className="text-left">
                <h4 className="text-2xl font-black text-white">3+</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Luxury Centers</p>
              </div>
              <div className="text-left">
                <h4 className="text-2xl font-black text-white">12+</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Top Stylists</p>
              </div>
              <div className="text-left">
                <h4 className="text-2xl font-black text-white">100%</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Satisfaction Guaranteed</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Renders */}
          <div className="lg:col-span-5 hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-650/10 to-indigo-650/10 rounded-[3rem] blur-xl transform rotate-3"></div>
            <div className="relative bg-slate-950 border border-slate-800 rounded-[3rem] p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">salonsync.io/live-booking</span>
              </div>

              <div className="space-y-4 text-left">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
                  <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-white">Banjara Hills Center</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">99.8% Client Rating</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
                  <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-white">Smart Slot Availability</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Live scheduling updates</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
                  <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <Star className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-white">Exclusive Member Benefits</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Automatic checkout discount matching</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LOCATIONS SECTIONS */}
      <section id="locations" className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Our Premium Locations</h2>
            <p className="text-slate-400 text-sm font-semibold max-w-xl mx-auto">
              Select one of our luxury centers. All slots dynamically align to each branch's specialized team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {branches.map(br => (
              <div
                key={br.id}
                onClick={() => {
                  setBranchId(br.id);
                  setSelectedBranchId(br.id);
                  handleScrollToBooking();
                }}
                className={`cursor-pointer group bg-slate-900/60 hover:bg-slate-900 border rounded-3xl p-6 transition-all duration-300 relative overflow-hidden text-left ${branchId === br.id ? 'border-purple-600 ring-2 ring-purple-650/20' : 'border-slate-800/80 hover:border-slate-700'
                  }`}
              >
                <div className="absolute right-0 top-0 h-24 w-24 bg-purple-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <MapPin className={`h-5 w-5 ${branchId === br.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                </div>
                <h3 className="text-lg font-extrabold text-white mt-5">{br.name}</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">{br.city}, India</p>
                <div className="flex items-center space-x-2 text-[10px] text-purple-400 font-black mt-6">
                  <span>SELECT THIS BRANCH</span>
                  <ArrowRight className="h-3 w-3 translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SERVICES SECTION */}
      <section id="services" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Curated Treatment Catalog</h2>
            <p className="text-slate-400 text-sm font-semibold max-w-xl mx-auto">
              We specialize in custom beauty routines. Check our menu below.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {['Hair', 'Color', 'Skin', 'Nails', 'Makeup'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`cursor-pointer px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${category === cat
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-650/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-650'
                  }`}
              >
                {cat} Care
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicesFiltered.map(s => (
              <div key={s.id} className="bg-slate-950 border border-slate-850 p-5 rounded-3xl space-y-4 text-left flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[8px] font-black uppercase bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-900/30">
                    {s.category}
                  </span>
                  <h4 className="font-extrabold text-white text-sm">{s.name}</h4>
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-450 font-bold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{s.duration} minutes</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                  <span className="text-md font-black text-purple-400">₹{s.price}</span>
                  <button
                    onClick={() => {
                      setServiceId(s.id.toString());
                      handleScrollToBooking();
                    }}
                    className="cursor-pointer bg-slate-800 hover:bg-purple-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. USER FRIENDLY CONSOLE BOOKING FORM */}
      <section ref={bookingRef} className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12">

            {/* Booking Form Left info (5 columns) */}
            <div className="md:col-span-5 bg-gradient-to-b from-purple-750 to-indigo-900 p-8 text-white flex flex-col justify-between text-left">
              <div className="space-y-4">
                <h3 className="text-xl font-black">Interactive Scheduler</h3>
                <p className="text-xs text-purple-100 leading-relaxed font-semibold">
                  Pick your target branch and treatment. Select a stylist and time slot. Book instantly to register in our database.
                </p>
              </div>

              {/* Service checkout display summary */}
              <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-4 space-y-3.5">
                <p className="text-[9px] font-bold text-purple-200 uppercase tracking-wider leading-none">Treatment Summary</p>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{activeServiceObj?.name || 'Haircut (Men)'}</h4>
                  <p className="text-[10px] text-purple-100 font-semibold mt-0.5">Duration: {activeServiceObj?.duration || 30} mins</p>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between items-center text-xs">
                  <span className="font-bold">Base Price</span>
                  <span className="font-extrabold">₹{activeServiceObj?.price || 300}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-purple-200 leading-none">
                  <span>GST (18%)</span>
                  <span>₹{Math.round((activeServiceObj?.price || 300) * 0.18)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm font-black text-white">
                  <span>Total Amount</span>
                  <span>₹{Math.round((activeServiceObj?.price || 300) * 1.18)}</span>
                </div>
              </div>

              <div className="text-[10px] text-purple-200/80 font-bold flex items-center space-x-1.5">
                <ShieldCheck className="h-4.5 w-4.5" />
                <span>Secured Online Synchronization</span>
              </div>
            </div>

            {/* Booking Form Inputs (7 columns) */}
            <div className="md:col-span-7 p-8">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 animate-slide-in">
                  <CheckCircle className="h-16 w-16 text-emerald-500 bg-emerald-950/40 rounded-full p-2 border border-emerald-800/40" />
                  <div>
                    <h3 className="text-lg font-black text-white">Reservation Confirmed!</h3>
                    <p className="text-xs text-slate-400 mt-2 font-semibold max-w-[280px]">
                      Your appointment has been registered under the pending category. The branch administrator has received a real-time webhook notification.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCustomerBookingSubmit} className="space-y-4 text-left">
                  <h3 className="text-md font-extrabold text-white border-b border-slate-800 pb-2">Schedule Details</h3>

                  {/* Select Branch */}
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block mb-1">Select Center</label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 outline-none focus:ring-1 focus:ring-purple-650"
                    >
                      {branches.map(br => (
                        <option key={br.id} value={br.id}>{br.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Service Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block mb-1">Treatment Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 outline-none focus:ring-1 focus:ring-purple-650"
                      >
                        <option value="Hair">Hair Care</option>
                        <option value="Color">Coloring</option>
                        <option value="Skin">Skincare</option>
                        <option value="Nails">Nails</option>
                        <option value="Makeup">Makeup</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block mb-1">Specific Service</label>
                      <select
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 outline-none focus:ring-1 focus:ring-purple-650"
                      >
                        {servicesFiltered.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Select Stylist & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block mb-1">Assigned Stylist</label>
                      <select
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 outline-none focus:ring-1 focus:ring-purple-650"
                      >
                        {staffFiltered.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block mb-1">Available Hour</label>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 outline-none focus:ring-1 focus:ring-purple-650"
                      >
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="13:00">01:00 PM</option>
                        <option value="14:30">02:30 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="18:30">06:30 PM</option>
                        <option value="19:30">07:30 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <h3 className="text-md font-extrabold text-white border-b border-slate-800 pb-2 pt-2">Guest Profile</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-300 outline-none focus:ring-1 focus:ring-purple-650 placeholder-slate-500"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs font-semibold text-slate-300 outline-none focus:ring-1 focus:ring-purple-650 placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-purple-600/10 transition-colors mt-2"
                  >
                    Confirm Appointment
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 6. BEAUTIFUL PORTAL FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-center text-slate-500 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <p>© 2026 SalonSync. All rights reserved. Professional Multi-Branch Salon Automation.</p>
          <div className="flex justify-center space-x-6">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">Staff Portal Control</Link>
            <span className="text-slate-800">|</span>
            <a href="#locations" className="text-slate-400 hover:text-white transition-colors">Branch Locations</a>
            <span className="text-slate-800">|</span>
            <a href="#services" className="text-slate-400 hover:text-white transition-colors">Service List</a>
          </div>
        </div>
      </footer>

      {/* 7. FLOATING AI CHATBOT BOOKING ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end space-y-3">

        {/* Chat Window */}
        {isChatOpen && (
          <div className="w-[340px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in" style={{ height: '460px' }}>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">SalonSync AI Assistant</p>
                  <p className="text-[9px] text-purple-200 font-semibold">Chat to book your appointment</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {chatStep === 'success' && (
                  <button
                    onClick={handleResetChat}
                    className="cursor-pointer text-[9px] font-bold text-purple-200 hover:text-white bg-white/10 px-2 py-1 rounded-lg"
                  >
                    New Chat
                  </button>
                )}
                <button onClick={() => setIsChatOpen(false)} className="cursor-pointer text-white/70 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/50 min-h-0">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    }`}>
                    <p className="whitespace-pre-line font-semibold">{msg.text}</p>
                  </div>
                </div>
              ))}

              {chatIsTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-1.5">
                    <span className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Chat Input */}
            {chatStep !== 'success' && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center space-x-2">
                <input
                  type={chatStep === 'ask_phone' ? 'tel' : 'text'}
                  placeholder={
                    chatStep === 'ask_name' ? 'Type your full name...'
                      : chatStep === 'ask_phone' ? 'Type your phone number...'
                        : 'e.g. Book a Hair Spa with Ravi at 3PM...'
                  }
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-200 outline-none focus:ring-1 focus:ring-purple-600 placeholder-slate-500"
                />
                <button
                  onClick={handleChatSend}
                  className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-2xl transition-colors shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsChatOpen(prev => !prev)}
          className="cursor-pointer h-14 w-14 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-2xl shadow-purple-600/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          {isChatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          {!isChatOpen && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
          )}
        </button>
      </div>

    </div>
  );
};

export default Portal;
