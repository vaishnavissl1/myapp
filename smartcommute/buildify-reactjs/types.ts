import type { LucideIcon } from "lucide-react";

// ── Buildify reusable component types ──────────────────────
export interface ILink {
    name: string;
    href: string;
};

export interface ICustomIcon {
    icon: LucideIcon;
    dir?: 'left' | 'right';
};

export interface ISectionTitle {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    dir?: 'left' | 'center';
};

export interface IFeature {
    icon: LucideIcon;
    title: string;
    description: string;
    cardBg?: string;
    iconBg?: string;
};

export interface IFaq {
    question: string;
    answer: string;
};

// ── SmartCommute domain types ──────────────────────────────
export interface ISchedule {
    id: string;
    user_id: string;
    source_location: string;
    source_lat?: number;
    source_lng?: number;
    destination_location: string;
    dest_lat?: number;
    dest_lng?: number;
    arrival_time: string;
    flexibility_minutes: number;
    transport_preference: TransportMode | 'any';
    created_at: string;
};

export type TransportMode = 'driving' | 'transit' | 'bicycling' | 'walking';

export interface ITransportOption {
    mode: TransportMode;
    duration: number;
    distance: number;
    congestion: CongestionLevel;
    trafficMultiplier: number;
    rank: number;
};

export type CongestionLevel = 'low' | 'medium' | 'high';

export interface IRecommendation {
    scheduleId: string;
    recommendation: {
        departureTime: string;
        arrivalTime: string;
        estimatedDuration: number;
        distance: number;
        congestion: CongestionLevel;
        trafficMultiplier: number;
    };
    transportModes: ITransportOption[];
    route: {
        summary: string;
        distance: number;
        navigationUrl: string;
    };
    generatedAt: string;
};