const branches = [
  { id: 1, name: "SalonSync - Banjara Hills", city: "Hyderabad" },
  { id: 2, name: "SalonSync - Jubilee Hills", city: "Hyderabad" },
  { id: 3, name: "SalonSync - Gachibowli", city: "Hyderabad" }
];

const services = [
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

const staff = [
  // Branch 1: Banjara Hills (id 1-5)
  { id: 1, name: "Ravi Kumar", role: "Senior Stylist", branchId: 1, commissionPct: 20, phone: "9876543210" },
  { id: 2, name: "Priya Sharma", role: "Hair Colorist", branchId: 1, commissionPct: 22, phone: "9876543211" },
  { id: 3, name: "Vikram Malhotra", role: "Nail Artist", branchId: 1, commissionPct: 15, phone: "9876543216" },
  { id: 4, name: "Nisha Sen", role: "Skin Therapist", branchId: 1, commissionPct: 18, phone: "9876543217" },
  { id: 5, name: "Amit Trivedi", role: "Junior Stylist", branchId: 1, commissionPct: 12, phone: "9876543230" },
  
  // Branch 2: Jubilee Hills (id 6-10)
  { id: 6, name: "Anjali Reddy", role: "Makeup Artist", branchId: 2, commissionPct: 25, phone: "9876543212" },
  { id: 7, name: "Mohammed Irfan", role: "Stylist", branchId: 2, commissionPct: 18, phone: "9876543213" },
  { id: 8, name: "Rajesh Kulkarni", role: "Senior Stylist", branchId: 2, commissionPct: 20, phone: "9876543218" },
  { id: 9, name: "Divya Joshi", role: "Nail Care Expert", branchId: 2, commissionPct: 15, phone: "9876543219" },
  { id: 10, name: "Karan Singhal", role: "Hair Specialist", branchId: 2, commissionPct: 16, phone: "9876543231" },
  
  // Branch 3: Gachibowli (id 11-15)
  { id: 11, name: "Sunita Patel", role: "Nail Technician", branchId: 3, commissionPct: 20, phone: "9876543214" },
  { id: 12, name: "Deepak Nair", role: "Senior Stylist", branchId: 3, commissionPct: 22, phone: "9876543215" },
  { id: 13, name: "Suresh Rao", role: "Hair Color Specialist", branchId: 3, commissionPct: 20, phone: "9876543220" },
  { id: 14, name: "Tina Fernandes", role: "Aesthetician", branchId: 3, commissionPct: 18, phone: "9876543221" },
  { id: 15, name: "Ananya Roy", role: "Junior Stylist", branchId: 3, commissionPct: 12, phone: "9876543232" }
];

const customers = [
  { id: 1, name: "Meera Joshi", phone: "9111111111", email: "meera@email.com", loyaltyPoints: 450, totalVisits: 12, preferredBranch: 1, membershipId: 1 },
  { id: 2, name: "Arjun Singh", phone: "9222222222", email: "arjun@email.com", loyaltyPoints: 200, totalVisits: 5, preferredBranch: 1 },
  { id: 3, name: "Kavya Rao", phone: "9333333333", email: "kavya@email.com", loyaltyPoints: 800, totalVisits: 22, preferredBranch: 2, membershipId: 3 },
  { id: 4, name: "Rahul Verma", phone: "9444444444", email: "rahul@email.com", loyaltyPoints: 120, totalVisits: 3, preferredBranch: 2 },
  { id: 5, name: "Sneha Gupta", phone: "9555555555", email: "sneha@email.com", loyaltyPoints: 650, totalVisits: 18, preferredBranch: 3 },
  { id: 6, name: "Aditya Roy", phone: "9666666666", email: "aditya@email.com", loyaltyPoints: 310, totalVisits: 9, preferredBranch: 1, membershipId: 2 },
  { id: 7, name: "Pooja Nair", phone: "9777777777", email: "pooja.nair@email.com", loyaltyPoints: 95, totalVisits: 2, preferredBranch: 2 },
  { id: 8, name: "Vikram Rathore", phone: "9888888888", email: "vikram@email.com", loyaltyPoints: 500, totalVisits: 14, preferredBranch: 3, membershipId: 3 },
  { id: 9, name: "Tanvi Shah", phone: "9999999999", email: "tanvi@email.com", loyaltyPoints: 720, totalVisits: 19, preferredBranch: 1, membershipId: 1 },
  { id: 10, name: "Rohan Das", phone: "9000000000", email: "rohan@email.com", loyaltyPoints: 40, totalVisits: 1, preferredBranch: 2 },
  { id: 11, name: "Karan Malhotra", phone: "9123456789", email: "karan.malhotra@email.com", loyaltyPoints: 1200, totalVisits: 31, preferredBranch: 2, membershipId: 3 },
  { id: 12, name: "Priti Patel", phone: "9876501234", email: "priti.patel@email.com", loyaltyPoints: 350, totalVisits: 8, preferredBranch: 3 },
  { id: 13, name: "Harish Rao", phone: "9112233445", email: "harish.rao@email.com", loyaltyPoints: 600, totalVisits: 15, preferredBranch: 1, membershipId: 2 },
  { id: 14, name: "Kiran Sen", phone: "9223344556", email: "kiran.sen@email.com", loyaltyPoints: 900, totalVisits: 25, preferredBranch: 2, membershipId: 1 },
  { id: 15, name: "Rahul Nair", phone: "9334455667", email: "rahul.nair@email.com", loyaltyPoints: 180, totalVisits: 4, preferredBranch: 3 },
  { id: 16, name: "Aisha Joshi", phone: "9445566778", email: "aisha.joshi@email.com", loyaltyPoints: 540, totalVisits: 11, preferredBranch: 1 },
  { id: 17, name: "Vijay Deshmukh", phone: "9556677889", email: "vijay.deshmukh@email.com", loyaltyPoints: 1500, totalVisits: 35, preferredBranch: 1, membershipId: 3 },
  { id: 18, name: "Deepa Pillai", phone: "9667788990", email: "deepa.pillai@email.com", loyaltyPoints: 950, totalVisits: 20, preferredBranch: 2, membershipId: 1 },
  { id: 19, name: "Priya Saxena", phone: "9778899001", email: "priya.saxena@email.com", loyaltyPoints: 1100, totalVisits: 28, preferredBranch: 1, membershipId: 3 },
  { id: 20, name: "Sameer Gokhale", phone: "9889900112", email: "sameer.gokhale@email.com", loyaltyPoints: 2500, totalVisits: 52, preferredBranch: 2, membershipId: 3 },
  { id: 21, name: "Mahesh Hegde", phone: "9990011223", email: "mahesh.hegde@email.com", loyaltyPoints: 3000, totalVisits: 60, preferredBranch: 1, membershipId: 3 },
  { id: 22, name: "Rishi Kulkarni", phone: "9001122334", email: "rishi.kulkarni@email.com", loyaltyPoints: 750, totalVisits: 14, preferredBranch: 3 },
  { id: 23, name: "Harsh Bhatia", phone: "9112233446", email: "harsh.bhatia@email.com", loyaltyPoints: 400, totalVisits: 8, preferredBranch: 2 },
  { id: 24, name: "Abdul Siddiqui", phone: "9223344557", email: "abdul.siddiqui@email.com", loyaltyPoints: 1250, totalVisits: 24, preferredBranch: 1, membershipId: 2 },
  { id: 25, name: "Sneha Iyer", phone: "9334455668", email: "sneha.iyer@email.com", loyaltyPoints: 980, totalVisits: 19, preferredBranch: 3, membershipId: 1 },
  { id: 26, name: "Abhijit Roy", phone: "9445566779", email: "abhijit.roy@email.com", loyaltyPoints: 850, totalVisits: 17, preferredBranch: 2 },
  { id: 27, name: "Kirti Das", phone: "9556677880", email: "kirti.das@email.com", loyaltyPoints: 700, totalVisits: 15, preferredBranch: 1, membershipId: 2 },
  { id: 28, name: "Sohail Qureshi", phone: "9667788991", email: "sohail.qureshi@email.com", loyaltyPoints: 4500, totalVisits: 90, preferredBranch: 2, membershipId: 3 },
  { id: 29, name: "Ayush Banerjee", phone: "9778899002", email: "ayush.banerjee@email.com", loyaltyPoints: 1350, totalVisits: 22, preferredBranch: 3 },
  { id: 30, name: "Komal Mehta", phone: "9889900113", email: "komal.mehta@email.com", loyaltyPoints: 920, totalVisits: 18, preferredBranch: 1, membershipId: 1 },
  { id: 31, name: "Siddharth Varma", phone: "9990011224", email: "siddharth.varma@email.com", loyaltyPoints: 600, totalVisits: 12, preferredBranch: 1 },
  { id: 32, name: "Kavita Nair", phone: "9001122335", email: "kavita.nair@email.com", loyaltyPoints: 500, totalVisits: 10, preferredBranch: 2 },
  { id: 33, name: "Rajveer Rathore", phone: "9112233447", email: "rajveer.rathore@email.com", loyaltyPoints: 1100, totalVisits: 21, preferredBranch: 2, membershipId: 3 },
  { id: 34, name: "Ananya Goel", phone: "9223344558", email: "ananya.goel@email.com", loyaltyPoints: 800, totalVisits: 16, preferredBranch: 1, membershipId: 1 },
  { id: 35, name: "Ketan Joshi", phone: "9334455669", email: "ketan.joshi@email.com", loyaltyPoints: 450, totalVisits: 9, preferredBranch: 3 },
  { id: 36, name: "Rajat Sen", phone: "9445566780", email: "rajat.sen@email.com", loyaltyPoints: 350, totalVisits: 7, preferredBranch: 3 },
  { id: 37, name: "Jatin Lal", phone: "9556677891", email: "jatin.lal@email.com", loyaltyPoints: 900, totalVisits: 18, preferredBranch: 1 },
  { id: 38, name: "Rakesh Solanki", phone: "9667788992", email: "rakesh.solanki@email.com", loyaltyPoints: 1050, totalVisits: 20, preferredBranch: 3, membershipId: 2 },
  { id: 39, name: "Sonia Mishra", phone: "9778899003", email: "sonia.mishra@email.com", loyaltyPoints: 240, totalVisits: 5, preferredBranch: 2 },
  { id: 40, name: "Jyoti Bhat", phone: "9889900114", email: "jyoti.bhat@email.com", loyaltyPoints: 400, totalVisits: 8, preferredBranch: 2 },
  { id: 41, name: "Simran Rao", phone: "9990011225", email: "simran.rao@email.com", loyaltyPoints: 1400, totalVisits: 26, preferredBranch: 3, membershipId: 1 },
  { id: 42, name: "Nisha Menon", phone: "9001122336", email: "nisha.menon@email.com", loyaltyPoints: 1800, totalVisits: 30, preferredBranch: 1, membershipId: 3 },
  { id: 43, name: "Daljit Gill", phone: "9112233448", email: "daljit.gill@email.com", loyaltyPoints: 1300, totalVisits: 25, preferredBranch: 2, membershipId: 2 },
  { id: 44, name: "Aditi Sawant", phone: "9223344559", email: "aditi.sawant@email.com", loyaltyPoints: 2100, totalVisits: 40, preferredBranch: 1, membershipId: 3 },
  { id: 45, name: "Saleem Shaikh", phone: "9334455670", email: "saleem.shaikh@email.com", loyaltyPoints: 2800, totalVisits: 50, preferredBranch: 2 },
  { id: 46, name: "Anil Prasad", phone: "9445566781", email: "anil.prasad@email.com", loyaltyPoints: 3200, totalVisits: 65, preferredBranch: 3, membershipId: 3 },
  { id: 47, name: "Rani Shenoy", phone: "9556677892", email: "rani.shenoy@email.com", loyaltyPoints: 780, totalVisits: 14, preferredBranch: 3, membershipId: 1 },
  { id: 48, name: "Yogesh Choudhary", phone: "9667788993", email: "yogesh.choudhary@email.com", loyaltyPoints: 850, totalVisits: 17, preferredBranch: 1 },
  { id: 49, name: "Shweta Dutta", phone: "9778899004", email: "shweta.dutta@email.com", loyaltyPoints: 600, totalVisits: 13, preferredBranch: 2 },
  { id: 50, name: "Karthik Subramanian", phone: "9889900115", email: "karthik.subramanian@email.com", loyaltyPoints: 2200, totalVisits: 44, preferredBranch: 3, membershipId: 3 }
];

const appointments = [
  // --- Historical/Weekly Trend Data (spread over previous 6 days: May 20 to May 25) ---
  // May 25 (Monday)
  { id: 76, customerId: 10, customerName: "Rohan Das", staffId: 1, staffName: "Ravi Kumar", serviceId: 1, serviceName: "Haircut (Men)", branchId: 1, date: "2026-05-25", time: "11:00", status: "completed", source: "walkin", amount: 300 },
  { id: 77, customerId: 20, customerName: "Sameer Gokhale", staffId: 6, staffName: "Anjali Reddy", serviceId: 10, serviceName: "Bridal Makeup", branchId: 2, date: "2026-05-25", time: "10:00", status: "completed", source: "website", amount: 8000 },
  { id: 78, customerId: 30, customerName: "Komal Mehta", staffId: 12, staffName: "Deepak Nair", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-25", time: "15:00", status: "completed", source: "whatsapp", amount: 1200 },
  
  // May 24 (Sunday)
  { id: 79, customerId: 11, customerName: "Karan Malhotra", staffId: 2, staffName: "Priya Sharma", serviceId: 3, serviceName: "Hair Color", branchId: 1, date: "2026-05-24", time: "14:00", status: "completed", source: "call", amount: 1500 },
  { id: 80, customerId: 44, customerName: "Aditi Sawant", staffId: 8, staffName: "Rajesh Kulkarni", serviceId: 9, serviceName: "Hair Spa", branchId: 2, date: "2026-05-24", time: "16:30", status: "completed", source: "website", amount: 1200 },
  { id: 81, customerId: 47, customerName: "Rani Shenoy", staffId: 14, staffName: "Tina Fernandes", serviceId: 4, serviceName: "Facial", branchId: 3, date: "2026-05-24", time: "12:00", status: "completed", source: "instagram", amount: 800 },

  // May 23 (Saturday)
  { id: 82, customerId: 21, customerName: "Mahesh Hegde", staffId: 1, staffName: "Ravi Kumar", serviceId: 1, serviceName: "Haircut (Men)", branchId: 1, date: "2026-05-23", time: "13:00", status: "completed", source: "whatsapp", amount: 300 },
  { id: 83, customerId: 14, customerName: "Kiran Sen", staffId: 9, staffName: "Divya Joshi", serviceId: 5, serviceName: "Manicure", branchId: 2, date: "2026-05-23", time: "10:30", status: "completed", source: "walkin", amount: 500 },
  { id: 84, customerId: 5, customerName: "Sneha Gupta", staffId: 11, staffName: "Sunita Patel", serviceId: 6, serviceName: "Pedicure", branchId: 3, date: "2026-05-23", time: "11:30", status: "completed", source: "website", amount: 600 },

  // May 22 (Friday)
  { id: 85, customerId: 9, customerName: "Tanvi Shah", staffId: 4, staffName: "Nisha Sen", serviceId: 4, serviceName: "Facial", branchId: 1, date: "2026-05-22", time: "15:00", status: "completed", source: "website", amount: 800 },
  { id: 86, customerId: 3, customerName: "Kavya Rao", staffId: 6, staffName: "Anjali Reddy", serviceId: 10, serviceName: "Bridal Makeup", branchId: 2, date: "2026-05-22", time: "10:00", status: "completed", source: "instagram", amount: 8000 },
  { id: 87, customerId: 12, customerName: "Priti Patel", staffId: 13, staffName: "Suresh Rao", serviceId: 3, serviceName: "Hair Color", branchId: 3, date: "2026-05-22", time: "12:00", status: "completed", source: "call", amount: 1500 },

  // May 21 (Thursday)
  { id: 88, customerId: 13, customerName: "Harish Rao", staffId: 1, staffName: "Ravi Kumar", serviceId: 9, serviceName: "Hair Spa", branchId: 1, date: "2026-05-21", time: "16:00", status: "completed", source: "whatsapp", amount: 1200 },
  { id: 89, customerId: 23, customerName: "Harsh Bhatia", staffId: 7, staffName: "Mohammed Irfan", serviceId: 1, serviceName: "Haircut (Men)", branchId: 2, date: "2026-05-21", time: "13:00", status: "completed", source: "walkin", amount: 300 },
  { id: 90, customerId: 8, customerName: "Vikram Rathore", staffId: 12, staffName: "Deepak Nair", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-21", time: "14:00", status: "completed", source: "website", amount: 1200 },

  // May 20 (Wednesday)
  { id: 91, customerId: 44, customerName: "Aditi Sawant", staffId: 2, staffName: "Priya Sharma", serviceId: 2, serviceName: "Haircut (Women)", branchId: 1, date: "2026-05-20", time: "10:00", status: "completed", source: "website", amount: 600 },
  { id: 92, customerId: 28, customerName: "Sohail Qureshi", staffId: 8, staffName: "Rajesh Kulkarni", serviceId: 9, serviceName: "Hair Spa", branchId: 2, date: "2026-05-20", time: "11:30", status: "completed", source: "whatsapp", amount: 1200 },
  { id: 93, customerId: 15, customerName: "Rahul Nair", staffId: 14, staffName: "Tina Fernandes", serviceId: 4, serviceName: "Facial", branchId: 3, date: "2026-05-20", time: "12:00", status: "completed", source: "call", amount: 800 }
];

const inventory = [
  // Branch 1: Banjara Hills
  { id: 1, name: "Schwarzkopf Hair Color", category: "Color", branchId: 1, quantity: 8, minStock: 10, unit: "tubes", price: 450 },
  { id: 2, name: "Loreal Shampoo 1L", category: "Shampoo", branchId: 1, quantity: 3, minStock: 6, unit: "bottles", price: 380 },
  { id: 3, name: "Waxing Strips", category: "Wax", branchId: 1, quantity: 2, minStock: 15, unit: "packs", price: 120 },
  { id: 8, name: "Beard Oil (Ustraa)", category: "Men", branchId: 1, quantity: 6, minStock: 5, unit: "bottles", price: 250 },
  { id: 9, name: "Face Scrub (O3+)", category: "Skin", branchId: 1, quantity: 12, minStock: 8, unit: "jars", price: 890 },
  { id: 10, name: "Nail Gel Remover", category: "Nails", branchId: 1, quantity: 1, minStock: 4, unit: "bottles", price: 180 },
  { id: 11, name: "Disposable Capes", category: "Supplies", branchId: 1, quantity: 60, minStock: 25, unit: "pieces", price: 5 },
  { id: 22, name: "Conditioner Pack (Loreal)", category: "Shampoo", branchId: 1, quantity: 14, minStock: 8, unit: "bottles", price: 340 },
  { id: 23, name: "Hair Bleach Powder", category: "Color", branchId: 1, quantity: 1, minStock: 5, unit: "cans", price: 600 },

  // Branch 2: Jubilee Hills
  { id: 4, name: "Nail Polish Set (O.P.I)", category: "Nails", branchId: 2, quantity: 15, minStock: 10, unit: "pieces", price: 200 },
  { id: 5, name: "Facial Kit (Lotus Herbals)", category: "Skin", branchId: 2, quantity: 4, minStock: 10, unit: "kits", price: 550 },
  { id: 12, name: "Shampoo Dispenser pump", category: "Shampoo", branchId: 2, quantity: 2, minStock: 5, unit: "bottles", price: 400 },
  { id: 13, name: "Hair Setting Spray", category: "Color", branchId: 2, quantity: 14, minStock: 6, unit: "cans", price: 320 },
  { id: 14, name: "Bridal Makeup Primer", category: "Makeup", branchId: 2, quantity: 1, minStock: 3, unit: "bottles", price: 1200 },
  { id: 15, name: "Cotton Cleansing Pads", category: "Supplies", branchId: 2, quantity: 9, minStock: 20, unit: "packs", price: 95 },
  { id: 16, name: "Detangling Combs", category: "Supplies", branchId: 2, quantity: 11, minStock: 10, unit: "pieces", price: 80 },
  { id: 24, name: "Manicure Oil (O.P.I)", category: "Nails", branchId: 2, quantity: 8, minStock: 5, unit: "bottles", price: 150 },

  // Branch 3: Gachibowli
  { id: 6, name: "Hair Spa Cream (Matrix)", category: "Hair", branchId: 3, quantity: 1, minStock: 5, unit: "jars", price: 700 },
  { id: 7, name: "Disposable Towels", category: "Supplies", branchId: 3, quantity: 18, minStock: 30, unit: "rolls", price: 80 },
  { id: 17, name: "Matrix Styling Gel", category: "Hair", branchId: 3, quantity: 22, minStock: 10, unit: "tubes", price: 180 },
  { id: 18, name: "Loreal Developer 20Vol", category: "Color", branchId: 3, quantity: 3, minStock: 8, unit: "bottles", price: 450 },
  { id: 19, name: "Cuticle Nippers", category: "Nails", branchId: 3, quantity: 12, minStock: 5, unit: "pieces", price: 300 },
  { id: 20, name: "Detox Face Mask Pack", category: "Skin", branchId: 3, quantity: 5, minStock: 6, unit: "jars", price: 620 },
  { id: 21, name: "Surgical Spirit 500ml", category: "Supplies", branchId: 3, quantity: 2, minStock: 4, unit: "bottles", price: 150 },
  { id: 25, name: "Disposable Face Masks", category: "Supplies", branchId: 3, quantity: 120, minStock: 50, unit: "pieces", price: 2 }
];

export { branches, services, staff, customers, appointments, inventory };
