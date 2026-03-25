import { Navigation2Icon, ClockIcon, BarChart3Icon, TrainFrontIcon, RouteIcon, ShieldCheckIcon } from "lucide-react";
import type { IFeature } from "../../types";

export const features: IFeature[] = [
    {
        icon: ClockIcon,
        title: "Smart Departure Timing",
        description: "Our algorithm scans multiple departure windows and picks the time with the lowest travel duration — accounting for real-time traffic peaks and off-peak patterns.",
        cardBg: "bg-orange-50",
        iconBg: "bg-orange-500"
    },
    {
        icon: BarChart3Icon,
        title: "Live Traffic Analysis",
        description: "Pulls real-time congestion data and factors in time-of-day traffic patterns, so your commute plan adapts to what's actually happening on the road.",
        cardBg: "bg-violet-50",
        iconBg: "bg-violet-500"
    },
    {
        icon: TrainFrontIcon,
        title: "Multi-Modal Comparison",
        description: "Compares driving, public transit, cycling, and walking side-by-side. See duration, distance, and congestion for every mode — ranked by efficiency.",
        cardBg: "bg-blue-50",
        iconBg: "bg-blue-500"
    },
    {
        icon: RouteIcon,
        title: "Route Optimization",
        description: "Get the fastest route with one-click navigation to Google Maps. Detailed distance, ETA, and traffic factor for your exact source-to-destination path.",
        cardBg: "bg-green-50",
        iconBg: "bg-green-500"
    },
    {
        icon: Navigation2Icon,
        title: "Flexibility Windows",
        description: "Set how flexible your arrival time is (±0 to 120 minutes). The engine tests every 5-minute slot within your window to find the sweet spot.",
        cardBg: "bg-amber-50",
        iconBg: "bg-amber-500"
    },
    {
        icon: ShieldCheckIcon,
        title: "Secure & Private",
        description: "Your schedules are protected with Supabase Row-Level Security. Only you can see, edit, or delete your own travel data — end-to-end.",
        cardBg: "bg-rose-50",
        iconBg: "bg-rose-500"
    }
];
