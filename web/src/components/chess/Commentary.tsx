"use client";
import { CommentaryProps } from "@/lib/Types";

export default function Commentary({ commentary }: CommentaryProps) {
  if (!commentary) return null;
  return (
    <p className="text-xs text-[#6B6B6B] italic mt-1 leading-relaxed">
      {commentary}
    </p>
  );
}
