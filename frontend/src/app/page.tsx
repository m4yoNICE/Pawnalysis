import Link from "next/link";
import Header from "@/components/Header";
import Scoresheet from "@/components/marketing/Scoresheet";

const gradedFeatures = [
  {
    symbol: "!!",
    color: "#21B1E0",
    title: "Every move, graded",
    body: "Six grades from brilliant to blunder, straight from Stockfish's evaluation — not a vague good/bad.",
  },
  {
    symbol: "?!",
    color: "#F1C40F",
    title: "Commentary on what mattered",
    body: "An AI coach explains why a move helped or hurt, in plain language — pick the personality that fits how you learn.",
  },
  {
    symbol: "??",
    color: "#E74C3C",
    title: "See where it turned",
    body: "Step through the board move by move and watch the evaluation swing at the exact point things went wrong.",
  },
];

const steps = [
  {
    n: "1.",
    title: "Paste your PGN",
    body: "Any game from Chess.com, Lichess, or typed up from a scoresheet.",
  },
  {
    n: "2.",
    title: "Let the engine run",
    body: "Stockfish scores every position while the AI writes the commentary.",
  },
  {
    n: "3.",
    title: "Read where you went wrong",
    body: "Step through the game, move by move, with a grade and a reason for each one.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="font-mono text-xs tracking-wide text-[#B3ABC9]">
              [Event &quot;Post-game review&quot;]
            </p>
            <h1 className="mt-4 font-mono text-4xl font-semibold leading-[1.15] tracking-tight text-[#1A1A1A] sm:text-5xl">
              Find the move
              <br />
              you didn&apos;t see.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-[#6B6B6B]">
              Paste a PGN. Get an engine grade for every move, plus a coach&apos;s
              take on why it mattered.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/game"
                className="rounded-lg bg-[#6A5E8C] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-[#6A5E8C]/20 transition-colors hover:bg-[#584D77]"
              >
                Analyze a game
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-[#E7E0F3] bg-white px-6 py-3 text-center text-sm font-semibold text-[#6A5E8C] transition-colors hover:bg-[#F3EFFE]"
              >
                Sign in to save games
              </Link>
            </div>
          </div>

          <Scoresheet />
        </div>
      </section>

      {/* Features — presented as the product's own grade glyphs */}
      <section id="features" className="border-t border-[#E7E0F3] bg-[#FBFAFE] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-mono text-xs tracking-wide text-[#B3ABC9]">
            [Event &quot;What you get&quot;]
          </p>
          <h2 className="mt-3 max-w-lg font-mono text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">
            The same grades you&apos;d see from a strong coach.
          </h2>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {gradedFeatures.map((f) => (
              <div key={f.title}>
                <span
                  className="font-mono text-3xl font-bold"
                  style={{ color: f.color }}
                  aria-hidden
                >
                  {f.symbol}
                </span>
                <h3 className="mt-4 text-base font-semibold text-[#1A1A1A]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — numbered like moves, because it's a real sequence */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-mono text-xs tracking-wide text-[#B3ABC9]">
            [Event &quot;How it works&quot;]
          </p>
          <h2 className="mt-3 max-w-lg font-mono text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">
            Three moves to a finished review.
          </h2>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-3">
                <span className="font-mono text-sm font-semibold text-[#6B6B6B]">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#1A1A1A]">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#6B6B6B]">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — quiet, one bold moment already spent in the hero */}
      <section className="border-t border-[#E7E0F3] bg-[#F3EFFE] py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-mono text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">
            Your last game is still worth a second look.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[#6B6B6B]">
            No account needed to analyze. Sign in only if you want to keep it.
          </p>
          <Link
            href="/game"
            className="mt-7 inline-block rounded-lg bg-[#6A5E8C] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-[#6A5E8C]/20 transition-colors hover:bg-[#584D77]"
          >
            Analyze a game
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7E0F3]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <span className="font-mono text-sm font-semibold text-[#1A1A1A]">
            Pawn<span className="text-[#7B6FA0]">alysis</span>
          </span>
          <p className="text-xs text-[#9B9B9B]">
            Built with Stockfish &amp; AI commentary.
          </p>
        </div>
      </footer>
    </div>
  );
}