import type { IFaq } from "../../types";

export const faqs: IFaq[] = [
    {
        question: "How does SmartCommute calculate optimal departure times?",
        answer: "Our recommendation engine scans departure windows at 5-minute intervals within your flexibility range. For each candidate, it simulates traffic conditions, estimates travel duration, and checks if you'd arrive within your acceptable window. The departure with the shortest travel time wins."
    },
    {
        question: "What traffic data source does SmartCommute use?",
        answer: "Currently, SmartCommute uses a realistic simulation engine that models morning and evening peak hours, off-peak patterns, and mode-specific impacts. The architecture is designed to plug in Google Maps Distance Matrix API or OpenRouteService when you're ready to go live."
    },
    {
        question: "Which transport modes are compared?",
        answer: "SmartCommute evaluates four modes: driving, public transit, bicycling, and walking. Each mode has different traffic sensitivity — driving gets the full traffic multiplier, transit 60%, bicycling 30%, and walking is unaffected by road congestion."
    },
    {
        question: "Is my schedule data secure?",
        answer: "Absolutely. Schedules are stored in Supabase PostgreSQL with Row-Level Security (RLS) policies. Every database query is scoped to your authenticated user ID. Backend routes are protected with JWT verification, and no user can access another user's data."
    },
    {
        question: "Can I use SmartCommute without a Google Maps API key?",
        answer: "Yes. The mock traffic service generates realistic, deterministic traffic simulations so you can develop, test, and demo the full workflow without any API key. Swap to a real provider anytime by updating the traffic service module."
    },
    {
        question: "What does the flexibility window do?",
        answer: "It tells the engine how much earlier or later than your target you're willing to arrive. A ±30 min window means you're okay arriving 30 minutes before or after your preferred time. Wider windows give the engine more room to find low-traffic slots."
    }
];
