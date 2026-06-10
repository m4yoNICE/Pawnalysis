"use client";
import { PgnInputProps } from "@/lib/Types";


export default function PgnInput({
  pgn,
  onChange,
  onAnalyze,
  isLoading,
}: PgnInputProps) {
  return (
    <>
      <textarea
        value={pgn}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste PGN here..."
        className="w-full h-28 p-3 border border-[#E5E5E5] rounded-lg font-mono text-xs text-[#1A1A1A] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#575068]"
      />
      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className="w-full py-2.5 bg-[#F29A30] hover:bg-[#d98a25] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        {isLoading ? "Analyzing..." : "Analyze"}
      </button>
    </>
  );
}
