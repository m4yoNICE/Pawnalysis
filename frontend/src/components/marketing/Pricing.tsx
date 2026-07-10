import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    body: "For a quick look at a single game.",
    features: [
      "One analysis per day",
      "Unlimited PGN analysis",
      "Full move-by-move board replay",
      "One coach personality",
      "Stockfish evaluation to depth 15",
    ],
    cta: { label: "Analyze a game", href: "/game" },
    featured: false,
  },
  {
    name: "Pro",
    price: "$6",
    period: "/ month",
    body: "For players tracking progress across games.",
    features: [
      "Everything in Free",
      "Save and revisit every game",
      "All coach personalities",
      "Stockfish evaluation to depth 25",
      "Priority analysis queue",
    ],
    cta: { label: "Get Pro", href: "/login" },
    featured: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-t border-[#E7E0F3] bg-[#FBFAFE] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-wide text-[#B3ABC9]">
          [Event &quot;Pricing&quot;]
        </p>
        <h2 className="mt-3 max-w-lg font-mono text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">
          Analyze free. Subscribe to keep score.
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:max-w-2xl">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 ${
                tier.featured
                  ? "border-2 border-[#6A5E8C] bg-white shadow-lg shadow-[#7B6FA0]/10"
                  : "border border-[#E7E0F3] bg-white"
              }`}
            >
              <h3 className="font-mono text-sm font-semibold tracking-wide text-[#1A1A1A]">
                {tier.name}
              </h3>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-semibold text-[#1A1A1A]">
                  {tier.price}
                </span>
                <span className="text-sm text-[#6B6B6B]">{tier.period}</span>
              </p>
              <p className="mt-2 text-sm text-[#6B6B6B]">{tier.body}</p>

              <ul className="mt-6 flex flex-col gap-2.5">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-baseline gap-2 text-sm text-[#1A1A1A]"
                  >
                    <span
                      className="font-mono text-[#7B6FA0]"
                      aria-hidden
                    >
                      ·
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.cta.href}
                className={`mt-8 block rounded-lg px-5 py-2.5 text-center text-sm font-semibold transition-colors ${
                  tier.featured
                    ? "bg-[#6A5E8C] text-white shadow-sm shadow-[#6A5E8C]/20 hover:bg-[#584D77]"
                    : "border border-[#E7E0F3] text-[#6A5E8C] hover:bg-[#F3EFFE]"
                }`}
              >
                {tier.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}