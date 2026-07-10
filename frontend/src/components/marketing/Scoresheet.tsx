// The hero's signature element: a real annotated opening fragment, not a
// decorative board mockup. Grade glyph and colors match
// src/lib/utils/classifications.ts exactly, so the marketing page never
// shows a symbol the product itself wouldn't produce.

const INACCURACY_COLOR = "#F1C40F";

export default function Scoresheet() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[#E7E0F3] bg-white p-6 text-left shadow-[0_1px_0_#E7E0F3]">
      {/* PGN tag pairs */}
      <div className="font-mono text-[11px] leading-relaxed text-[#B3ABC9]">
        <p>[White &quot;You&quot;]</p>
        <p>[Black &quot;Engine&quot;]</p>
        <p>[Result &quot;*&quot;]</p>
      </div>

      {/* Move line */}
      <p className="mt-4 font-mono text-lg leading-snug text-[#1A1A1A] sm:text-xl">
        <span className="text-[#B3ABC9]">1.</span> d4{" "}
        <span className="text-[#B3ABC9]">e5</span>
        <span
          className="ml-0.5 font-bold"
          style={{ color: INACCURACY_COLOR }}
          aria-hidden
        >
          ?!
        </span>
      </p>

      <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
        <span className="font-semibold text-[#1A1A1A]">Dubious.</span> Giving
        up the center on move one — Stockfish likes White by nearly a pawn.
      </p>

      {/* Eval bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between font-mono text-[11px] text-[#B3ABC9]">
          <span>eval</span>
          <span className="text-[#1A1A1A]">+0.8</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#F3EFFE]">
          <div
            className="h-full origin-left rounded-full bg-[#7B6FA0] motion-safe:animate-[eval-fill_1.1s_ease-out_forwards]"
            style={{ width: "63%" }}
          />
        </div>
      </div>
    </div>
  );
}