import CountUp from "../components/count-number";

export default function StatsSection() {
    return (
        <section className="border-y border-[var(--border)] py-10 px-4 md:px-16 lg:px-24 xl:px-32">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <h3 className="text-4xl font-semibold font-urbanist">
                        <CountUp from={0} to={35} />%
                    </h3>
                    <p className="text-[var(--text-secondary)]">Average commute time saved</p>
                </div>
                <div className="flex flex-col items-center gap-4 text-center">
                    <h3 className="text-4xl font-semibold font-urbanist">
                        <CountUp from={0} to={4} />
                    </h3>
                    <p className="text-[var(--text-secondary)]">Transport modes compared</p>
                </div>
                <div className="flex flex-col items-center gap-4 text-center">
                    <h3 className="text-4xl font-semibold font-urbanist">
                        <CountUp from={0} to={5} />min
                    </h3>
                    <p className="text-[var(--text-secondary)]">Scan interval precision</p>
                </div>
                <div className="flex flex-col items-center gap-4 text-center">
                    <h3 className="text-4xl font-semibold font-urbanist">
                        <CountUp from={0} to={99.9} />%
                    </h3>
                    <p className="text-[var(--text-secondary)]">On-time arrival rate</p>
                </div>
            </div>
        </section>
    );
}
