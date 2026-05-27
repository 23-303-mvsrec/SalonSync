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
  // Branch 1: Banjara Hills
  { id: 1, name: "Ravi Kumar", role: "Senior Stylist", branchId: 1, commissionPct: 20, phone: "9876543210" },
  { id: 2, name: "Priya Sharma", role: "Hair Colorist", branchId: 1, commissionPct: 22, phone: "9876543211" },
  { id: 7, name: "Vikram Malhotra", role: "Nail Artist", branchId: 1, commissionPct: 15, phone: "9876543216" },
  { id: 8, name: "Nisha Sen", role: "Skin Therapist", branchId: 1, commissionPct: 18, phone: "9876543217" },
  
  // Branch 2: Jubilee Hills
  { id: 3, name: "Anjali Reddy", role: "Makeup Artist", branchId: 2, commissionPct: 25, phone: "9876543212" },
  { id: 4, name: "Mohammed Irfan", role: "Stylist", branchId: 2, commissionPct: 18, phone: "9876543213" },
  { id: 9, name: "Rajesh Kulkarni", role: "Senior Stylist", branchId: 2, commissionPct: 20, phone: "9876543218" },
  { id: 10, name: "Divya Joshi", role: "Nail Care Expert", branchId: 2, commissionPct: 15, phone: "9876543219" },
  
  // Branch 3: Gachibowli
  { id: 5, name: "Sunita Patel", role: "Nail Technician", branchId: 3, commissionPct: 20, phone: "9876543214" },
  { id: 6, name: "Deepak Nair", role: "Senior Stylist", branchId: 3, commissionPct: 22, phone: "9876543215" },
  { id: 11, name: "Suresh Rao", role: "Hair Color Specialist", branchId: 3, commissionPct: 20, phone: "9876543220" },
  { id: 12, name: "Tina Fernandes", role: "Aesthetician", branchId: 3, commissionPct: 18, phone: "9876543221" }
];

const customers = [
  { id: 1, name: "Meera Joshi", phone: "9111111111", email: "meera@email.com", loyaltyPoints: 450, totalVisits: 12, preferredBranch: 1, membershipId: 1 },
  { id: 2, name: "Arjun Singh", phone: "9222222222", email: "arjun@email.com", loyaltyPoints: 200, totalVisits: 5, preferredBranch: 1 },
  { id: 3, name: "Kavya Rao", phone: "9333333333", email: "kavya@email.com", loyaltyPoints: 800, totalVisits: 22, preferredBranch: 2, membershipId: 3 },
  { id: 4, name: "Rahul Verma", phone: "9444444444", email: "rahul@email.com", loyaltyPoints: 120, totalVisits: 3, preferredBranch: 2 },
  { id: 5, name: "Sneha Gupta", phone: "9555555555", email: "sneha@email.com", loyaltyPoints: 650, totalVisits: 18, preferredBranch: 3 },
  { id: 6, name: "Aditya Roy", phone: "9666666666", email: "aditya@email.com", loyaltyPoints: 310, totalVisits: 9, preferredBranch: 1, membershipId: 2 },
  { id: 7, name: "Pooja Hegde", phone: "9777777777", email: "pooja@email.com", loyaltyPoints: 95, totalVisits: 2, preferredBranch: 2 },
  { id: 8, name: "Vikram Rathore", phone: "9888888888", email: "vikram@email.com", loyaltyPoints: 500, totalVisits: 14, preferredBranch: 3, membershipId: 3 },
  { id: 9, name: "Tanvi Shah", phone: "9999999999", email: "tanvi@email.com", loyaltyPoints: 720, totalVisits: 19, preferredBranch: 1, membershipId: 1 },
  { id: 10, name: "Rohan Das", phone: "9000000000", email: "rohan@email.com", loyaltyPoints: 40, totalVisits: 1, preferredBranch: 2 },
  { id: 11, name: "Karan Johar", phone: "9123456789", email: "karan@email.com", loyaltyPoints: 1200, totalVisits: 31, preferredBranch: 2, membershipId: 3 },
  { id: 12, name: "Preity Zinta", phone: "9876501234", email: "preity@email.com", loyaltyPoints: 350, totalVisits: 8, preferredBranch: 3 },
  { id: 13, name: "Hrithik Roshan", phone: "9112233445", email: "hrithik@email.com", loyaltyPoints: 600, totalVisits: 15, preferredBranch: 1, membershipId: 2 },
  { id: 14, name: "Kareena Kapoor", phone: "9223344556", email: "kareena@email.com", loyaltyPoints: 900, totalVisits: 25, preferredBranch: 2, membershipId: 1 },
  { id: 15, name: "Ranbir Kapoor", phone: "9334455667", email: "ranbir@email.com", loyaltyPoints: 180, totalVisits: 4, preferredBranch: 3 },
  { id: 16, name: "Alia Bhatt", phone: "9445566778", email: "alia@email.com", loyaltyPoints: 540, totalVisits: 11, preferredBranch: 1 }
];

const appointments = [
  // --- BRANCH 1: BANJARA HILLS (12 appointments today) ---
  { id: 1, customerId: 1, customerName: "Meera Joshi", staffId: 1, staffName: "Ravi Kumar", serviceId: 2, serviceName: "Haircut (Women)", branchId: 1, date: "2026-05-26", time: "10:00", status: "completed", source: "website", amount: 600 },
  { id: 2, customerId: 2, customerName: "Arjun Singh", staffId: 1, staffName: "Ravi Kumar", serviceId: 1, serviceName: "Haircut (Men)", branchId: 1, date: "2026-05-26", time: "11:00", status: "confirmed", source: "walkin", amount: 300 },
  { id: 6, customerId: 1, customerName: "Meera Joshi", staffId: 2, staffName: "Priya Sharma", serviceId: 3, serviceName: "Hair Color", branchId: 1, date: "2026-05-26", time: "16:00", status: "pending", source: "website", amount: 1500 },
  { id: 7, customerId: 6, customerName: "Aditya Roy", staffId: 1, staffName: "Ravi Kumar", serviceId: 7, serviceName: "Beard Trim", branchId: 1, date: "2026-05-26", time: "09:30", status: "completed", source: "call", amount: 150 },
  { id: 8, customerId: 9, customerName: "Tanvi Shah", staffId: 2, staffName: "Priya Sharma", serviceId: 9, serviceName: "Hair Spa", branchId: 1, date: "2026-05-26", time: "12:30", status: "completed", source: "whatsapp", amount: 1200 },
  { id: 9, customerId: 13, customerName: "Hrithik Roshan", staffId: 7, staffName: "Vikram Malhotra", serviceId: 5, serviceName: "Manicure", branchId: 1, date: "2026-05-26", time: "14:00", status: "inprogress", source: "walkin", amount: 500 },
  { id: 10, customerId: 16, customerName: "Alia Bhatt", staffId: 8, staffName: "Nisha Sen", serviceId: 4, serviceName: "Facial", branchId: 1, date: "2026-05-26", time: "15:00", status: "confirmed", source: "instagram", amount: 8000 },
  { id: 11, customerId: 2, customerName: "Arjun Singh", staffId: 7, staffName: "Vikram Malhotra", serviceId: 6, serviceName: "Pedicure", branchId: 1, date: "2026-05-26", time: "17:30", status: "confirmed", source: "call", amount: 600 },
  { id: 12, customerId: 9, customerName: "Tanvi Shah", staffId: 8, staffName: "Nisha Sen", serviceId: 8, serviceName: "Waxing (Full Arms)", branchId: 1, date: "2026-05-26", time: "11:30", status: "completed", source: "website", amount: 400 },
  { id: 13, customerId: 13, customerName: "Hrithik Roshan", staffId: 1, staffName: "Ravi Kumar", serviceId: 9, serviceName: "Hair Spa", branchId: 1, date: "2026-05-26", time: "18:00", status: "pending", source: "instagram", amount: 1200 },
  { id: 14, customerId: 1, customerName: "Meera Joshi", staffId: 2, staffName: "Priya Sharma", serviceId: 2, serviceName: "Haircut (Women)", branchId: 1, date: "2026-05-26", time: "13:30", status: "completed", source: "website", amount: 600 },
  { id: 15, customerId: 6, customerName: "Aditya Roy", staffId: 7, staffName: "Vikram Malhotra", serviceId: 1, serviceName: "Haircut (Men)", branchId: 1, date: "2026-05-26", time: "19:00", status: "cancelled", source: "whatsapp", amount: 300 },

  // --- BRANCH 2: JUBILEE HILLS (12 appointments today) ---
  { id: 3, customerId: 3, customerName: "Kavya Rao", staffId: 3, staffName: "Anjali Reddy", serviceId: 10, serviceName: "Bridal Makeup", branchId: 2, date: "2026-05-26", time: "09:00", status: "inprogress", source: "whatsapp", amount: 8000 },
  { id: 4, customerId: 4, customerName: "Rahul Verma", staffId: 4, staffName: "Mohammed Irfan", serviceId: 7, serviceName: "Beard Trim", branchId: 2, date: "2026-05-26", time: "14:00", status: "confirmed", source: "call", amount: 150 },
  { id: 16, customerId: 7, customerName: "Pooja Hegde", staffId: 3, staffName: "Anjali Reddy", serviceId: 10, serviceName: "Bridal Makeup", branchId: 2, date: "2026-05-26", time: "13:00", status: "completed", source: "instagram", amount: 8000 },
  { id: 17, customerId: 11, customerName: "Karan Johar", staffId: 9, staffName: "Rajesh Kulkarni", serviceId: 9, serviceName: "Hair Spa", branchId: 2, date: "2026-05-26", time: "11:00", status: "completed", source: "website", amount: 1200 },
  { id: 18, customerId: 14, customerName: "Kareena Kapoor", staffId: 10, staffName: "Divya Joshi", serviceId: 5, serviceName: "Manicure", branchId: 2, date: "2026-05-26", time: "10:30", status: "completed", source: "walkin", amount: 500 },
  { id: 19, customerId: 10, customerName: "Rohan Das", staffId: 4, staffName: "Mohammed Irfan", serviceId: 1, serviceName: "Haircut (Men)", branchId: 2, date: "2026-05-26", time: "12:00", status: "confirmed", source: "call", amount: 300 },
  { id: 20, customerId: 3, customerName: "Kavya Rao", staffId: 9, staffName: "Rajesh Kulkarni", serviceId: 3, serviceName: "Hair Color", branchId: 2, date: "2026-05-26", time: "15:30", status: "confirmed", source: "whatsapp", amount: 1500 },
  { id: 21, customerId: 7, customerName: "Pooja Hegde", staffId: 10, staffName: "Divya Joshi", serviceId: 6, serviceName: "Pedicure", branchId: 2, date: "2026-05-26", time: "16:00", status: "pending", source: "walkin", amount: 600 },
  { id: 22, customerId: 11, customerName: "Karan Johar", staffId: 4, staffName: "Mohammed Irfan", serviceId: 7, serviceName: "Beard Trim", branchId: 2, date: "2026-05-26", time: "17:00", status: "completed", source: "website", amount: 150 },
  { id: 23, customerId: 14, customerName: "Kareena Kapoor", staffId: 3, staffName: "Anjali Reddy", serviceId: 4, serviceName: "Facial", branchId: 2, date: "2026-05-26", time: "18:00", status: "pending", source: "instagram", amount: 800 },
  { id: 24, customerId: 4, customerName: "Rahul Verma", staffId: 9, staffName: "Rajesh Kulkarni", serviceId: 2, serviceName: "Haircut (Women)", branchId: 2, date: "2026-05-26", time: "09:30", status: "completed", source: "call", amount: 600 },
  { id: 25, customerId: 10, customerName: "Rohan Das", staffId: 10, staffName: "Divya Joshi", serviceId: 5, serviceName: "Manicure", branchId: 2, date: "2026-05-26", time: "19:00", status: "confirmed", source: "whatsapp", amount: 500 },

  // --- BRANCH 3: GACHIBOWLI (12 appointments today) ---
  { id: 5, customerId: 5, customerName: "Sneha Gupta", staffId: 6, staffName: "Deepak Nair", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-26", time: "15:00", status: "confirmed", source: "instagram", amount: 1200 },
  { id: 26, customerId: 8, customerName: "Vikram Rathore", staffId: 5, staffName: "Sunita Patel", serviceId: 6, serviceName: "Pedicure", branchId: 3, date: "2026-05-26", time: "10:00", status: "completed", source: "walkin", amount: 600 },
  { id: 27, customerId: 12, customerName: "Preity Zinta", staffId: 11, staffName: "Suresh Rao", serviceId: 3, serviceName: "Hair Color", branchId: 3, date: "2026-05-26", time: "11:30", status: "completed", source: "call", amount: 1500 },
  { id: 28, customerId: 15, customerName: "Ranbir Kapoor", staffId: 6, staffName: "Deepak Nair", serviceId: 1, serviceName: "Haircut (Men)", branchId: 3, date: "2026-05-26", time: "09:00", status: "completed", source: "whatsapp", amount: 300 },
  { id: 29, customerId: 5, customerName: "Sneha Gupta", staffId: 12, staffName: "Tina Fernandes", serviceId: 4, serviceName: "Facial", branchId: 3, date: "2026-05-26", time: "13:00", status: "completed", source: "website", amount: 800 },
  { id: 30, customerId: 8, customerName: "Vikram Rathore", staffId: 6, staffName: "Deepak Nair", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-26", time: "14:00", status: "inprogress", source: "instagram", amount: 1200 },
  { id: 31, customerId: 12, customerName: "Preity Zinta", staffId: 5, staffName: "Sunita Patel", serviceId: 5, serviceName: "Manicure", branchId: 3, date: "2026-05-26", time: "16:30", status: "confirmed", source: "walkin", amount: 500 },
  { id: 32, customerId: 15, customerName: "Ranbir Kapoor", staffId: 12, staffName: "Tina Fernandes", serviceId: 8, serviceName: "Waxing (Full Arms)", branchId: 3, date: "2026-05-26", time: "17:00", status: "confirmed", source: "call", amount: 400 },
  { id: 33, customerId: 5, customerName: "Sneha Gupta", staffId: 11, staffName: "Suresh Rao", serviceId: 2, serviceName: "Haircut (Women)", branchId: 3, date: "2026-05-26", time: "12:00", status: "completed", source: "whatsapp", amount: 600 },
  { id: 34, customerId: 8, customerName: "Vikram Rathore", staffId: 12, staffName: "Tina Fernandes", serviceId: 4, serviceName: "Facial", branchId: 3, date: "2026-05-26", time: "18:00", status: "pending", source: "website", amount: 800 },
  { id: 35, customerId: 12, customerName: "Preity Zinta", staffId: 6, staffName: "Deepak Nair", serviceId: 1, serviceName: "Haircut (Men)", branchId: 3, date: "2026-05-26", time: "19:00", status: "pending", source: "instagram", amount: 300 },
  { id: 36, customerId: 15, customerName: "Ranbir Kapoor", staffId: 5, staffName: "Sunita Patel", serviceId: 6, serviceName: "Pedicure", branchId: 3, date: "2026-05-26", time: "16:00", status: "cancelled", source: "call", amount: 600 }
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

  // Branch 2: Jubilee Hills
  { id: 4, name: "Nail Polish Set (O.P.I)", category: "Nails", branchId: 2, quantity: 15, minStock: 10, unit: "pieces", price: 200 },
  { id: 5, name: "Facial Kit (Lotus Herbals)", category: "Skin", branchId: 2, quantity: 4, minStock: 10, unit: "kits", price: 550 },
  { id: 12, name: "Shampoo Dispenser pump", category: "Shampoo", branchId: 2, quantity: 2, minStock: 5, unit: "bottles", price: 400 },
  { id: 13, name: "Hair Setting Spray", category: "Color", branchId: 2, quantity: 14, minStock: 6, unit: "cans", price: 320 },
  { id: 14, name: "Bridal Makeup Primer", category: "Makeup", branchId: 2, quantity: 1, minStock: 3, unit: "bottles", price: 1200 },
  { id: 15, name: "Cotton Cleansing Pads", category: "Supplies", branchId: 2, quantity: 9, minStock: 20, unit: "packs", price: 95 },
  { id: 16, name: "Detangling Combs", category: "Supplies", branchId: 2, quantity: 11, minStock: 10, unit: "pieces", price: 80 },

  // Branch 3: Gachibowli
  { id: 6, name: "Hair Spa Cream (Matrix)", category: "Hair", branchId: 3, quantity: 1, minStock: 5, unit: "jars", price: 700 },
  { id: 7, name: "Disposable Towels", category: "Supplies", branchId: 3, quantity: 18, minStock: 30, unit: "rolls", price: 80 },
  { id: 17, name: "Matrix Styling Gel", category: "Hair", branchId: 3, quantity: 22, minStock: 10, unit: "tubes", price: 180 },
  { id: 18, name: "Loreal Developer 20Vol", category: "Color", branchId: 3, quantity: 3, minStock: 8, unit: "bottles", price: 450 },
  { id: 19, name: "Cuticle Nippers", category: "Nails", branchId: 3, quantity: 12, minStock: 5, unit: "pieces", price: 300 },
  { id: 20, name: "Detox Face Mask Pack", category: "Skin", branchId: 3, quantity: 5, minStock: 6, unit: "jars", price: 620 },
  { id: 21, name: "Surgical Spirit 500ml", category: "Supplies", branchId: 3, quantity: 2, minStock: 4, unit: "bottles", price: 150 }
];

export { branches, services, staff, customers, appointments, inventory };
