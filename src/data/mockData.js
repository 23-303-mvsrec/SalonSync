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
  { id: 7, name: "Pooja Hegde", phone: "9777777777", email: "pooja@email.com", loyaltyPoints: 95, totalVisits: 2, preferredBranch: 2 },
  { id: 8, name: "Vikram Rathore", phone: "9888888888", email: "vikram@email.com", loyaltyPoints: 500, totalVisits: 14, preferredBranch: 3, membershipId: 3 },
  { id: 9, name: "Tanvi Shah", phone: "9999999999", email: "tanvi@email.com", loyaltyPoints: 720, totalVisits: 19, preferredBranch: 1, membershipId: 1 },
  { id: 10, name: "Rohan Das", phone: "9000000000", email: "rohan@email.com", loyaltyPoints: 40, totalVisits: 1, preferredBranch: 2 },
  { id: 11, name: "Karan Johar", phone: "9123456789", email: "karan@email.com", loyaltyPoints: 1200, totalVisits: 31, preferredBranch: 2, membershipId: 3 },
  { id: 12, name: "Preity Zinta", phone: "9876501234", email: "preity@email.com", loyaltyPoints: 350, totalVisits: 8, preferredBranch: 3 },
  { id: 13, name: "Hrithik Roshan", phone: "9112233445", email: "hrithik@email.com", loyaltyPoints: 600, totalVisits: 15, preferredBranch: 1, membershipId: 2 },
  { id: 14, name: "Kareena Kapoor", phone: "9223344556", email: "kareena@email.com", loyaltyPoints: 900, totalVisits: 25, preferredBranch: 2, membershipId: 1 },
  { id: 15, name: "Ranbir Kapoor", phone: "9334455667", email: "ranbir@email.com", loyaltyPoints: 180, totalVisits: 4, preferredBranch: 3 },
  { id: 16, name: "Alia Bhatt", phone: "9445566778", email: "alia@email.com", loyaltyPoints: 540, totalVisits: 11, preferredBranch: 1 },
  { id: 17, name: "Virat Kohli", phone: "9556677889", email: "virat@email.com", loyaltyPoints: 1500, totalVisits: 35, preferredBranch: 1, membershipId: 3 },
  { id: 18, name: "Deepika Padukone", phone: "9667788990", email: "deepika@email.com", loyaltyPoints: 950, totalVisits: 20, preferredBranch: 2, membershipId: 1 },
  { id: 19, name: "Priyanka Chopra", phone: "9778899001", email: "priyanka@email.com", loyaltyPoints: 1100, totalVisits: 28, preferredBranch: 1, membershipId: 3 },
  { id: 20, name: "Sachin Tendulkar", phone: "9889900112", email: "sachin@email.com", loyaltyPoints: 2500, totalVisits: 52, preferredBranch: 2, membershipId: 3 },
  { id: 21, name: "MS Dhoni", phone: "9990011223", email: "dhoni@email.com", loyaltyPoints: 3000, totalVisits: 60, preferredBranch: 1, membershipId: 3 },
  { id: 22, name: "Rohit Sharma", phone: "9001122334", email: "rohit@email.com", loyaltyPoints: 750, totalVisits: 14, preferredBranch: 3 },
  { id: 23, name: "Hardik Pandya", phone: "9112233446", email: "hardik@email.com", loyaltyPoints: 400, totalVisits: 8, preferredBranch: 2 },
  { id: 24, name: "A.R. Rahman", phone: "9223344557", email: "rahman@email.com", loyaltyPoints: 1250, totalVisits: 24, preferredBranch: 1, membershipId: 2 },
  { id: 25, name: "Shreya Ghoshal", phone: "9334455668", email: "shreya@email.com", loyaltyPoints: 980, totalVisits: 19, preferredBranch: 3, membershipId: 1 },
  { id: 26, name: "Arijit Singh", phone: "9445566779", email: "arijit@email.com", loyaltyPoints: 850, totalVisits: 17, preferredBranch: 2 },
  { id: 27, name: "Katrina Kaif", phone: "9556677880", email: "katrina@email.com", loyaltyPoints: 700, totalVisits: 15, preferredBranch: 1, membershipId: 2 },
  { id: 28, name: "Shah Rukh Khan", phone: "9667788991", email: "srk@email.com", loyaltyPoints: 4500, totalVisits: 90, preferredBranch: 2, membershipId: 3 },
  { id: 29, name: "Aamir Khan", phone: "9778899002", email: "aamir@email.com", loyaltyPoints: 1350, totalVisits: 22, preferredBranch: 3 },
  { id: 30, name: "Kiara Advani", phone: "9889900113", email: "kiara@email.com", loyaltyPoints: 920, totalVisits: 18, preferredBranch: 1, membershipId: 1 },
  { id: 31, name: "Sidharth Malhotra", phone: "9990011224", email: "sid@email.com", loyaltyPoints: 600, totalVisits: 12, preferredBranch: 1 },
  { id: 32, name: "Kriti Sanon", phone: "9001122335", email: "kriti@email.com", loyaltyPoints: 500, totalVisits: 10, preferredBranch: 2 },
  { id: 33, name: "Ranveer Singh", phone: "9112233447", email: "ranveer@email.com", loyaltyPoints: 1100, totalVisits: 21, preferredBranch: 2, membershipId: 3 },
  { id: 34, name: "Anushka Sharma", phone: "9223344558", email: "anushka@email.com", loyaltyPoints: 800, totalVisits: 16, preferredBranch: 1, membershipId: 1 },
  { id: 35, name: "KL Rahul", phone: "9334455669", email: "klrahul@email.com", loyaltyPoints: 450, totalVisits: 9, preferredBranch: 3 },
  { id: 36, name: "Rishabh Pant", phone: "9445566780", email: "pant@email.com", loyaltyPoints: 350, totalVisits: 7, preferredBranch: 3 },
  { id: 37, name: "Jasprit Bumrah", phone: "9556677891", email: "bumrah@email.com", loyaltyPoints: 900, totalVisits: 18, preferredBranch: 1 },
  { id: 38, name: "Ravindra Jadeja", phone: "9667788992", email: "sirjadeja@email.com", loyaltyPoints: 1050, totalVisits: 20, preferredBranch: 3, membershipId: 2 },
  { id: 39, name: "Sara Ali Khan", phone: "9778899003", email: "sara@email.com", loyaltyPoints: 240, totalVisits: 5, preferredBranch: 2 },
  { id: 40, name: "Janhvi Kapoor", phone: "9889900114", email: "janhvi@email.com", loyaltyPoints: 400, totalVisits: 8, preferredBranch: 2 },
  { id: 41, name: "Samantha Prabhu", phone: "9990011225", email: "samantha@email.com", loyaltyPoints: 1400, totalVisits: 26, preferredBranch: 3, membershipId: 1 },
  { id: 42, name: "Nayanthara Kurian", phone: "9001122336", email: "nayanthara@email.com", loyaltyPoints: 1800, totalVisits: 30, preferredBranch: 1, membershipId: 3 },
  { id: 43, name: "Diljit Dosanjh", phone: "9112233448", email: "diljit@email.com", loyaltyPoints: 1300, totalVisits: 25, preferredBranch: 2, membershipId: 2 },
  { id: 44, name: "Aishwarya Rai", phone: "9223344559", email: "aishwarya@email.com", loyaltyPoints: 2100, totalVisits: 40, preferredBranch: 1, membershipId: 3 },
  { id: 45, name: "Salman Khan", phone: "9334455670", email: "salman@email.com", loyaltyPoints: 2800, totalVisits: 50, preferredBranch: 2 },
  { id: 46, name: "Akshay Kumar", phone: "9445566781", email: "akshay@email.com", loyaltyPoints: 3200, totalVisits: 65, preferredBranch: 3, membershipId: 3 },
  { id: 47, name: "Rashmika Mandanna", phone: "9556677892", email: "rashmika@email.com", loyaltyPoints: 780, totalVisits: 14, preferredBranch: 3, membershipId: 1 },
  { id: 48, name: "Yuvraj Singh", phone: "9667788993", email: "yuvi@email.com", loyaltyPoints: 850, totalVisits: 17, preferredBranch: 1 },
  { id: 49, name: "Shraddha Kapoor", phone: "9778899004", email: "shraddha@email.com", loyaltyPoints: 600, totalVisits: 13, preferredBranch: 2 },
  { id: 50, name: "Kamal Haasan", phone: "9889900115", email: "kamal@email.com", loyaltyPoints: 2200, totalVisits: 44, preferredBranch: 3, membershipId: 3 }
];

const appointments = [
  // Target Session Date: 2026-05-26 (Tuesday)
  // --- BRANCH 1: BANJARA HILLS (25 appointments on target date) ---
  { id: 1, customerId: 1, customerName: "Meera Joshi", staffId: 1, staffName: "Ravi Kumar", serviceId: 2, serviceName: "Haircut (Women)", branchId: 1, date: "2026-05-26", time: "10:00", status: "completed", source: "website", amount: 600 },
  { id: 2, customerId: 2, customerName: "Arjun Singh", staffId: 1, staffName: "Ravi Kumar", serviceId: 1, serviceName: "Haircut (Men)", branchId: 1, date: "2026-05-26", time: "11:00", status: "confirmed", source: "walkin", amount: 300 },
  { id: 3, customerId: 6, customerName: "Aditya Roy", staffId: 1, staffName: "Ravi Kumar", serviceId: 7, serviceName: "Beard Trim", branchId: 1, date: "2026-05-26", time: "09:30", status: "completed", source: "call", amount: 150 },
  { id: 4, customerId: 9, customerName: "Tanvi Shah", staffId: 2, staffName: "Priya Sharma", serviceId: 9, serviceName: "Hair Spa", branchId: 1, date: "2026-05-26", time: "12:30", status: "completed", source: "whatsapp", amount: 1200 },
  { id: 5, customerId: 13, customerName: "Hrithik Roshan", staffId: 3, staffName: "Vikram Malhotra", serviceId: 5, serviceName: "Manicure", branchId: 1, date: "2026-05-26", time: "14:00", status: "inprogress", source: "walkin", amount: 500 },
  { id: 6, customerId: 16, customerName: "Alia Bhatt", staffId: 4, staffName: "Nisha Sen", serviceId: 4, serviceName: "Facial", branchId: 1, date: "2026-05-26", time: "15:00", status: "confirmed", source: "instagram", amount: 8000 },
  { id: 7, customerId: 2, customerName: "Arjun Singh", staffId: 3, staffName: "Vikram Malhotra", serviceId: 6, serviceName: "Pedicure", branchId: 1, date: "2026-05-26", time: "17:30", status: "confirmed", source: "call", amount: 600 },
  { id: 8, customerId: 9, customerName: "Tanvi Shah", staffId: 4, staffName: "Nisha Sen", serviceId: 8, serviceName: "Waxing (Full Arms)", branchId: 1, date: "2026-05-26", time: "11:30", status: "completed", source: "website", amount: 400 },
  { id: 9, customerId: 13, customerName: "Hrithik Roshan", staffId: 1, staffName: "Ravi Kumar", serviceId: 9, serviceName: "Hair Spa", branchId: 1, date: "2026-05-26", time: "18:00", status: "pending", source: "instagram", amount: 1200 },
  { id: 10, customerId: 1, customerName: "Meera Joshi", staffId: 2, staffName: "Priya Sharma", serviceId: 2, serviceName: "Haircut (Women)", branchId: 1, date: "2026-05-26", time: "13:30", status: "completed", source: "website", amount: 600 },
  { id: 11, customerId: 17, customerName: "Virat Kohli", staffId: 1, staffName: "Ravi Kumar", serviceId: 1, serviceName: "Haircut (Men)", branchId: 1, date: "2026-05-26", time: "10:30", status: "completed", source: "whatsapp", amount: 300 },
  { id: 12, customerId: 19, customerName: "Priyanka Chopra", staffId: 2, staffName: "Priya Sharma", serviceId: 3, serviceName: "Hair Color", branchId: 1, date: "2026-05-26", time: "15:00", status: "inprogress", source: "instagram", amount: 1500 },
  { id: 13, customerId: 21, customerName: "MS Dhoni", staffId: 4, staffName: "Nisha Sen", serviceId: 4, serviceName: "Facial", branchId: 1, date: "2026-05-26", time: "16:30", status: "completed", source: "website", amount: 800 },
  { id: 14, customerId: 24, customerName: "A.R. Rahman", staffId: 5, staffName: "Amit Trivedi", serviceId: 9, serviceName: "Hair Spa", branchId: 1, date: "2026-05-26", time: "13:00", status: "completed", source: "call", amount: 1200 },
  { id: 15, customerId: 27, customerName: "Katrina Kaif", staffId: 3, staffName: "Vikram Malhotra", serviceId: 5, serviceName: "Manicure", branchId: 1, date: "2026-05-26", time: "14:30", status: "completed", source: "walkin", amount: 500 },
  { id: 16, customerId: 30, customerName: "Kiara Advani", staffId: 1, staffName: "Ravi Kumar", serviceId: 2, serviceName: "Haircut (Women)", branchId: 1, date: "2026-05-26", time: "09:00", status: "completed", source: "whatsapp", amount: 600 },
  { id: 17, customerId: 31, customerName: "Sidharth Malhotra", staffId: 5, staffName: "Amit Trivedi", serviceId: 7, serviceName: "Beard Trim", branchId: 1, date: "2026-05-26", time: "11:30", status: "completed", source: "call", amount: 150 },
  { id: 18, customerId: 34, customerName: "Anushka Sharma", staffId: 2, staffName: "Priya Sharma", serviceId: 3, serviceName: "Hair Color", branchId: 1, date: "2026-05-26", time: "16:00", status: "pending", source: "website", amount: 1500 },
  { id: 19, customerId: 37, customerName: "Jasprit Bumrah", staffId: 1, staffName: "Ravi Kumar", serviceId: 1, serviceName: "Haircut (Men)", branchId: 1, date: "2026-05-26", time: "12:00", status: "completed", source: "walkin", amount: 300 },
  { id: 20, customerId: 44, customerName: "Aishwarya Rai", staffId: 4, staffName: "Nisha Sen", serviceId: 10, serviceName: "Bridal Makeup", branchId: 1, date: "2026-05-26", time: "15:00", status: "inprogress", source: "instagram", amount: 8000 },
  { id: 21, customerId: 48, customerName: "Yuvraj Singh", staffId: 5, staffName: "Amit Trivedi", serviceId: 1, serviceName: "Haircut (Men)", branchId: 1, date: "2026-05-26", time: "14:00", status: "confirmed", source: "whatsapp", amount: 300 },
  { id: 22, customerId: 1, customerName: "Meera Joshi", staffId: 3, staffName: "Vikram Malhotra", serviceId: 6, serviceName: "Pedicure", branchId: 1, date: "2026-05-26", time: "18:30", status: "confirmed", source: "call", amount: 600 },
  { id: 23, customerId: 17, customerName: "Virat Kohli", staffId: 1, staffName: "Ravi Kumar", serviceId: 9, serviceName: "Hair Spa", branchId: 1, date: "2026-05-26", time: "19:00", status: "pending", source: "website", amount: 1200 },
  { id: 24, customerId: 19, customerName: "Priyanka Chopra", staffId: 2, staffName: "Priya Sharma", serviceId: 2, serviceName: "Haircut (Women)", branchId: 1, date: "2026-05-26", time: "11:00", status: "completed", source: "walkin", amount: 600 },
  { id: 25, customerId: 9, customerName: "Tanvi Shah", staffId: 4, staffName: "Nisha Sen", serviceId: 4, serviceName: "Facial", branchId: 1, date: "2026-05-26", time: "17:00", status: "completed", source: "whatsapp", amount: 800 },

  // --- BRANCH 2: JUBILEE HILLS (25 appointments on target date) ---
  { id: 26, customerId: 3, customerName: "Kavya Rao", staffId: 6, staffName: "Anjali Reddy", serviceId: 10, serviceName: "Bridal Makeup", branchId: 2, date: "2026-05-26", time: "09:00", status: "completed", source: "whatsapp", amount: 8000 },
  { id: 27, customerId: 4, customerName: "Rahul Verma", staffId: 7, staffName: "Mohammed Irfan", serviceId: 7, serviceName: "Beard Trim", branchId: 2, date: "2026-05-26", time: "14:00", status: "confirmed", source: "call", amount: 150 },
  { id: 28, customerId: 7, customerName: "Pooja Hegde", staffId: 6, staffName: "Anjali Reddy", serviceId: 10, serviceName: "Bridal Makeup", branchId: 2, date: "2026-05-26", time: "13:00", status: "completed", source: "instagram", amount: 8000 },
  { id: 29, customerId: 11, customerName: "Karan Johar", staffId: 8, staffName: "Rajesh Kulkarni", serviceId: 9, serviceName: "Hair Spa", branchId: 2, date: "2026-05-26", time: "11:00", status: "completed", source: "website", amount: 1200 },
  { id: 30, customerId: 14, customerName: "Kareena Kapoor", staffId: 9, staffName: "Divya Joshi", serviceId: 5, serviceName: "Manicure", branchId: 2, date: "2026-05-26", time: "10:30", status: "completed", source: "walkin", amount: 500 },
  { id: 31, customerId: 10, customerName: "Rohan Das", staffId: 7, staffName: "Mohammed Irfan", serviceId: 1, serviceName: "Haircut (Men)", branchId: 2, date: "2026-05-26", time: "12:00", status: "confirmed", source: "call", amount: 300 },
  { id: 32, customerId: 3, customerName: "Kavya Rao", staffId: 8, staffName: "Rajesh Kulkarni", serviceId: 3, serviceName: "Hair Color", branchId: 2, date: "2026-05-26", time: "15:30", status: "confirmed", source: "whatsapp", amount: 1500 },
  { id: 33, customerId: 7, customerName: "Pooja Hegde", staffId: 9, staffName: "Divya Joshi", serviceId: 6, serviceName: "Pedicure", branchId: 2, date: "2026-05-26", time: "16:00", status: "pending", source: "walkin", amount: 600 },
  { id: 34, customerId: 11, customerName: "Karan Johar", staffId: 7, staffName: "Mohammed Irfan", serviceId: 7, serviceName: "Beard Trim", branchId: 2, date: "2026-05-26", time: "17:00", status: "completed", source: "website", amount: 150 },
  { id: 35, customerId: 14, customerName: "Kareena Kapoor", staffId: 6, staffName: "Anjali Reddy", serviceId: 4, serviceName: "Facial", branchId: 2, date: "2026-05-26", time: "18:00", status: "pending", source: "instagram", amount: 800 },
  { id: 36, customerId: 18, customerName: "Deepika Padukone", staffId: 6, staffName: "Anjali Reddy", serviceId: 10, serviceName: "Bridal Makeup", branchId: 2, date: "2026-05-26", time: "10:00", status: "inprogress", source: "website", amount: 8000 },
  { id: 37, customerId: 20, customerName: "Sachin Tendulkar", staffId: 8, staffName: "Rajesh Kulkarni", serviceId: 9, serviceName: "Hair Spa", branchId: 2, date: "2026-05-26", time: "12:30", status: "completed", source: "whatsapp", amount: 1200 },
  { id: 38, customerId: 23, customerName: "Hardik Pandya", staffId: 7, staffName: "Mohammed Irfan", serviceId: 1, serviceName: "Haircut (Men)", branchId: 2, date: "2026-05-26", time: "14:30", status: "completed", source: "walkin", amount: 300 },
  { id: 39, customerId: 26, customerName: "Arijit Singh", staffId: 10, staffName: "Karan Singhal", serviceId: 3, serviceName: "Hair Color", branchId: 2, date: "2026-05-26", time: "16:30", status: "completed", source: "call", amount: 1500 },
  { id: 40, customerId: 28, customerName: "Shah Rukh Khan", staffId: 8, staffName: "Rajesh Kulkarni", serviceId: 9, serviceName: "Hair Spa", branchId: 2, date: "2026-05-26", time: "15:00", status: "completed", source: "whatsapp", amount: 1200 },
  { id: 41, customerId: 32, customerName: "Kriti Sanon", staffId: 9, staffName: "Divya Joshi", serviceId: 5, serviceName: "Manicure", branchId: 2, date: "2026-05-26", time: "11:30", status: "completed", source: "instagram", amount: 500 },
  { id: 42, customerId: 33, customerName: "Ranveer Singh", staffId: 10, staffName: "Karan Singhal", serviceId: 1, serviceName: "Haircut (Men)", branchId: 2, date: "2026-05-26", time: "13:30", status: "completed", source: "website", amount: 300 },
  { id: 43, customerId: 39, customerName: "Sara Ali Khan", staffId: 6, staffName: "Anjali Reddy", serviceId: 10, serviceName: "Bridal Makeup", branchId: 2, date: "2026-05-26", time: "16:00", status: "confirmed", source: "whatsapp", amount: 8000 },
  { id: 44, customerId: 40, customerName: "Janhvi Kapoor", staffId: 9, staffName: "Divya Joshi", serviceId: 6, serviceName: "Pedicure", branchId: 2, date: "2026-05-26", time: "18:30", status: "confirmed", source: "call", amount: 600 },
  { id: 45, customerId: 43, customerName: "Diljit Dosanjh", staffId: 8, staffName: "Rajesh Kulkarni", serviceId: 3, serviceName: "Hair Color", branchId: 2, date: "2026-05-26", time: "10:30", status: "completed", source: "website", amount: 1500 },
  { id: 46, customerId: 45, customerName: "Salman Khan", staffId: 7, staffName: "Mohammed Irfan", serviceId: 1, serviceName: "Haircut (Men)", branchId: 2, date: "2026-05-26", time: "12:00", status: "inprogress", source: "walkin", amount: 300 },
  { id: 47, customerId: 49, customerName: "Shraddha Kapoor", staffId: 10, staffName: "Karan Singhal", serviceId: 2, serviceName: "Haircut (Women)", branchId: 2, date: "2026-05-26", time: "14:00", status: "confirmed", source: "instagram", amount: 600 },
  { id: 48, customerId: 10, customerName: "Rohan Das", staffId: 9, staffName: "Divya Joshi", serviceId: 5, serviceName: "Manicure", branchId: 2, date: "2026-05-26", time: "17:30", status: "completed", source: "whatsapp", amount: 500 },
  { id: 49, customerId: 4, customerName: "Rahul Verma", staffId: 7, staffName: "Mohammed Irfan", serviceId: 7, serviceName: "Beard Trim", branchId: 2, date: "2026-05-26", time: "19:00", status: "pending", source: "website", amount: 150 },
  { id: 50, customerId: 11, customerName: "Karan Johar", staffId: 8, staffName: "Rajesh Kulkarni", serviceId: 9, serviceName: "Hair Spa", branchId: 2, date: "2026-05-26", time: "09:30", status: "completed", source: "call", amount: 1200 },

  // --- BRANCH 3: GACHIBOWLI (25 appointments on target date) ---
  { id: 51, customerId: 5, customerName: "Sneha Gupta", staffId: 12, staffName: "Deepak Nair", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-26", time: "15:00", status: "confirmed", source: "instagram", amount: 1200 },
  { id: 52, customerId: 8, customerName: "Vikram Rathore", staffId: 11, staffName: "Sunita Patel", serviceId: 6, serviceName: "Pedicure", branchId: 3, date: "2026-05-26", time: "10:00", status: "completed", source: "walkin", amount: 600 },
  { id: 53, customerId: 12, customerName: "Preity Zinta", staffId: 13, staffName: "Suresh Rao", serviceId: 3, serviceName: "Hair Color", branchId: 3, date: "2026-05-26", time: "11:30", status: "completed", source: "call", amount: 1500 },
  { id: 54, customerId: 15, customerName: "Ranbir Kapoor", staffId: 12, staffName: "Deepak Nair", serviceId: 1, serviceName: "Haircut (Men)", branchId: 3, date: "2026-05-26", time: "09:00", status: "completed", source: "whatsapp", amount: 300 },
  { id: 55, customerId: 5, customerName: "Sneha Gupta", staffId: 14, staffName: "Tina Fernandes", serviceId: 4, serviceName: "Facial", branchId: 3, date: "2026-05-26", time: "13:00", status: "completed", source: "website", amount: 800 },
  { id: 56, customerId: 8, customerName: "Vikram Rathore", staffId: 12, staffName: "Deepak Nair", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-26", time: "14:00", status: "inprogress", source: "instagram", amount: 1200 },
  { id: 57, customerId: 12, customerName: "Preity Zinta", staffId: 11, staffName: "Sunita Patel", serviceId: 5, serviceName: "Manicure", branchId: 3, date: "2026-05-26", time: "16:30", status: "confirmed", source: "walkin", amount: 500 },
  { id: 58, customerId: 15, customerName: "Ranbir Kapoor", staffId: 14, staffName: "Tina Fernandes", serviceId: 8, serviceName: "Waxing (Full Arms)", branchId: 3, date: "2026-05-26", time: "17:00", status: "confirmed", source: "call", amount: 400 },
  { id: 59, customerId: 5, customerName: "Sneha Gupta", staffId: 13, staffName: "Suresh Rao", serviceId: 2, serviceName: "Haircut (Women)", branchId: 3, date: "2026-05-26", time: "12:00", status: "completed", source: "whatsapp", amount: 600 },
  { id: 60, customerId: 8, customerName: "Vikram Rathore", staffId: 14, staffName: "Tina Fernandes", serviceId: 4, serviceName: "Facial", branchId: 3, date: "2026-05-26", time: "18:00", status: "pending", source: "website", amount: 800 },
  { id: 61, customerId: 12, customerName: "Preity Zinta", staffId: 12, staffName: "Deepak Nair", serviceId: 1, serviceName: "Haircut (Men)", branchId: 3, date: "2026-05-26", time: "19:00", status: "pending", source: "instagram", amount: 300 },
  { id: 62, customerId: 22, customerName: "Rohit Sharma", staffId: 12, staffName: "Deepak Nair", serviceId: 1, serviceName: "Haircut (Men)", branchId: 3, date: "2026-05-26", time: "10:30", status: "completed", source: "walkin", amount: 300 },
  { id: 63, customerId: 25, customerName: "Shreya Ghoshal", staffId: 13, staffName: "Suresh Rao", serviceId: 3, serviceName: "Hair Color", branchId: 3, date: "2026-05-26", time: "13:30", status: "completed", source: "whatsapp", amount: 1500 },
  { id: 64, customerId: 29, customerName: "Aamir Khan", staffId: 14, staffName: "Tina Fernandes", serviceId: 4, serviceName: "Facial", branchId: 3, date: "2026-05-26", time: "15:30", status: "completed", source: "website", amount: 800 },
  { id: 65, customerId: 35, customerName: "KL Rahul", staffId: 15, staffName: "Ananya Roy", serviceId: 1, serviceName: "Haircut (Men)", branchId: 3, date: "2026-05-26", time: "09:30", status: "completed", source: "call", amount: 300 },
  { id: 66, customerId: 36, customerName: "Rishabh Pant", staffId: 15, staffName: "Ananya Roy", serviceId: 7, serviceName: "Beard Trim", branchId: 3, date: "2026-05-26", time: "11:00", status: "completed", source: "whatsapp", amount: 150 },
  { id: 67, customerId: 38, customerName: "Ravindra Jadeja", staffId: 13, staffName: "Suresh Rao", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-26", time: "16:00", status: "inprogress", source: "instagram", amount: 1200 },
  { id: 68, customerId: 41, customerName: "Samantha Prabhu", phone: "9990011225", staffId: 11, staffName: "Sunita Patel", serviceId: 5, serviceName: "Manicure", branchId: 3, date: "2026-05-26", time: "14:30", status: "completed", source: "website", amount: 500 },
  { id: 69, customerId: 46, customerName: "Akshay Kumar", staffId: 12, staffName: "Deepak Nair", serviceId: 1, serviceName: "Haircut (Men)", branchId: 3, date: "2026-05-26", time: "12:30", status: "completed", source: "walkin", amount: 300 },
  { id: 70, customerId: 47, customerName: "Rashmika Mandanna", staffId: 14, staffName: "Tina Fernandes", serviceId: 4, serviceName: "Facial", branchId: 3, date: "2026-05-26", time: "17:30", status: "confirmed", source: "whatsapp", amount: 800 },
  { id: 71, customerId: 50, customerName: "Kamal Haasan", staffId: 15, staffName: "Ananya Roy", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-26", time: "18:30", status: "confirmed", source: "call", amount: 1200 },
  { id: 72, customerId: 8, customerName: "Vikram Rathore", staffId: 11, staffName: "Sunita Patel", serviceId: 6, serviceName: "Pedicure", branchId: 3, date: "2026-05-26", time: "19:00", status: "pending", source: "website", amount: 600 },
  { id: 73, customerId: 12, customerName: "Preity Zinta", staffId: 13, staffName: "Suresh Rao", serviceId: 2, serviceName: "Haircut (Women)", branchId: 3, date: "2026-05-26", time: "10:30", status: "completed", source: "instagram", amount: 600 },
  { id: 74, customerId: 22, customerName: "Rohit Sharma", staffId: 12, staffName: "Deepak Nair", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-26", time: "11:00", status: "completed", source: "website", amount: 1200 },
  { id: 75, customerId: 25, customerName: "Shreya Ghoshal", staffId: 14, staffName: "Tina Fernandes", serviceId: 8, serviceName: "Waxing (Full Arms)", branchId: 3, date: "2026-05-26", time: "16:00", status: "completed", source: "call", amount: 400 },

  // --- Historical/Weekly Trend Data (spread over previous 6 days: May 20 to May 25) ---
  // May 25 (Monday)
  { id: 76, customerId: 10, customerName: "Rohan Das", staffId: 1, staffName: "Ravi Kumar", serviceId: 1, serviceName: "Haircut (Men)", branchId: 1, date: "2026-05-25", time: "11:00", status: "completed", source: "walkin", amount: 300 },
  { id: 77, customerId: 20, customerName: "Sachin Tendulkar", staffId: 6, staffName: "Anjali Reddy", serviceId: 10, serviceName: "Bridal Makeup", branchId: 2, date: "2026-05-25", time: "10:00", status: "completed", source: "website", amount: 8000 },
  { id: 78, customerId: 30, customerName: "Kiara Advani", staffId: 12, staffName: "Deepak Nair", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-25", time: "15:00", status: "completed", source: "whatsapp", amount: 1200 },
  
  // May 24 (Sunday)
  { id: 79, customerId: 11, customerName: "Karan Johar", staffId: 2, staffName: "Priya Sharma", serviceId: 3, serviceName: "Hair Color", branchId: 1, date: "2026-05-24", time: "14:00", status: "completed", source: "call", amount: 1500 },
  { id: 80, customerId: 44, customerName: "Aishwarya Rai", staffId: 8, staffName: "Rajesh Kulkarni", serviceId: 9, serviceName: "Hair Spa", branchId: 2, date: "2026-05-24", time: "16:30", status: "completed", source: "website", amount: 1200 },
  { id: 81, customerId: 47, customerName: "Rashmika Mandanna", staffId: 14, staffName: "Tina Fernandes", serviceId: 4, serviceName: "Facial", branchId: 3, date: "2026-05-24", time: "12:00", status: "completed", source: "instagram", amount: 800 },

  // May 23 (Saturday)
  { id: 82, customerId: 21, customerName: "MS Dhoni", staffId: 1, staffName: "Ravi Kumar", serviceId: 1, serviceName: "Haircut (Men)", branchId: 1, date: "2026-05-23", time: "13:00", status: "completed", source: "whatsapp", amount: 300 },
  { id: 83, customerId: 14, customerName: "Kareena Kapoor", staffId: 9, staffName: "Divya Joshi", serviceId: 5, serviceName: "Manicure", branchId: 2, date: "2026-05-23", time: "10:30", status: "completed", source: "walkin", amount: 500 },
  { id: 84, customerId: 5, customerName: "Sneha Gupta", staffId: 11, staffName: "Sunita Patel", serviceId: 6, serviceName: "Pedicure", branchId: 3, date: "2026-05-23", time: "11:30", status: "completed", source: "website", amount: 600 },

  // May 22 (Friday)
  { id: 85, customerId: 9, customerName: "Tanvi Shah", staffId: 4, staffName: "Nisha Sen", serviceId: 4, serviceName: "Facial", branchId: 1, date: "2026-05-22", time: "15:00", status: "completed", source: "website", amount: 800 },
  { id: 86, customerId: 3, customerName: "Kavya Rao", staffId: 6, staffName: "Anjali Reddy", serviceId: 10, serviceName: "Bridal Makeup", branchId: 2, date: "2026-05-22", time: "10:00", status: "completed", source: "instagram", amount: 8000 },
  { id: 87, customerId: 12, customerName: "Preity Zinta", staffId: 13, staffName: "Suresh Rao", serviceId: 3, serviceName: "Hair Color", branchId: 3, date: "2026-05-22", time: "12:00", status: "completed", source: "call", amount: 1500 },

  // May 21 (Thursday)
  { id: 88, customerId: 13, customerName: "Hrithik Roshan", staffId: 1, staffName: "Ravi Kumar", serviceId: 9, serviceName: "Hair Spa", branchId: 1, date: "2026-05-21", time: "16:00", status: "completed", source: "whatsapp", amount: 1200 },
  { id: 89, customerId: 23, customerName: "Hardik Pandya", staffId: 7, staffName: "Mohammed Irfan", serviceId: 1, serviceName: "Haircut (Men)", branchId: 2, date: "2026-05-21", time: "13:00", status: "completed", source: "walkin", amount: 300 },
  { id: 90, customerId: 8, customerName: "Vikram Rathore", staffId: 12, staffName: "Deepak Nair", serviceId: 9, serviceName: "Hair Spa", branchId: 3, date: "2026-05-21", time: "14:00", status: "completed", source: "website", amount: 1200 },

  // May 20 (Wednesday)
  { id: 91, customerId: 44, customerName: "Aishwarya Rai", staffId: 2, staffName: "Priya Sharma", serviceId: 2, serviceName: "Haircut (Women)", branchId: 1, date: "2026-05-20", time: "10:00", status: "completed", source: "website", amount: 600 },
  { id: 92, customerId: 28, customerName: "Shah Rukh Khan", staffId: 8, staffName: "Rajesh Kulkarni", serviceId: 9, serviceName: "Hair Spa", branchId: 2, date: "2026-05-20", time: "11:30", status: "completed", source: "whatsapp", amount: 1200 },
  { id: 93, customerId: 15, customerName: "Ranbir Kapoor", staffId: 14, staffName: "Tina Fernandes", serviceId: 4, serviceName: "Facial", branchId: 3, date: "2026-05-20", time: "12:00", status: "completed", source: "call", amount: 800 }
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
