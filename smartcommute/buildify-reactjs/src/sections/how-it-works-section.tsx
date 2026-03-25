import AnimatedContent from "../components/animated-content";
import SectionTitle from "../components/section-title";
import { CircleDotIcon, MapPinIcon, ClockIcon, Navigation2Icon, ArrowRightIcon } from "lucide-react";

const steps = [
    {
        icon: CircleDotIcon,
        step: "01",
        title: "Enter Your Schedule",
        description: "Tell us where you're going, when you need to arrive, and how flexible you are. Choose your preferred transport mode or let us compare all of them."
    },
    {
        icon: MapPinIcon,
        step: "02",
        title: "We Analyze Traffic",
        description: "Our engine scans departure windows at 5-minute intervals, simulating traffic conditions for each time slot and each transport mode in your flexibility range."
    },
    {
        icon: ClockIcon,
        step: "03",
        title: "Get Your Optimal Plan",
        description: "Receive the best departure time, ranked transport modes, congestion levels, and a one-click Google Maps link — all computed in under 3 seconds."
    }
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="border-y border-[var(--border)] px-4 md:px-16 lg:px-24 xl:px-32">
            <div className="p-4 pt-20 md:p-20 flex flex-col items-center max-w-7xl mx-auto justify-center border-x border-[var(--border)]">
                <SectionTitle
                    icon={Navigation2Icon}
                    title="How It Works"
                    subtitle="Three simple steps from schedule input to optimized commute. No complex setup, no manual calculations."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
                    {steps.map((s, index) => (
                        <AnimatedContent key={index} delay={index * 0.12} className="relative p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--card-shadow)]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="bg-[var(--accent)] text-[var(--accent-text)] p-2.5 rounded-lg">
                                    <s.icon size={22} />
                                </div>
                                <span className="text-4xl font-urbanist font-bold text-[var(--bg-muted)]">{s.step}</span>
                            </div>
                            <h3 className="text-lg font-semibold font-urbanist">{s.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{s.description}</p>
                            {index < steps.length - 1 && (
                                <ArrowRightIcon size={20} className="absolute -right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hidden md:block" />
                            )}
                        </AnimatedContent>
                    ))}
                </div>
            </div>
        </section>
    );
}
