import { Transaction } from "../types";

// Startup Founder Dataset:
// Heavily features Subscriptions, late night Food, high Shopping items, and steady high Income.
export const FOUNDER_DATASET: Transaction[] = [
  { id: "tx_1", date: "2026-06-01", time: "09:12", description: "Blue Bottle Coffee", amount: 450, category: "Food", merchant: "Blue Bottle" },
  { id: "tx_2", date: "2026-06-01", time: "12:30", description: "Client Lunch - Blue Ribbon", amount: 4800, category: "Food", merchant: "Blue Ribbon Sushi" },
  { id: "tx_3", date: "2026-06-02", time: "23:45", description: "Slack Monthly Enterprise Premium", amount: 15400, category: "Subscriptions", merchant: "Slack" },
  { id: "tx_4", date: "2026-06-02", time: "18:40", description: "Uber Premium Comfort Rider", amount: 1450, category: "Entertainment", merchant: "Uber" },
  { id: "tx_5", date: "2026-06-03", time: "01:15", description: "Late Night Sushi Delivery", amount: 2600, category: "Food", merchant: "Zomato" },
  { id: "tx_6", date: "2026-06-03", time: "14:10", description: "Apple Store - USB-C Hubs", amount: 8900, category: "Shopping", merchant: "Apple" },
  { id: "tx_7", date: "2026-06-04", time: "08:30", description: "AWS Cloud Invoicing recurring", amount: 34500, category: "Subscriptions", merchant: "AWS" },
  { id: "tx_8", date: "2026-06-04", time: "13:00", description: "Sweetgreen", amount: 950, category: "Food", merchant: "Sweetgreen" },
  { id: "tx_9", date: "2026-06-05", time: "21:00", description: "Vercel Enterprise Pro", amount: 12000, category: "Subscriptions", merchant: "Vercel" },
  { id: "tx_10", date: "2026-06-05", time: "23:10", description: "Uber Comfort ride home", amount: 1950, category: "Entertainment", merchant: "Uber" },
  { id: "tx_11", date: "2026-06-06", time: "19:30", description: "Founders Dinner, Malt and Spirits", amount: 18500, category: "Entertainment", merchant: "The Whiskey Library" },
  { id: "tx_12", date: "2026-06-06", time: "00:45", description: "Gourmet Pizza Midnight Craving", amount: 2200, category: "Food", merchant: "Zomato" },
  { id: "tx_13", date: "2026-06-07", time: "15:00", description: "Herman Miller Office Chair (Impulse Hub)", amount: 84000, category: "Shopping", merchant: "Herman Miller" },
  { id: "tx_14", date: "2026-06-08", time: "09:00", description: "Stripe payout incoming", amount: -280000, category: "Income", merchant: "Stripe" },
  { id: "tx_15", date: "2026-06-08", time: "11:00", description: "Linear App Teams subscription", amount: 3500, category: "Subscriptions", merchant: "Linear" },
  { id: "tx_16", date: "2026-06-09", time: "23:20", description: "GitHub Copilot and API Usage", amount: 5600, category: "Subscriptions", merchant: "GitHub" },
  { id: "tx_17", date: "2026-06-10", time: "18:15", description: "High-Beta Ergonomic Keyboard", amount: 24500, category: "Shopping", merchant: "MechanicalKeyboards" },
  { id: "tx_18", date: "2026-06-10", time: "22:50", description: "ChatGPT Plus Billing Sub", amount: 1650, category: "Subscriptions", merchant: "OpenAI" },
  { id: "tx_19", date: "2026-06-11", time: "13:40", description: "Blue Bottle Coffee", amount: 480, category: "Food", merchant: "Blue Bottle" },
  { id: "tx_20", date: "2026-06-12", time: "02:10", description: "Late Night Indian Bistro Order", amount: 3100, category: "Food", merchant: "Zomato" },
  { id: "tx_21", date: "2026-06-13", time: "20:00", description: "Drinks with core investors", amount: 14000, category: "Entertainment", merchant: "Highball Club" },
  { id: "tx_22", date: "2026-06-14", time: "16:10", description: "Amazon Web Services On-Demand extra", amount: 18000, category: "Subscriptions", merchant: "AWS" },
  { id: "tx_23", date: "2026-06-15", time: "11:15", description: "Framer Pro subscription", amount: 2800, category: "Subscriptions", merchant: "Framer" }
];

// Urban High-Earner Spendthrift Custom data:
// High on food-delivery (Zomato dependencies), weekend overspending, retail dopamine clicks.
export const URBAN_HIGH_EARNER: Transaction[] = [
  { id: "tx_a1", date: "2026-06-01", time: "08:15", description: "Starbucks Triple Espresso", amount: 390, category: "Food", merchant: "Starbucks" },
  { id: "tx_a2", date: "2026-06-01", time: "22:10", description: "Amazon Electronics Impulse", amount: 18500, category: "Shopping", merchant: "Amazon" },
  { id: "tx_a3", date: "2026-06-02", time: "12:15", description: "Zomato Premium Lunch box", amount: 1450, category: "Food", merchant: "Zomato" },
  { id: "tx_a4", date: "2026-06-02", time: "20:45", description: "Netflix Premium Tier", amount: 650, category: "Subscriptions", merchant: "Netflix" },
  { id: "tx_a5", date: "2026-06-03", time: "13:00", description: "Starbucks Flat White", amount: 420, category: "Food", merchant: "Starbucks" },
  { id: "tx_a6", date: "2026-06-03", time: "23:55", description: "Midnight Wings on Zomato", amount: 1980, category: "Food", merchant: "Zomato" },
  { id: "tx_a7", date: "2026-06-04", time: "10:15", description: "Salary Deposit monthly", amount: -185000, category: "Income", merchant: "Corporate Payroll" },
  { id: "tx_a8", date: "2026-06-04", time: "19:00", description: "Zara Designer Overcoat", amount: 14900, category: "Shopping", merchant: "Zara" },
  { id: "tx_a9", date: "2026-06-05", time: "08:00", description: "Starbucks Cold Brew", amount: 440, category: "Food", merchant: "Starbucks" },
  { id: "tx_a10", date: "2026-06-05", time: "23:30", description: "Friday Night Lounge Spirits", amount: 11200, category: "Entertainment", merchant: "Luna Skylounge" },
  { id: "tx_a11", date: "2026-06-06", time: "13:00", description: "Weekend Brunch with friends", amount: 5600, category: "Food", merchant: "The Sourdough Cafe" },
  { id: "tx_a12", date: "2026-06-06", time: "20:15", description: "Concert Premium Passes", amount: 12500, category: "Entertainment", merchant: "TicketGenie" },
  { id: "tx_a13", date: "2026-06-07", time: "14:30", description: "Apple Watch Series X (Impulse click)", amount: 45000, category: "Shopping", merchant: "Apple" },
  { id: "tx_a14", date: "2026-06-07", time: "01:20", description: "Late Uber ride under surge price", amount: 2850, category: "Entertainment", merchant: "Uber" },
  { id: "tx_a15", date: "2026-06-08", time: "22:45", description: "Audible Audiobooks billing", amount: 890, category: "Subscriptions", merchant: "Audible" },
  { id: "tx_a16", date: "2026-06-09", time: "12:15", description: "Zomato Sushi Order", amount: 1850, category: "Food", merchant: "Zomato" },
  { id: "tx_a17", date: "2026-06-10", time: "08:15", description: "Starbucks flat white", amount: 420, category: "Food", merchant: "Starbucks" },
  { id: "tx_a18", date: "2026-06-11", time: "21:30", description: "Amazon Household shopping", amount: 4900, category: "Shopping", merchant: "Amazon" },
  { id: "tx_a19", date: "2026-06-12", time: "23:50", description: "Midnight Diner Dessert Burst", amount: 2300, category: "Food", merchant: "Zomato" },
  { id: "tx_a20", date: "2026-06-13", time: "19:00", description: "Saturday Night Cocktail Fest", amount: 16400, category: "Entertainment", merchant: "Whiskey Vault" },
  { id: "tx_a21", date: "2026-06-14", time: "13:00", description: "Uber Ride Weekend high-demand", amount: 1900, category: "Entertainment", merchant: "Uber" },
  { id: "tx_a22", date: "2026-06-15", time: "18:00", description: "PlayStation Store recurring subscription", amount: 1200, category: "Subscriptions", merchant: "Sony Interactive" },
  { id: "tx_a23", date: "2026-06-15", time: "23:15", description: "Late night ice cream craving", amount: 1100, category: "Food", merchant: "Zomato" }
];

// Optimized Minimalist:
// Super high discipline, high income to savings ratio, extremely clean profile.
export const MINIMALIST_DATASET: Transaction[] = [
  { id: "tx_m1", date: "2026-06-01", time: "10:00", description: "Salary Deposit monthly", amount: -150000, category: "Income", merchant: "Hedge Fund Operations" },
  { id: "tx_m2", date: "2026-06-01", time: "12:00", description: "Organic Health Wholesaler Groceries", amount: 4500, category: "Food", merchant: "Whole Foods" },
  { id: "tx_m3", date: "2026-06-02", time: "09:00", description: "Gym & Athletics Membership recurring", amount: 2000, category: "Subscriptions", merchant: "Equinox Elite" },
  { id: "tx_m4", date: "2026-06-03", time: "14:00", description: "Indie Publisher Book purchase", amount: 890, category: "Shopping", merchant: "Paperbark Books" },
  { id: "tx_m5", date: "2026-06-05", time: "13:00", description: "Local Roastery beans for the month", amount: 1200, category: "Food", merchant: "Roastery Co." },
  { id: "tx_m6", date: "2026-06-07", time: "10:30", description: "Whole Foods groceries sweep", amount: 3200, category: "Food", merchant: "Whole Foods" },
  { id: "tx_m7", date: "2026-06-08", time: "19:00", description: "High-grade leather portfolio (long durability)", amount: 5500, category: "Shopping", merchant: "LeatherGoods" },
  { id: "tx_m8", date: "2026-06-10", time: "20:00", description: "Artisanal bakery organic bread", amount: 600, category: "Food", merchant: "Sourdough Lab" },
  { id: "tx_m9", date: "2026-06-12", time: "11:00", description: "Spotify single sub", amount: 179, category: "Subscriptions", merchant: "Spotify" },
  { id: "tx_m10", date: "2026-06-14", time: "15:00", description: "Whole Foods supplemental", amount: 1800, category: "Food", merchant: "Whole Foods" }
];
