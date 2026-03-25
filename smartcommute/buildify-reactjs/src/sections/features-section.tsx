import { ArrowUpRightIcon, SparkleIcon } from "lucide-react";
import { features } from "../data/features";
import AnimatedContent from "../components/animated-content";
import SectionTitle from "../components/section-title";
import { Link } from "react-router-dom";

export default function FeaturesSection() {
    return (
        <section id="features" className="px-4 md:px-16 lg:px-24 xl:px-32">
            <div className="grid grid-cols-1 md:grid-cols-2 border-x md:divide-x border-[var(--border)] divide-[var(--border)] max-w-7xl mx-auto">
                <div>
                    <div className="p-4 pt-16 md:p-16 flex flex-col items-start md:sticky md:top-26">
                        <SectionTitle
                            dir="left"
                            icon={SparkleIcon}
                            title="Core Features"
                            subtitle="Everything you need to optimize your daily commute — schedule analysis, real-time traffic, multi-modal comparison, and smart routing."
                        />
                        <AnimatedContent className="p-4 md:p-6 bg-[var(--accent)] w-full rounded-xl mt-12">
                            <p className="text-lg text-[var(--accent-text)]">
                                Trusted by commuters who want to arrive on time, every time.
                            </p>
                            <Link to="/signup" className="bg-[var(--bg-card)] text-[var(--text-primary)] w-max hover:opacity-90 px-5 py-2 rounded-full mt-6 flex items-center gap-1 transition-opacity">
                                Start Optimizing
                                <ArrowUpRightIcon size={20} />
                            </Link>
                        </AnimatedContent>
                    </div>
                </div>
                <div className="p-4 pt-16 md:p-16 space-y-6">
                    {features.map((feature, index) => (
                        <AnimatedContent key={index} className="bg-[var(--bg-muted)] flex flex-col items-start p-6 rounded-xl w-full md:sticky md:top-26">
                            <div className="bg-[var(--feature-icon-bg)] text-[var(--feature-icon-text)] p-2 rounded-md">
                                <feature.icon />
                            </div>
                            <p className="text-base font-medium mt-4">{feature.title}</p>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">{feature.description}</p>
                        </AnimatedContent>
                    ))}
                </div>
            </div>
        </section>
    )
}
