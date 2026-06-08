"use client";
import { SummaryProps } from "@/lib/Types";

export default function Summary({ summary }: SummaryProps) {
  return (
    <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm p-4">
      <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-widest mb-2">
        Summary
      </h2>
      <p className="text-sm text-[#3B3B3B] leading-relaxed">{summary}</p>
    </div>
  );
}
